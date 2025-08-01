import axios from "axios";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const sendPromptToAI  = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { prompt, chatContextId } = req.body;
   const receiverId = req.body.receiverId || req.params.receiverId;

    // console.log(prompt);

    if (!prompt || !chatContextId) {
      return res.status(400).json({ error: "prompt and chatContextId are required" });
    }

    // 1) Save user's prompt as a message
    const promptMessage = new Message({
      senderId,
      // receiverId: process.env.AI_USER_ID, // could be null or your AI user ID if you want 
      receiverId,  // with whom the user is chatting
      text: prompt,
      chatContextId,
      status: "sent", 
    });
    const savedPrompt = await promptMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    // If receiver is online(it's receiverSocketId exist), mark message as delivered in DB
    if (receiverSocketId) {
      savedPrompt.status = "delivered";
      await savedPrompt.save();
      io.to(receiverSocketId).emit("newMessage", savedPrompt);
    }
    res.status(201).json(savedPrompt);

    // Emit to the user socket so they instantly see the user prompt
    const [userAId, userBId] = chatContextId.split("_");
    const userASocketId = getReceiverSocketId(userAId.toString()); // userAId is the receiverId
    const userBSocketId = getReceiverSocketId(userBId.toString()); // userBId is the senderid

    // Emit savedPrompt to both
    // if (userASocketId) io.to(userASocketId).emit("newMessage", savedPrompt); 
    // if (userBSocketId) io.to(userBSocketId).emit("newMessage", savedPrompt);  // instant message are set




    // 2) Call OpenRouter API to get AI response

    // const aiResponse = await axios.post(
    //   "https://openrouter.ai/api/v1/chat/completions",
    //   {
    //     model:"google/gemma-3-27b-it:free",
    //     // model:"google/gemini-2.0-flash-exp:free",
    //     messages: [
    //          { role: "system", content: "You are a polite, concise, helpful AI assistant who always explains clearly, answers in a professional, friendly tone, uses emojis to express emotion, highlights words to emphasize them, responds in a style similar to ChatGPT, and always ends every response with a new line containing a single, rephrased version of the question 'How else can I help you today?' asked in a different way each time. Ensure the rephrased question appears alone on its own line as the final part of your response." },
    //          { role: "user", content: prompt },
    //          ],
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    // const aiText = aiResponse?.data?.choices?.[0]?.message?.content || "AI could not generate a response.";


    // gemini my own api key inegration with Google client SDK:

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const SYSTEM_INSTRUCTIONS = `You are a polite, concise, helpful AI assistant who always explains clearly, answers in a professional, friendly tone, uses emojis if needed to express emotion, highlights words to emphasize them, responds in a style similar to ChatGPT, and always ends every response with a new line containing a single, rephrased version of the question 'How else can I help you today?' asked in a different way each time. Ensure the rephrased question appears alone on its own line as the final part of your response.`;
    const combinedPrompt = `${SYSTEM_INSTRUCTIONS}\n\nUser question: ${prompt}`;

    const chat = model.startChat();  
    const result = await chat.sendMessage(combinedPrompt);
    const aiText = result.response.text();



    // 3) Save AI's response as a new message
    const aiMessage = new Message({
      senderId: process.env.AI_USER_ID, // AI user ID in env 
      receiverId: senderId,
      text: aiText,
      chatContextId,
    });
    const savedReply = await aiMessage.save();

    // 4) Emit to the user socket so they instantly see AI reply

    // const receiverSocketId = getReceiverSocketId(senderId.toString());
    // if (receiverSocketId) {
    //   io.to(receiverSocketId).emit("newMessage", savedReply);
    // }

    // Emit savedReply to both user (AI response to both users)
    if (userASocketId) io.to(userASocketId).emit("newMessage", savedReply);
    if (userBSocketId) io.to(userBSocketId).emit("newMessage", savedReply);

    // res.status(201).json({ prompt: savedPrompt, reply: savedReply });
    // res.status(201).json(prompt: savedPrompt);
  } catch (error) {
    console.error("Error in  sendPromptToAI  controller:", error.response?.data || error.message);
     const status = error.response?.status || 500;
    res.status(status).json({ error: error?.response?.data?.error || "Failed to get AI reply", });
  }
};


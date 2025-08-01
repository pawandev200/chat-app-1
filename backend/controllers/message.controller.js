import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";



export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // from auth middleware

    // Get all users except the logged in user, and exclude the password field
    // ne = not equal, mongoose query to exclude the logged in user
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    // const { id: userToChatId } = req.params; //with whom the logged in user wants to chat
    const { chatContextId } = req.params; // new route param
    const myId = req.user._id; // from auth middleware, logged in user
    // console.log("Fetching messages for chatContextId:", chatContextId);


    // Find all messages between the logged in user and the user to chat
    // storing in an Array, of messages between two users, either the logged in user or the usertochat is sender
    // const messages = await Message.find({
    //   $or: [
    //     { senderId: myId, receiverId: userToChatId },
    //     { senderId: userToChatId, receiverId: myId },
    //   ],
    // });

    // Get all messages tied to this chat context
    const messages = await Message.find({ chatContextId })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");


    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, chatContextId } = req.body;
    const { id: receiverId } = req.params; // extracting receiverId and rename it to receiverId
    const senderId = req.user._id;

    if (!chatContextId) {
      return res.status(400).json({ error: "chatContextId is required" });
    }

    //if user sends an image then upload it to cloudinary and response url saving to database
    let imageUrl;
    if (image) { 
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, //storing in db for efficient retrieval, without additional steps and Consistency and Synchronization
      chatContextId,
      status: "sent", // default status when sending
    });

    await newMessage.save();

    //real-time functionality, sending message to the receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    // If receiver is online(it receiverSocketId exist), mark message as delivered in DB
    if (receiverSocketId) {
      newMessage.status = "delivered";
      await newMessage.save();

      io.to(receiverSocketId).emit("newMessage", newMessage); 
      // console.log(" newMessage emitted to:", receiverSocketId);

       // Notify sender about delivery
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: newMessage._id,
          status: "delivered",
          chatContextId: newMessage.chatContextId,
        });
      } 
    }else {
      // If receiver is offline, just send message as-is (status: sent)
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: newMessage._id,
          status: "sent",
          chatContextId: newMessage.chatContextId,
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

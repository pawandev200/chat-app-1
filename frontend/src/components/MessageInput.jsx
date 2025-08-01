import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { sendMessage, sendAIMessage, selectedUser } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText && !imagePreview) return;

    const isAI = selectedUser?._id === "686047cb7a143aecd9fee73d";

    try {
      //  If message starts with "@ai", send as AI prompt
      if (trimmedText.startsWith("@ai")) {
        const aiPrompt = trimmedText.replace("@ai", "").trim();
        if (!aiPrompt) {
          toast.error("Please enter a prompt after @ai");
          return;
        }
        // await sendAIMessage(aiPrompt);
        // await sendMessage({
        //   text: aiPrompt,
        //   image: imagePreview,
        //   isAIFlow: true, //  Special flag to prevent DB saving 
        // });
        await sendAIMessage(aiPrompt);

      } else if(isAI){  // if you are chatting with ai asistance
        await sendAIMessage(trimmedText);
      }else {
        await sendMessage({
          text: trimmedText,
          image: imagePreview,
        });
      }

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const isAI = selectedUser?._id === "686047cb7a143aecd9fee73d" || selectedUser?.fullName === "AI Assistant";
  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            // placeholder="Type a message..."
            placeholder={
              isAI ? "Type your question for the AI Assistant..."
              : 'Type a message... (use "@ai your prompt" for AI Assistant)'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden" // Hide the file input to look like a image button 
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} /> 
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { // it is sender id which is of type ObjectId and ref is User
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    chatContextId: { //  NEW: uniquely identifies this conversation thread
      // type: mongoose.Schema.Types.ObjectId,
      type: String,
      required: true,
    },
    // NEW: status of the message, could be sent, delivered or read
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

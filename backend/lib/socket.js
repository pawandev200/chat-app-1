import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";


const app = express();
const server = http.createServer(app); // Create an HTTP server with Express

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});  

// Function to get the socket ID of a user by their userId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Oject: used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // io.emit() is used to send events to all the connected clients

// for read receipts: 
// Handle messageDelivered
  socket.on("messageDelivered", async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);

      if (!message) return;

      // Prevent unnecessary or backward update
      if (message.status === "read" || message.status === "delivered") return;

      message.status = "delivered";
      await message.save();

      const senderId = message.senderId.toString();
      const senderSocketId = userSocketMap[senderId];

      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: message._id,
          status: "delivered",
          chatContextId: message.chatContextId,
        });
      }
    } catch (err) {
      console.error("Error in messageDelivered:", err.message);
    }
  });

  // Handle messageRead
  socket.on("messageRead", async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);

      if (!message) return;

      // Prevent redundant update
      if (message.status === "read") return;

      message.status = "read";
      await message.save();

      const senderId = message.senderId.toString();
      const senderSocketId = userSocketMap[senderId];

      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: message._id,
          status: "read",
          chatContextId: message.chatContextId,
        });
      }
    } catch (err) {
      console.error("Error in messageRead:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


export { io, app, server };


// app(Express Application): Instance of the Express, used to define API routes, middleware(parsing req, handling CORS) and settings for the web server.
// server(HTTP Server): Instance of a Node.js HTTP server, handling incoming HTTP requests and serving responses.
// io(WebSocket Server): Instance of the Socket.IO server,enables WebSocket communication over the same HTTP server.
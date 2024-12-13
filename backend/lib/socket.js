import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app); // Create an HTTP server with Express

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});  

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Oject: used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // io.emit() is used to send events to all the connected clients

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

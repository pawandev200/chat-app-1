// Import essential modules and dependencies
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path"; 

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config(); // Load environment variables from a .env file 

// Defining constants
const PORT = process.env.PORT;
const __dirname = path.resolve(); // To get the current directory path, handle path dynamically

// Apply middlewares: Middleware is used to parse requests, handle cookies, and manage CORS.
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
// Middleware to enable CORS for specific origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Apply routes as middleware
app.use("/api/auth", authRoutes); // Route middleware for authentication routes
app.use("/api/messages", messageRoutes); // Route middleware for message routes



// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist"))); // Serve static files from the frontend build folder.

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html")); // SPA fallback route.
  });
}

// Start the server(both HTTP and WebSocket server) and connect to the database
// Clients can use HTTP for API calls and seamlessly switch to WebSocket for real-time communication.
server.listen(PORT, () => {
  console.log("server is running on PORT: " + PORT);
  connectDB();
});

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage, 
} from "../controllers/message.controller.js";
import { sendPromptToAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar); // Get list of users (for sidebar/chat list)

// router.get("/:id", protectRoute, getMessages); // old 
router.get("/:chatContextId", protectRoute, getMessages); // New: Fetch full conversation history for a given chatContextId 


router.post("/send/:id", protectRoute, sendMessage); //sending message to a receiver in a given chatContextId: could be text or image

router.post("/ai/prompt", protectRoute, sendPromptToAI); // sending messages to ai for ai reply 
// router.get("/ai/history", protectRoute, getAIMessages);

export default router;

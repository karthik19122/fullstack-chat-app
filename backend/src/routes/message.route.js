import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, editMessage, deleteMessage } from "../controllers/message.controller.js";

const router = express.Router();

// Get all users
router.get("/users", protectRoute, getUsersForSidebar);

// Get messages between two users
router.get("/:id", protectRoute, getMessages);

// Send a message
router.post("/send/:id", protectRoute, sendMessage);

// Edit a message
router.put("/edit/:messageId", protectRoute, editMessage);

// Delete a message
router.delete("/delete/:messageId", protectRoute, deleteMessage);

export default router;

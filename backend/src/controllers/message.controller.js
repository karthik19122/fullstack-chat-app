import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import ScheduledMessage from "../models/scheduledMessage.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Get all users for the sidebar (excluding the logged-in user)
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all messages between logged-in user and selected user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message (immediately or scheduled)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, scheduledAt } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // If message is scheduled for the future
    if (scheduledAt) {
      const newScheduledMessage = new ScheduledMessage({
        senderId,
        receiverId,
        text,
        image: imageUrl,
        scheduledTime: new Date(scheduledAt),
      });
      await newScheduledMessage.save();
      return res.status(201).json({ message: "Message scheduled successfully" });
    }

    // If message is immediate
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Edit message function
export const editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { newText } = req.body;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.text = newText;
    await message.save();

    // Optionally, emit an event to notify other users
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    return res.status(200).json({ message: "Message edited successfully", message });
  } catch (error) {
    console.error("Error in editMessage:", error.message);
    return res.status(500).json({ error: "Failed to edit message" });
  }
};

// Delete message function
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.remove();

    // Optionally, emit an event to notify other users
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    return res.status(500).json({ error: "Failed to delete message" });
  }
};

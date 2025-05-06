// scheduledMessages.js
import cron from "node-cron";
import Message from "../models/message.model.js";
import { io, getReceiverSocketId } from "./socket.js"; 

cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log("Cron job running at:", now);

  try {
    // Fetch messages where the scheduledAt is less than or equal to now and not delivered
    const messages = await Message.find({
      scheduledAt: { $lte: now },
      delivered: false,
    });

    if (messages.length === 0) {
      console.log("No messages to send at", now);
    }

    for (const msg of messages) {
      console.log("Scheduling message for:", msg.receiverId);

      const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
      if (receiverSocketId) {
        console.log("Receiver socket found, sending message to:", receiverSocketId);
        io.to(receiverSocketId).emit("newMessage", msg);
      } else {
        console.log("Receiver socket ID not found for:", msg.receiverId);
      }

      // Mark the message as delivered
      msg.delivered = true;
      await msg.save();
      console.log("Message delivered and saved:", msg._id);
    }
  } catch (error) {
    console.error("Error in scheduled job:", error.message);
  }
});

import { io } from "socket.io-client";
import toast from "react-hot-toast";

let socket;

export const listenForMessages = (userId) => {
  if (!socket && userId) {
    socket = io("http://localhost:5001", {
      query: { userId },
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket server", socket.id); // Check if this logs
    });

    socket.on("connect_error", (err) => {
      console.error("Connection failed:", err); // Log if connection fails
    });

    socket.on("newMessage", (msg) => {
      console.log("📩 New message received from server:", msg);
      toast(`📨 New message from ${msg.senderId?.username || "someone"}: ${msg.text}`, {
        icon: "💬",
      });
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });
  }
};

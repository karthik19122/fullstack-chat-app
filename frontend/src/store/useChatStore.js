import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await axiosInstance.get("/messages/users");
      set({ users: data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    const { messages } = get();
    if (messages.some(msg => msg.senderId === userId)) return;

    set({ isMessagesLoading: true });
    try {
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData, scheduledTime = null) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const { data } = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { ...messageData, scheduledAt: scheduledTime }
      );
      set({ messages: [...messages, data] });
      toast.success(scheduledTime ? "Message scheduled!" : "Message sent!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // New method for editing messages
  editMessage: async (messageId, newText) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const { data } = await axiosInstance.put(
        `/messages/edit/${messageId}`,
        { newText }
      );
      // Update message in the state after successful editing
      set({
        messages: messages.map((msg) =>
          msg._id === messageId ? { ...msg, text: newText } : msg
        ),
      });
      toast.success("Message edited!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to edit message");
    }
  },

  // New method for deleting messages
  deleteMessage: async (messageId) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set({
        messages: messages.filter((msg) => msg._id !== messageId),
      });
      toast.success("Message deleted!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, messages } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedUser || !socket) {
      toast.error("Socket or selected user not available");
      return;
    }

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id || messages.some(msg => msg._id === newMessage._id)) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
    get().getMessages(user._id);
  },

  resetStore: () => {
    set({ selectedUser: null, messages: [] });
  },
}));

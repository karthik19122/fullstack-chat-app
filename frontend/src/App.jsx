import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import FileUpload from "./components/FileUpload";
import ChatWindow from "./components/ChatWindow";
import "./i18n";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { listenForMessages } from "./services/socketService";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('🔔 Notification permission granted');
        } else {
          console.log('🔕 Notification permission denied');
        }
      });
    }
  }, [checkAuth]);

  useEffect(() => {
    if (authUser?._id) {
      // Listen for messages once user is authenticated
      listenForMessages(authUser._id);
    }
  }, [authUser]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  const messages = [
    { text: "Welcome!", fileUrl: "", fileType: "" },
    {
      text: "Here's the file you asked for.",
      fileUrl: "https://example.com/sample.pdf",
      fileType: "pdf",
    },
  ];

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/chat" element={<ChatWindow messages={messages} />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;

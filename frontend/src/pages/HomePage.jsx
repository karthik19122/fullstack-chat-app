import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Chatbot from "../components/Chatbot";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { selectedUser, getUsers, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { t } = useTranslation();

  useEffect(() => {
    getUsers();

    if (selectedUser) {
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, getUsers, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            <div className="flex flex-1">
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
            <div className="w-80 p-4 border-l overflow-y-auto">
              <Chatbot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

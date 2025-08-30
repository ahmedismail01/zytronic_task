import React from "react";
import ConversationList from "../chat/ConversationList";
import UserList from "../chat/UserList";
import { useChat } from "../hooks/useChat";
import { User } from "@/types";

interface ChatSidebarProps {
  showUsers: boolean;
  setShowUsers: (show: boolean) => void;
  user: User | null;
  conversations: any[];
  users: User[];
  currentConversation: any;
  setCurrentConversation: (conv: any) => void;
  handleStartConversation: (user: User) => void;
  newMessages: { [key: string]: number };
}

const ChatSidebar = ({
  showUsers,
  setShowUsers,
  user,
  conversations,
  users,
  currentConversation,
  setCurrentConversation,
  handleStartConversation,
  newMessages,
}: ChatSidebarProps) => {
  const handleSelectUser = (selectedUser: User) => {
    handleStartConversation(selectedUser);
    setShowUsers(false);
  };
  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Chat</h2>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showUsers ? "Conversations" : "New Chat"}
          </button>
        </div>
      </div>

      {showUsers ? (
        <UserList users={users} onSelectUser={handleSelectUser} />
      ) : (
        <ConversationList
          user={user}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={setCurrentConversation}
          newMessages={newMessages}
        />
      )}
    </div>
  );
};

export default ChatSidebar;

"use client";

import { useState } from "react";
import ConversationList from "./ConversationList";
import UserList from "./UserList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Conversation, User } from "@/types";
import { useChat } from "@/app/hooks/useChat";
import VoiceRecorder from "./VoiceRecorder";

export default function ChatInterface() {
  const {
    user,
    conversations,
    users,
    currentConversation,
    setCurrentConversation,
    messages,
    handleSendMessage,
    handleStartConversation,
    messagesEndRef,
    isConnected,
  } = useChat();

  useState<Conversation | null>(null);
  const [showUsers, setShowUsers] = useState(false);

  const handleSelectUser = (selectedUser: User) => {
    handleStartConversation(selectedUser);
  };

  if (!isConnected) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to chat server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen  bg-gray-100">
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
          />
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
           
            <div className="p-4 border-b sticky border-gray-200 bg-white">
              <h2 className="text-lg font-semibold">
                {
                  currentConversation.participants.find(
                    (part) => part._id != user?._id
                  )?.username
                }
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <MessageList
                messages={messages}
                currentUserId={user?._id || ""}
              />
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                {showUsers
                  ? "Select a user to start chatting"
                  : "Select a conversation or start a new chat"}
              </p>
              {!showUsers && (
                <button
                  onClick={() => setShowUsers(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Start New Chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

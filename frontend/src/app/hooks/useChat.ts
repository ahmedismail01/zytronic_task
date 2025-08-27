// hooks/useChat.ts
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation, ConversationResponse, Message, User } from "@/types";

export function useChat() {
  const {
    socket,
    isConnected,
    getConversations,
    sendMessage,
    getMessages,
    getUsers,
  } = useSocket();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!isConnected) return;

    getConversations((res) => setConversations(res?.conversations || []));
    getUsers((res) => res.success && setUsers(res.users));

    socket?.on("new_message", (data) => {
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    });

    return () => {
      socket?.off("new_message");
    };
  }, [isConnected]);

  useEffect(() => {
    if (!currentConversation) return;
    getMessages(currentConversation._id, (msgs) => {
      setMessages(msgs?.messages || []);
    });
    scrollToBottom();
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (
    content: string,
    type: "text" | "image" | "voice" = "text"
  ) => {
    if (!currentConversation || !content.trim()) return;
    await sendMessage(
      { conversationId: currentConversation._id, messageType: type, content },
      (response) => setMessages((prev) => [...prev, response.message!])
    );
  };

  const handleStartConversation = (selectedUser: User) => {
    if (!socket || !isConnected) return;
    console.log("here");
    socket.emit(
      "start_conversation",
      selectedUser._id,
      (response: ConversationResponse) => {
        if (response.success) {
          getConversations((conversationsData) => {
            setCurrentConversation(response.conversation);
            setConversations(conversationsData.conversations);
          });
        }
      }
    );
  };

  return {
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
  };
}

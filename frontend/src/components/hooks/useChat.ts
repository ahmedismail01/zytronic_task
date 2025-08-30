// hooks/useChat.ts
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation, Message, User } from "@/types";

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
  const [newMessages, setNewMessages] = useState(
    {} as { [key: string]: number }
  );

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });

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

  const handleStartConversationCB = (response) => {
    const isNew = response.conversation?.isNew;
    setCurrentConversation(response.conversation!);
    if (!isNew) return;
    setConversations((prev) => {
      return [...prev, response.conversation!];
    });
  };

  const handleNewMessage = (message: Message) => {
    if (
      currentConversation &&
      message.conversation_id == currentConversation._id
    ) {
      setMessages((prev) => [...prev, message]);
    } else {
      setNewMessages((prev) => ({
        ...prev,
        [message.conversation_id]: (prev[message.conversation_id] || 0) + 1,
      }));
    }
  };

  const handleStartConversation = (selectedUser: User) => {
    if (!socket || !isConnected) return;
    socket.emit(
      "start_conversation",
      selectedUser._id,
      handleStartConversationCB
    );
  };

  useEffect(() => {
    getConversations((res) => {
      if (res.success) {
        setConversations(res.data);
        if (res.data.length > 0) {
          setCurrentConversation(res.data[0]);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("new_conversation", (conversation: Conversation) => {
      setConversations((prev) => [...prev, conversation]);
    });

    socket.on("conversation_update", (updatedConversation: Conversation) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === updatedConversation._id ? updatedConversation : conv
        )
      );
      if (
        currentConversation?._id === updatedConversation._id &&
        updatedConversation.last_message
      ) {
        setCurrentConversation(updatedConversation);
      }
    });

    socket.on("user_status_change", ({ userId, online }) => {
      console.log("User status change:", userId, online);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === userId ? { ...u, online } : u))
      );
    });

    return () => {
      socket.off("new_conversation");
      socket.off("conversation_update");
    };
  }, [socket]);

  useEffect(() => {
    if (!isConnected) return;

    getUsers((res) => res.success && setUsers(res.users));

    socket?.on("new_message", (data) => {
      handleNewMessage(data);
    });

    return () => {
      socket?.off("new_message");
    };
  }, [isConnected, socket, currentConversation]);

  useEffect(() => {
    if (!currentConversation) return;
    getMessages(currentConversation._id, (msgs) => {
      setMessages(msgs?.data || []);
    });
    setNewMessages((prev) => {
      const updated = { ...prev };
      delete updated[currentConversation._id];
      return updated;
    });
  }, [currentConversation]);

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
    newMessages,
    setNewMessages,
  };
}

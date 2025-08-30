"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import config from "@/config";
import {
  ConversationsResponse,
  MessagesResponse,
  UsersSocketResponse,
  SendMessageData,
} from "@/types";
import backendConnector from "@/connectors/backendConnector";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: SendMessageData, cb: (data: any) => void) => void;
  getUsers: (cb: (data: UsersSocketResponse) => void) => void;
  getConversations: (cb: (data: ConversationsResponse) => void) => void;
  getMessages: (
    conversationId: string,
    cb: (data: MessagesResponse) => void
  ) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage = (data: SendMessageData, cb: (data: any) => void) => {
    if (!socketRef.current) return;
    socketRef.current.emit("send_message", data, (response: any) => {
      if (response?.success) {
        cb(response);
      } else {
        return cb(response);
      }
    });
  };

  const getUsers = (cb: (data: UsersSocketResponse) => void) => {
    if (!socketRef.current) return;
    socketRef.current.emit("get_users", cb);
  };

  const getConversations = async (
    cb: (data: ConversationsResponse) => void
  ) => {
    const response = await backendConnector.getConversations();
    return cb(response);
  };

  const getMessages = async (
    conversationId: string,
    cb: (data: MessagesResponse) => void
  ) => {
    const response = await backendConnector.getMessages(conversationId);
    cb(response);
  };

  const registerSocketEvents = (socket: Socket) => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setIsConnected(false);
    });
  };

  useEffect(() => {
    if (token) {
      const newSocket = io(config.BACKEND_BASE_URL, {
        auth: { token },
        transports: ["websocket"],
        autoConnect: true,
      });

      socketRef.current = newSocket;
      registerSocketEvents(newSocket);

      return () => {
        
        newSocket.disconnect();
        socketRef.current = null;
        setIsConnected(false);

      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    }
  }, [token]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        sendMessage,
        getConversations,
        getMessages,
        getUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

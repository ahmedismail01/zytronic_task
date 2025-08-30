import { Socket } from "socket.io-client";

export interface Conversation {
  _id: string;
  participants: User[];
  updated_at: string;
  created_at: string;
  isNew?: boolean;
  last_message?: Message;
}

export interface User {
  _id: string;
  username: string;
  avatar_url?: string;
  online: boolean;
}

export interface Message {
  _id: string;
  sender: User;
  conversation_id: string;
  message_type: "text" | "image" | "voice";
  content: string;
  created_at: string;
}

export interface SocketResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
}

export interface ConversationsResponse extends SocketResponse {
  data?: Conversation[];
}

export interface MessagesResponse extends SocketResponse {
  data?: Message[];
}

export interface ConversationResponse extends SocketResponse {
  conversation?: Conversation;
}

export interface MessageResponse {
  success: boolean;
  message?: Message;
  error?: string;
}

export interface UsersSocketResponse {
  users: User[];
  success: boolean;
  error?: string;
}

export interface SendMessageData {
  conversationId: string;
  messageType: "text" | "image" | "voice";
  content: string;
}

export interface SocketContextType {
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

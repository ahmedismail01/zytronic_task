import Image from "next/image";
import { format } from "date-fns";
import { Conversation, Message, User } from "@/types";
import { GrGroup } from "react-icons/gr";
import { MdAddComment } from "react-icons/md";
import { FiAlertCircle } from "react-icons/fi";
import { BsCircleFill } from "react-icons/bs";

interface ConversationListProps {
  user: User;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  newMessages: { [key: string]: number };
}

export default function ConversationList({
  user,
  conversations,
  currentConversation,
  onSelectConversation,
  newMessages,
}: ConversationListProps) {
  const renderLastMessage = (last_message: Message) => {
    switch (last_message?.message_type) {
      case "text":
        return last_message?.content;
      case "image":
        return "📷 Image";
      case "voice":
        return "🎤 Voice Message";
      default:
        return "";
    }
  };
  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-lg font-bold text-blue-700 tracking-tight">
          Chats
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <GrGroup size={40} />
            <span className="mt-2">No conversations yet</span>
          </div>
        )}
        {conversations.map((conversation) => {
          const otherUser = conversation.participants.find(
            (participant) => participant._id !== user?._id
          );
          const hasNewMessage = newMessages[conversation._id];
          if (!otherUser) return null;
          return (
            <button
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors duration-150 group relative ${
                currentConversation?._id === conversation?._id
                  ? "bg-blue-100 border-l-4 border-blue-500"
                  : ""
              }`}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-100 group-hover:border-blue-300 flex-shrink-0">
                {otherUser?.avatar_url ? (
                  <Image
                    src={otherUser?.avatar_url}
                    alt={otherUser?.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <GrGroup size={28} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-900 truncate flex items-center gap-1">
                    {otherUser?.username}
                    {conversation.isNew && (
                      <MdAddComment
                        className="text-blue-400 ml-1"
                        title="New Conversation"
                      />
                    )}
                  </p>
                  <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                    {format(new Date(conversation?.updated_at), "MMM d")}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {hasNewMessage && (
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full animate-pulse">
                      <FiAlertCircle className="text-green-500" size={14} />
                      {hasNewMessage}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 truncate italic">
                    {conversation?.last_message &&
                      renderLastMessage(conversation.last_message)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

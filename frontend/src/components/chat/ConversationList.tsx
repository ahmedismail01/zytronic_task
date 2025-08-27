import Image from "next/image";
import { format } from "date-fns";
import { Conversation, User } from "@/types";

interface ConversationListProps {
  user: User;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationList({
  user,
  conversations,
  currentConversation,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const otherUser: User | undefined = conversation.participants.find(
            (participant) => participant._id !== user?._id
          );
          if (!otherUser) return null;
          return (
            <button
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors duration-150 ${
                currentConversation?._id === conversation?._id
                  ? "bg-gray-100"
                  : ""
              }`}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                {otherUser?.avatar_url ? (
                  <Image
                    src={otherUser?.avatar_url}
                    alt={otherUser?.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {otherUser?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {otherUser?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(conversation?.updated_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

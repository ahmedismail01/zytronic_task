import Image from "next/image";
import { format } from "date-fns";
import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-auto space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender?._id === currentUserId;

        return (
          <div
            key={message._id}
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isOwnMessage
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {/* TEXT MESSAGE */}
              {message.message_type === "text" && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}

              {/* IMAGE MESSAGE */}
              {message.message_type === "image" && (
                <>
                  {message.content === "uploading..." ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-6 py-1">
                          <div className="h-2 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Uploading image...
                      </p>
                    </div>
                  ) : (
                    <div className="relative w-full max-w-sm overflow-hidden rounded-lg">
                      <Image
                        src={
                          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${message?.content}` ||
                          "/placeholder-image.png"
                        }
                        alt="Shared image"
                        width={300}
                        height={200}
                        className="object-contain"
                      />
                    </div>
                  )}
                </>
              )}

              {/* AUDIO MESSAGE (voice note) */}
              {message.message_type === "voice" && (
                <>
                  {message.content === "uploading..." ? (
                    <p className="text-sm text-gray-500">Uploading audio...</p>
                  ) : (
                    <audio
                      controls
                      className="w-full max-w-xs"
                      src={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${message?.content}`}
                    />
                  )}
                </>
              )}

              {/* TIMESTAMP */}
              <p
                className={`text-xs mt-1 ${
                  isOwnMessage ? "text-indigo-200" : "text-gray-500"
                }`}
              >
                {format(new Date(message.created_at), "h:mm a")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { PhotoIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import backendConnector from "@/connectors/backendConnector";
import VoiceRecorder from "./VoiceRecorder";

interface MessageInputProps {
  onSendMessage: (content: string, type: "text" | "image" | "voice") => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, "text");
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG and GIF images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await backendConnector.uploadImage(formData);

      onSendMessage(response.data.url, "image");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleVoiceUpload = async (blob: Blob) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("audio", blob);

      const response = await backendConnector.uploadVoice(formData);

      onSendMessage(response.data.url, "voice");
    } catch (error) {
      console.error("Error uploading voice:", error);
      alert("Failed to upload voice");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="w-full resize-none rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 text-sm"
          rows={1}
        />
      </div>

      <div className="flex space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
        />

        <VoiceRecorder handleSubmit={handleVoiceUpload} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <PhotoIcon className="h-6 w-6" />
        </button>

        <button
          type="submit"
          disabled={!message.trim() || isUploading}
          className="p-2 text-indigo-600 hover:text-indigo-700 focus:outline-none disabled:opacity-50"
        >
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </div>
    </form>
  );
}

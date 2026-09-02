"use client";

import { ChatMessage } from "@/types/chat";

interface ChatMessageComponentProps {
  message: ChatMessage;
}

export default function ChatMessageComponent({
  message,
}: ChatMessageComponentProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-xs rounded-lg px-4 py-3 text-sm md:max-w-md lg:max-w-lg ${
          isUser
            ? "bg-black text-white"
            : message.error
              ? "bg-red-50 text-red-900"
              : "bg-gray-100 text-gray-900"
        }`}
        dir="auto"
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}

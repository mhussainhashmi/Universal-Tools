"use client";

import { useEffect, useRef } from "react";
import ChatMessageComponent from "./ChatMessage";
import ChatInput from "./ChatInput";
import { ChatMessage } from "@/types/chat";

interface DocumentQAChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  documentFileName?: string;
  documentSize?: number;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
}

export default function DocumentQAChat({
  messages,
  isLoading,
  documentFileName,
  documentSize,
  onSendMessage,
  onClearChat,
}: DocumentQAChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6">
      {/* Header with document info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Conversation
          </h2>
          {documentFileName && (
            <p className="mt-1 text-sm text-gray-600">
              Document: {documentFileName}
              {documentSize && (
                <span className="ml-2">
                  ({(documentSize / 1024).toFixed(2)} KB)
                </span>
              )}
            </p>
          )}
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="text-sm text-gray-500 hover:text-red-600"
            title="Clear chat history (document will remain)"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No messages yet. Ask a question to start.
          </p>
        ) : (
          <div>
            {messages.map((msg) => (
              <ChatMessageComponent
                key={msg.id}
                message={msg}
              />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-xs rounded-lg bg-gray-100 px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{
                        animationDelay: "0.1s",
                      }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{
                        animationDelay: "0.2s",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  );
}

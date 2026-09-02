"use client";

import { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  isLoading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  function handleSend() {
    const trimmed = message.trim();
    if (trimmed && !disabled && !isLoading) {
      onSendMessage(trimmed);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex gap-3">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about the document..."
        disabled={disabled || isLoading}
        rows={1}
        className="flex-1 resize-none rounded-lg border border-gray-200 p-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-black"
        dir="auto"
      />

      <button
        onClick={handleSend}
        disabled={
          !message.trim() || disabled || isLoading
        }
        className="rounded-lg bg-black px-4 py-3 text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-900 disabled:hover:bg-black"
        title="Send (Enter), or Shift+Enter for a new line"
      >
        {isLoading ? (
          <span className="inline-block animate-spin">
            ↻
          </span>
        ) : (
          "Send"
        )}
      </button>
    </div>
  );
}

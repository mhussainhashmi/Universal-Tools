"use client";

import { useState } from "react";
import DocumentUploadCard from "@/components/document-qa/DocumentUploadCard";
import DocumentQAChat from "@/components/document-qa/DocumentQAChat";
import { extractTextFromDocument } from "@/lib/documentExtractor";
import { ChatMessage } from "@/types/chat";

function generateMessageId(): string {
  return `${Date.now()}-${Math.random()}`;
}

export default function DocumentQAPage() {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [content, setContent] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    []
  );
  const [isFileLoading, setIsFileLoading] =
    useState(false);
  const [isChatLoading, setIsChatLoading] =
    useState(false);
  const [fileError, setFileError] = useState<string | null>(
    null
  );


  async function handleFileSelect(file: File) {
    setSelectedFile(file);
    setContent("");
    setMessages([]);
    setFileError(null);
    setIsFileLoading(true);

    try {
      const extractedText =
        await extractTextFromDocument(file);
      setContent(extractedText);
      setFileError(null);
    } catch (err) {
      setFileError(
        err instanceof Error
          ? err.message
          : "Unknown error occurred"
      );
      setContent("");
    } finally {
      setIsFileLoading(false);
    }
  }

  async function handleSendMessage(
    userMessage: string
  ) {
    if (!content.trim()) {
      return;
    }

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch(
        "/api/document-qa",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: userMessage,
            documentText: content,
            messages: messages,
          }),
        }
      );

      const payload = (await response.json()) as {
        answer?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Failed to get an answer from the AI."
        );
      }

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: "assistant",
        content:
          payload.answer ?? "No answer returned.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to ask the document question.";

      const errorChatMessage: ChatMessage = {
        id: generateMessageId(),
        role: "assistant",
        content: errorMessage,
        timestamp: Date.now(),
        error: true,
      };

      setMessages((prev) => [
        ...prev,
        errorChatMessage,
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([]);
  }

  function handleClearDocument() {
    setSelectedFile(null);
    setContent("");
    setMessages([]);
    setFileError(null);
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">
          AI Document Q&A
        </h1>

        <p className="mt-2 text-gray-600">
          Upload a PDF, TXT, or Markdown file and ask
          questions about it using AI.
        </p>

        {/* Upload section */}
        <div className="mt-8">
          <DocumentUploadCard
            onFileSelect={handleFileSelect}
            isLoading={isFileLoading}
          />

          {fileError && (
            <div className="mt-4 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {fileError}
              </p>
            </div>
          )}
        </div>

        {/* Chat section */}
        {content && (
          <div className="mt-8">
            <DocumentQAChat
              messages={messages}
              isLoading={isChatLoading}
              documentFileName={selectedFile?.name}
              documentSize={content.length}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
            />
          </div>
        )}

        {/* Document actions */}
        {content && !isChatLoading && (
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleClearDocument}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Clear Document
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

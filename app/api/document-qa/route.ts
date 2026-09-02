import { NextResponse } from "next/server";
import { answerQuestionWithDocument } from "@/lib/ai/gemini";
import { ChatMessage } from "@/types/chat";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, documentText, messages } = body as {
      question?: string;
      documentText?: string;
      messages?: ChatMessage[];
    };

    if (
      typeof question !== "string" ||
      question.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    if (
      typeof documentText !== "string" ||
      documentText.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Document text is required." },
        { status: 400 }
      );
    }

    // Build conversation context from previous messages
    let conversationContext = "";
    if (Array.isArray(messages) && messages.length > 0) {
      conversationContext =
        "Previous conversation:\n" +
        messages
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n") +
        "\n\n";
    }

    // Enhance the question with conversation context
    const enhancedQuestion =
      conversationContext +
      `Current question: ${question}`;

    const answer = await answerQuestionWithDocument({
      question: enhancedQuestion,
      documentText,
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Document QA error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to answer the question.",
      },
      { status: 500 }
    );
  }
}

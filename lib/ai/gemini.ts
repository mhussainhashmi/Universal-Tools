export interface QuestionAnswerRequest {
  question: string;
  documentText: string;
}

export async function answerQuestionWithDocument({
  question,
  documentText,
}: QuestionAnswerRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Server configuration error: GEMINI_API_KEY is not set."
    );
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You are a careful document assistant. Answer questions using only the supplied document text. If the answer cannot be found in the document, say that it cannot be determined from the provided text and do not invent information.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Document text:\n${documentText}\n\nQuestion:\n${question}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      // Ignore invalid JSON and fall back to generic error.
    }

    const errorMessage =
      (payload as {
        error?: { message?: string };
      })?.error?.message ?? "AI request failed.";

    throw new Error(errorMessage);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const answer = data.candidates
    ?.map((candidate) =>
      candidate.content?.parts
        ?.map((part) => part.text ?? "")
        .join("") ?? ""
    )
    .join(" ")
    .trim();

  if (!answer || answer === "") {
    throw new Error("AI response was empty.");
  }

  return answer;
}

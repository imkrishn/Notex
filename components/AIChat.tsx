"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import Spinner from "./Spinner";
import * as Y from "yjs";
import { fetchContentFromDocumentData } from "@/lib/fetchContentFromDocumentData";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChat({
  doc,
  setUI,
}: {
  doc: Y.Doc;
  setUI: Dispatch<SetStateAction<boolean>>;
}) {
  const [message, setMessage] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, loading]);

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setUI(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //ask question to ai event

  async function askDocument() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessage((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const documentData = doc.get("document-store").toJSON();
    const content = fetchContentFromDocumentData(documentData);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AI_AGENT_URL}/chatToDocument`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentData: content,
            question: input,
          }),
        }
      );

      const data = await res.json();

      setMessage((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch {
      setMessage((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't answer that.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={divRef}
      className="
      absolute z-50 lg:left-1/4 left-4 top-20 overflow-auto
        flex flex-col min-h-20 max-h-[90%] lg:w-1/2 w-full mx-auto
        bg-(--color-base-100)
        border border-(--color-base-300)
        rounded-xl shadow-lg
      "
    >
      {/* Header */}
      <div
        className="
          px-5 py-4 border-b border-(--color-base-300)
          text-(--color-base-content)
          font-semibold text-lg
        "
      >
        Ask your AI
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {message.length === 0 && (
          <div className="text-sm text-(--color-neutral-content-light)">
            Ask anything about this document…
          </div>
        )}

        {message.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                px-4 py-3 rounded-xl text-sm leading-relaxed
                ${
                  msg.role === "user"
                    ? "bg-(--color-primary) text-white"
                    : "bg-(--color-base-200) text-(--color-base-content)"
                }
              `}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-(--color-neutral-content-light)">
            <Spinner size={16} color="var(--color-primary)" />
            Thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="
          border-t border-(--color-base-300)
          p-4 flex items-center gap-3
          bg-(--color-base-100)
        "
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askDocument()}
          placeholder="Ask a question about this document…"
          className="
            flex-1 px-4 py-2 rounded-lg
            bg-(--color-base-200)
            text-(--color-base-content)
            placeholder:text-(--color-neutral-content-light)
            focus:outline-none focus:ring-2
            focus:ring-(--color-primary)
          "
        />

        <button
          onClick={askDocument}
          disabled={loading}
          className="
            h-10 w-10 rounded-lg flex items-center justify-center
            bg-(--color-primary) text-white
            hover:opacity-90 disabled:opacity-50
            transition
          "
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

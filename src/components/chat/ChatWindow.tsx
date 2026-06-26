"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "您好！我是参天AI助手，请问有什么可以帮您的？",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const placeholderId = (Date.now() + 1).toString();
    const placeholderMsg: Message = {
      id: placeholderId,
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, placeholderMsg]);
    setStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, content: "抱歉，AI 服务暂时不可用，请稍后重试。" }
              : m
          )
        );
        setLoading(false);
        setStreaming(false);
        return;
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId ? { ...m, content: data.reply || data.error || "服务异常" } : m
          )
        );
      } else {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === placeholderId ? { ...m, content: fullText } : m
              )
            );
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: "网络错误，请稍后重试。" }
            : m
        )
      );
    } finally {
      setLoading(false);
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-primary-bg-100">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-body ${
                  msg.role === "user"
                    ? "bg-button-primary-bg text-button-foreground"
                    : "bg-card text-foreground-second"
                }`}
              >
                {msg.content ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.15s]" />
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.3s]" />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题..."
              disabled={loading}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-body text-foreground-second outline-none transition-colors focus:border-border-primary disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-button-primary-bg px-6 py-3 text-body font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active disabled:opacity-50"
            >
              {streaming ? "思考中..." : "发送"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

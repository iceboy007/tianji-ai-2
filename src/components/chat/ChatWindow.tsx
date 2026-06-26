"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, MessageSquare, Trash2, PanelLeft } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: number;
  title: string;
  chartId: number | null;
  createdAt: string;
  messageCount: number;
}

export default function ChatWindow() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

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
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 加载历史会话列表
  const loadSessions = useCallback(async () => {
    if (!isLoggedIn) return;
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/user/sessions");
      const data = await res.json();
      if (data.success) setSessions(data.data);
    } catch {
      // ignore
    } finally {
      setSessionsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // 加载某个历史会话的消息
  const loadSessionMessages = useCallback(
    async (sessionId: number) => {
      try {
        const res = await fetch(`/api/user/sessions/${sessionId}`);
        const data = await res.json();
        if (data.success && data.data.messages) {
          const msgs: Message[] = data.data.messages.map(
            (m: { id: number; role: string; content: string }) => ({
              id: String(m.id),
              role: m.role as "user" | "assistant",
              content: m.content,
            })
          );
          setMessages(msgs.length > 0 ? msgs : [{ id: "0", role: "assistant", content: "您好！我是参天AI助手，请问有什么可以帮您的？" }]);
          setCurrentSessionId(sessionId);
        }
      } catch {
        // ignore
      }
    },
    []
  );

  // 创建新的聊天
  const handleNewChat = () => {
    setMessages([{ id: "0", role: "assistant", content: "您好！我是参天AI助手，请问有什么可以帮您的？" }]);
    setCurrentSessionId(null);
    setSidebarOpen(false);
  };

  // 保存消息到当前会话
  const saveMessages = useCallback(
    async (sessionId: number | null, msgs: Message[]) => {
      if (!isLoggedIn) return sessionId;

      // 提取用户消息和助手回复（跳过初始欢迎消息）
      const chatMsgs = msgs.filter((m) => m.id !== "0");

      if (chatMsgs.length === 0) return sessionId;

      const title = chatMsgs.find((m) => m.role === "user")?.content?.slice(0, 30) || "新对话";

      try {
        if (sessionId) {
          // 更新已有会话：先删除旧消息，再插入全部
          // 简化实现：每次全量保存为新的 POST（会覆盖）
          await fetch(`/api/user/sessions/${sessionId}`, { method: "DELETE" });
        }

        const res = await fetch("/api/user/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            messages: chatMsgs.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        if (data.success) {
          return data.data.id as number;
        }
      } catch {
        // ignore
      }
      return sessionId;
    },
    [isLoggedIn]
  );

  // 删除历史会话
  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/user/sessions/${sessionId}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    } catch {
      // ignore
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
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

    let assistantContent = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        assistantContent = "抱歉，AI 服务暂时不可用，请稍后重试。";
        setMessages((prev) =>
          prev.map((m) => (m.id === placeholderId ? { ...m, content: assistantContent } : m))
        );
      } else {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const data = await response.json();
          assistantContent = data.reply || data.error || "服务异常";
          setMessages((prev) =>
            prev.map((m) => (m.id === placeholderId ? { ...m, content: assistantContent } : m))
          );
        } else {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              assistantContent += chunk;
              setMessages((prev) =>
                prev.map((m) => (m.id === placeholderId ? { ...m, content: assistantContent } : m))
              );
            }
          }
        }
      }
    } catch {
      assistantContent = "网络错误，请稍后重试。";
      setMessages((prev) =>
        prev.map((m) => (m.id === placeholderId ? { ...m, content: assistantContent } : m))
      );
    } finally {
      setLoading(false);
      setStreaming(false);
      inputRef.current?.focus();

      // 保存消息到数据库（包含最新的完整对话）
      const finalMessages = [
        ...newMessages,
        { id: placeholderId, role: "assistant" as const, content: assistantContent },
      ];
      const newSessionId = await saveMessages(currentSessionId, finalMessages);
      if (newSessionId && newSessionId !== currentSessionId) {
        setCurrentSessionId(newSessionId);
        loadSessions(); // 刷新侧边栏列表
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-primary-bg-100">
      {/* 历史会话侧边栏 */}
      {sidebarOpen && (
        <div className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="font-serif-heading text-body font-bold text-foreground-third">历史对话</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-muted-foreground hover:bg-primary-bg-100"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-body-small text-foreground-primary transition-colors hover:bg-primary-bg-100"
          >
            <Plus className="h-4 w-4" />
            新建对话
          </button>
          <div className="flex-1 overflow-y-auto p-2">
            {!isLoggedIn ? (
              <p className="p-3 text-tip-small text-muted-foreground">登录后可查看历史记录</p>
            ) : sessionsLoading ? (
              <p className="p-3 text-tip-small text-muted-foreground">加载中...</p>
            ) : sessions.length === 0 ? (
              <p className="p-3 text-tip-small text-muted-foreground">暂无历史对话</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    loadSessionMessages(s.id);
                    setSidebarOpen(false);
                  }}
                  className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-body-small transition-colors hover:bg-primary-bg-100 ${
                    currentSessionId === s.id ? "bg-primary-bg-200" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-foreground-second">{s.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="ml-1 shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-primary-bg-200 hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 主聊天区域 */}
      <div className="flex flex-1 flex-col">
        {/* 顶栏：历史记录按钮 + 新建对话 */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-body-small text-muted-foreground transition-colors hover:bg-primary-bg-100 hover:text-foreground-second"
              >
                <MessageSquare className="h-4 w-4" />
                历史记录
              </button>
            )}
            {currentSessionId && (
              <span className="text-tip-small text-muted-foreground">
                对话 #{currentSessionId}
              </span>
            )}
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-body-small text-foreground-primary transition-colors hover:bg-primary-bg-100"
          >
            <Plus className="h-4 w-4" />
            新建对话
          </button>
        </div>

        {/* 消息区 */}
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

        {/* 输入区 */}
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
    </div>
  );
}

"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; text: string; emotion?: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi — I’m Solace. What’s been stressing you lately?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, threadId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", text: `Error: ${data.error || "unknown"}` }]);
        return;
      }

      if (data.threadId && !threadId) setThreadId(data.threadId);

      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? "No reply.", emotion: data.emotion },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Network error — try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold">Chat</h1>
          <span className="text-xs text-zinc-400">
            thread: {threadId ? threadId.slice(0, 8) + "…" : "new"}
          </span>
        </div>

        <div className="mt-4 h-[460px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-white text-zinc-900"
                    : "mr-auto bg-zinc-900 text-zinc-100 border border-zinc-800"
                }`}
              >
                {m.emotion && m.role === "assistant" && (
                  <div className="mb-1 text-[11px] text-zinc-400">emotion: {m.emotion}</div>
                )}
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto max-w-[85%] rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                Solace is typing…
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            onClick={send}
            disabled={loading}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:opacity-90 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  async function ask(text: string) {
    setMessages(m => [...m, { role: "user", content: text }]);
    const res = await fetch("/api/notify/send", { method: "POST", body: JSON.stringify({ type: "ai", text }) });
    const data = await res.json();
    setMessages(m => [...m, { role: "assistant", content: data.answer ?? "..." }]);
  }

  return (
    <>
      <button className="fixed bottom-6 right-6 bg-black text-white rounded-full p-4 shadow-xl" onClick={() => setOpen(o => !o)}>Ask AI</button>
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-xl p-4 shadow-lg">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {messages.map((m, i) => <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>{m.content}</div>)}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement);
              const q = input.value.trim();
              if (!q) return;
              input.value = "";
              await ask(q);
            }}
          >
            <input name="q" className="w-full border rounded p-2" placeholder="Explain my meds..." />
          </form>
        </div>
      )}
    </>
  );
}

"use client";

import * as React from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const quickReplies = [
  "What are your membership prices?",
  "Book a free trial",
  "Do you have personal training?",
  "Club timings & location",
];

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "Hi! 👋 I'm the NEXTGEN assistant. Ask me about memberships, classes or a free trial." },
  ]);

  const reply = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("price") || t.includes("cost") || t.includes("plan")) {
      return "Our plans start at ₹1,499/month for students and ₹2,499/month for the flexible monthly pass. The yearly plan (₹20,999) is our most popular — save 30%. Check /membership for the full comparison.";
    }
    if (t.includes("trial") || t.includes("free")) {
      return "Absolutely! Your first session is free — complete the quick registration at /register and we'll book your fitness assessment right away.";
    }
    if (t.includes("pt") || t.includes("personal") || t.includes("trainer")) {
      return "We have 16+ certified trainers specialising in strength, fat loss, yoga, boxing and rehab. Add PT to any membership from /personal-training.";
    }
    if (t.includes("time") || t.includes("hour") || t.includes("open") || t.includes("location") || t.includes("address")) {
      return "We're at Level 4, Pulse Tower, MG Road, Bengaluru — open Mon–Sat 5 AM–11 PM, Sun 8 AM–2 PM.";
    }
    return "Thanks! A real consultant will get back to you shortly. Meanwhile, you can call us on +91 98765 43210 or drop by for a facility tour.";
  };

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { from: "user", text: value }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: reply(value) }]);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-volt-500 to-accent-600 text-white shadow-glow transition hover:scale-105"
        aria-label="Open live chat"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <div className="card-shadow-lg fixed bottom-24 right-5 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-ink-100 bg-card dark:border-ink-100">
          <div className="flex items-center gap-3 border-b border-ink-100 bg-night-950 px-4 py-3.5 text-white">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-volt-500 to-accent-600">
              <MessageCircle className="size-4.5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-night-950 bg-volt-500" />
            </span>
            <div>
              <p className="text-sm font-bold">NEXTGEN Assistant</p>
              <p className="text-[11px] text-white/60">Online · replies instantly</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                <p
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.from === "user"
                      ? "rounded-br-sm bg-gradient-to-r from-volt-500 to-volt-600 text-white"
                      : "rounded-bl-sm bg-ink-100 text-ink-800 dark:bg-ink-100 dark:text-ink-700"
                  )}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickReplies.map((q) => (
                  <button key={q} onClick={() => send(q)} className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-volt-500 hover:text-volt-700 dark:text-ink-500">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-ink-100 p-3 dark:border-ink-100"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm focus:border-volt-500 focus:outline-none dark:bg-ink-100 dark:text-ink-700"
              aria-label="Chat message"
            />
            <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 text-white" aria-label="Send message">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

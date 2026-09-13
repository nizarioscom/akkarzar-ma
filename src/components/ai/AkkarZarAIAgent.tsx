"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { adviseAkkarZar } from "@/lib/ai/advisor";
import { AI_PLAYBOOK } from "@/lib/ai/playbook";
import type { AppLocale, Dictionary } from "@/lib/i18n/dictionary";

type ChatTurn = {
  role: "user" | "assistant";
  text: string;
};

export function AkkarZarAIAgent({ locale, copy }: { locale: AppLocale; copy: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([{ role: "assistant", text: copy.aiWelcome }]);

  function ask(prompt: string) {
    const text = prompt.trim();
    if (!text) {
      return;
    }
    const reply = adviseAkkarZar(text, locale);
    setTurns((current) => [...current, { role: "user", text }, { role: "assistant", text: reply.text }]);
    setInput("");
  }

  function send() {
    ask(input);
  }

  return (
    <div className="fixed end-4 bottom-4 z-40">
      {open ? (
        <section className="mb-3 flex h-[460px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--flag-green)] bg-white text-[#1a1712] shadow-xl">
          <header className="flex items-center justify-between bg-[var(--flag-green)] px-3 py-2 text-white">
            <p className="text-sm font-semibold">{copy.aiName}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label={copy.aiClose} className="text-white">
              <X className="size-4" />
            </button>
          </header>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {turns.map((turn, index) => (
              <p
                key={`${turn.role}-${index}`}
                className={`rounded-xl px-3 py-2 ${
                  turn.role === "user"
                    ? "ms-8 bg-[var(--flag-green)] text-white"
                    : "me-6 bg-[#f3efe4] text-[#1a1712]"
                }`}
              >
                {turn.text}
              </p>
            ))}
            <div className="grid gap-2 pt-1">
              {AI_PLAYBOOK.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => ask(entry.label[locale])}
                  className="rounded-full border border-[var(--flag-red)]/35 bg-white px-3 py-2 text-start text-sm font-medium text-[#1a1712] hover:bg-[#fff5f5]"
                >
                  {entry.label[locale]}
                </button>
              ))}
            </div>
          </div>
          <form
            className="flex gap-2 border-t border-[#e6ddd0] p-2"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.aiPlaceholder}
              className="min-w-0 flex-1 rounded-full border border-[#c4b8a4] bg-white px-3 py-2 text-sm text-[#1a1712]"
            />
            <button type="submit" className="rounded-full bg-[var(--flag-red)] px-3 py-2 text-sm font-semibold text-white">
              {copy.aiSend}
            </button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--flag-green)] px-4 py-3 text-sm font-semibold text-white shadow-lg ring-2 ring-[var(--flag-red)]"
      >
        <MessageCircle className="size-4" aria-hidden />
        {copy.aiName}
      </button>
    </div>
  );
}

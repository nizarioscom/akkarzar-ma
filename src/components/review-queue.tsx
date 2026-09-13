"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { Button, Card } from "@/components/ui";

type QueueItem = {
  id: string;
  title: string;
  city: string;
  status: string;
};

export function ReviewQueue({
  copy,
  items,
  endpoint,
}: {
  copy: Dictionary;
  items: QueueItem[];
  endpoint: "/api/reviews/promoter" | "/api/reviews/notary";
}) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function decide(listingId: string, decision: "APPROVED" | "REJECTED") {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId, decision, note }),
    });
    const json = (await response.json()) as { success: boolean; error?: string; data?: { status: string } };
    setMessage(json.success ? json.data?.status ?? "ok" : (json.error ?? "error"));
  }

  return (
    <div className="grid gap-3">
      {items.length === 0 ? <Card>Queue vide / الطابور فارغ</Card> : null}
      {items.map((item) => (
        <Card key={item.id}>
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-[var(--muted)]">
            {item.city} · {item.status}
          </p>
          <textarea
            className="mt-3 w-full rounded-xl border border-[var(--line)] p-2 text-sm"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <Button type="button" onClick={() => void decide(item.id, "APPROVED")}>
              {copy.approve}
            </Button>
            <Button type="button" variant="danger" onClick={() => void decide(item.id, "REJECTED")}>
              {copy.reject}
            </Button>
          </div>
        </Card>
      ))}
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { Button, Card, Field } from "@/components/ui";

const STEPS = ["contract", "docs", "track"] as const;

export function SellerWizard({ copy }: { copy: Dictionary }) {
  const [step, setStep] = useState(0);
  const [listingId, setListingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [silentExit, setSilentExit] = useState(true);
  const [form, setForm] = useState({
    title: "",
    city: "",
    developerCompanyId: "",
    totalContractPrice: "",
    amountPaid: "",
  });

  async function createListing() {
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        propertyType: "APARTMENT",
        totalContractPrice: Number(form.totalContractPrice),
        amountPaid: Number(form.amountPaid),
        silentExit,
      }),
    });
    const json = (await response.json()) as { success: boolean; data?: { id: string }; error?: string };
    if (!json.success || !json.data) {
      setMessage(json.error === "unauthenticated" ? copy.loginNeeded : (json.error ?? "error"));
      return;
    }
    setListingId(json.data.id);
    setMessage(json.data.id);
    setStep(1);
  }

  async function upload(type: "CONTRACT_RESERVATION" | "BANK_PAYMENT_RECEIPT", file: File | null) {
    if (!listingId || !file) {
      return;
    }
    const body = new FormData();
    body.set("listingId", listingId);
    body.set("type", type);
    body.set("file", file);
    const response = await fetch("/api/documents", { method: "POST", body });
    const json = (await response.json()) as { success: boolean; error?: string };
    setMessage(json.success ? copy.uploadDocs : (json.error ?? "error"));
  }

  async function submit() {
    if (!listingId) {
      return;
    }
    const response = await fetch(`/api/listings/${listingId}/submit`, { method: "POST" });
    const json = (await response.json()) as { success: boolean; data?: { status: string }; error?: string };
    setMessage(json.success ? json.data?.status ?? "ok" : (json.error ?? "error"));
    setStep(2);
  }

  async function toggleSilent() {
    if (!listingId) {
      return;
    }
    const next = !silentExit;
    await fetch(`/api/listings/${listingId}/silent-exit`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ silentExit: next }),
    });
    setSilentExit(next);
  }

  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">{copy.wizardTitle}</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        {copy.step1} → {copy.step2} → {copy.step3}
      </p>
      {step === 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Titre / العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Field label={copy.filterCity} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Field
            label="Developer company UUID"
            value={form.developerCompanyId}
            onChange={(e) => setForm({ ...form, developerCompanyId: e.target.value })}
          />
          <Field
            label={copy.totalPrice}
            value={form.totalContractPrice}
            onChange={(e) => setForm({ ...form, totalContractPrice: e.target.value })}
          />
          <Field
            label={copy.amountPaid}
            value={form.amountPaid}
            onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={silentExit} onChange={() => setSilentExit((value) => !value)} />
            {copy.toggleSilent}
          </label>
          <div className="md:col-span-2">
            <Button type="button" onClick={() => void createListing()}>
              {copy.submitListing}
            </Button>
          </div>
        </div>
      ) : null}
      {step === 1 && listingId ? (
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Contrat de réservation
            <input
              type="file"
              onChange={(event) => void upload("CONTRACT_RESERVATION", event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Reçu bancaire
            <input
              type="file"
              onChange={(event) => void upload("BANK_PAYMENT_RECEIPT", event.target.files?.[0] ?? null)}
            />
          </label>
          <Button type="button" onClick={() => void submit()}>
            {copy.submitReview}
          </Button>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="grid gap-3">
          <p>{copy.tracker}</p>
          <p className="font-mono text-sm">{listingId}</p>
          <Button type="button" onClick={() => void toggleSilent()}>
            {copy.toggleSilent}: {silentExit ? "ON" : "OFF"}
          </Button>
        </div>
      ) : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
      <div className="mt-3 flex gap-2 text-xs text-[var(--muted)]">
        {STEPS.map((item, index) => (
          <span key={item} className={index === step ? "font-bold" : ""}>
            {index + 1}
          </span>
        ))}
      </div>
    </Card>
  );
}

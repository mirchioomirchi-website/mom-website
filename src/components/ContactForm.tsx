"use client";

import { useState } from "react";
import Link from "next/link";
import { trackGenerateLead } from "@/lib/analytics-events";
import { SITE_CONTENT } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

const {
  nameLabel,
  namePlaceholder,
  emailLabel,
  emailPlaceholder,
  queryTypeLabel,
  queryTypePlaceholder,
  queryOptions,
  subjectLabel,
  subjectPlaceholder,
  messageLabel,
  messagePlaceholder,
  submitLabel,
} = SITE_CONTENT.contactPage.form;

// Shared underline-field styling — transparent background, green rule.
const fieldClass =
  "w-full bg-transparent border-0 border-b-2 border-green py-3 text-lg text-dark placeholder:text-dark/60 outline-none focus:border-red transition-colors";

// Persistent visible label above each field — same pattern already used on
// the order-tracking form (TrackPageClient.tsx), so the two forms on the
// site look and behave consistently.
const labelClass = "block text-xl font-bold text-dark mb-2";

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);
    const queryType = String(data.get("queryType") || "");
    const rawSubject = String(data.get("subject") || "");
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      subject: [queryType, rawSubject].filter(Boolean).join(" — "),
      message: String(data.get("message") || ""),
      website: String(data.get("website") || ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error || `Couldn't send (${res.status})`);
      }
      setStatus("sent");
      trackGenerateLead("contact_form");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" aria-live="polite" className="bg-green/10 p-7 md:p-8 text-center">
        <p className="text-tag text-green uppercase tracking-[0.08em] mb-2">Message sent</p>
        <p className="text-body text-dark/80">
          Got it. We&apos;ll get back to you within one working day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      {/* Honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden"
        aria-hidden="true"
      />

      <label className="block">
        <span className={labelClass}>{nameLabel}</span>
        <input
          type="text"
          name="name"
          required
          maxLength={100}
          autoComplete="name"
          placeholder={namePlaceholder}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>{emailLabel}</span>
        <input
          type="email"
          name="email"
          required
          inputMode="email"
          maxLength={150}
          autoComplete="email"
          placeholder={emailPlaceholder}
          className={fieldClass}
        />
      </label>

      <label className="block relative">
        <span className={labelClass}>{queryTypeLabel}</span>
        <select
          name="queryType"
          defaultValue=""
          className={`${fieldClass} appearance-none pr-8 cursor-pointer`}
        >
          <option value="" disabled className="text-dark/60">
            {queryTypePlaceholder}
          </option>
          {queryOptions.map((opt) => (
            <option key={opt} value={opt} className="text-dark">
              {opt}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-0 bottom-3 text-green">
          <ChevronDown />
        </span>
      </label>

      <label className="block">
        <span className={labelClass}>{subjectLabel}</span>
        <input
          type="text"
          name="subject"
          maxLength={150}
          placeholder={subjectPlaceholder}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>{messageLabel}</span>
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={4000}
          rows={1}
          placeholder={messagePlaceholder}
          className={`${fieldClass} resize-none`}
        />
      </label>

      {error && (
        <p role="alert" className="text-body-sm text-red bg-red/10 px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="text-btn font-bold inline-flex items-center justify-center gap-2 bg-green text-cream px-8 py-4 hover:bg-green/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? "Sending…" : submitLabel}
      </button>

      <p className="text-[0.72rem] text-dark/60">
        We&apos;ll only use these details to respond to your message. See our{" "}
        <Link href="/privacy" className="underline hover:text-dark/70">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

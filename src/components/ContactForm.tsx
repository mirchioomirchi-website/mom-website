"use client";

import { useState } from "react";
import { trackGenerateLead } from "@/lib/analytics-events";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      subject: String(data.get("subject") || ""),
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
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-mom-green/30 bg-mom-green/[0.06] p-7 md:p-8 text-center"
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-mom-green mb-2 font-semibold">
          Message sent
        </p>
        <p className="text-base text-white/90 leading-relaxed">
          Got it. We&apos;ll get back to you within one working day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 md:space-y-5">
      {/* Honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden"
        aria-hidden="true"
      />

      <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-[0.25em] text-white/75 mb-1.5">
            Name
          </span>
          <input
            type="text"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white outline-none focus:border-mom-pink/60 transition-colors"
          />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-[0.25em] text-white/75 mb-1.5">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            inputMode="email"
            maxLength={150}
            autoComplete="email"
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white outline-none focus:border-mom-pink/60 transition-colors"
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-[11px] uppercase tracking-[0.25em] text-white/75 mb-1.5">
          Subject <span className="text-white/40 normal-case tracking-normal">(optional)</span>
        </span>
        <input
          type="text"
          name="subject"
          maxLength={150}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white outline-none focus:border-mom-pink/60 transition-colors"
        />
      </label>

      <label className="block">
        <span className="block text-[11px] uppercase tracking-[0.25em] text-white/75 mb-1.5">
          Message
        </span>
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={4000}
          rows={5}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white outline-none focus:border-mom-pink/60 transition-colors resize-y"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="text-sm text-mom-red bg-mom-red/10 border border-mom-red/30 rounded-xl px-4 py-3"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full sm:w-auto px-7 py-3 bg-mom-pink text-white text-[12px] uppercase tracking-[0.2em] font-quirk rounded-full hover:bg-mom-pink/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

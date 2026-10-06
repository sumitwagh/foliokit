"use client";

import { useId, useState } from "react";

export function Field({
  label,
  name,
  type = "text",
  error,
  hint,
  defaultValue,
  autoComplete,
  required = true,
  extra,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  hint?: string;
  defaultValue?: string;
  autoComplete?: string;
  required?: boolean;
  extra?: React.ReactNode;
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const describedBy = [error ? `${id}-err` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label">
          {label}
        </label>
        {extra}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPassword && show ? "text" : type}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`input ${isPassword ? "pr-20" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-2 hover:bg-paper"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: React.ReactNode }) {
  const cls = tone === "error" ? "bg-danger-bg text-danger" : tone === "success" ? "bg-ok-bg text-ok" : "bg-lilac text-plum";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-[15px] ${cls}`}>
      {children}
    </div>
  );
}

export function SubmitButton({ pending, children, pendingText }: { pending: boolean; children: React.ReactNode; pendingText: string }) {
  return (
    <button type="submit" disabled={pending} className="btn btn-primary h-12 w-full text-base">
      {pending ? pendingText : children}
    </button>
  );
}

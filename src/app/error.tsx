"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Something went wrong on our side</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-2">Try again in a moment. If it keeps happening, email us and mention code {error.digest ?? "unknown"}.</p>
        <button type="button" onClick={reset} className="btn btn-primary mt-6">
          Try again
        </button>
      </div>
    </div>
  );
}

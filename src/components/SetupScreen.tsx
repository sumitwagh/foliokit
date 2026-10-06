/** Shown instead of the store until the required settings are added to .env.local */
export function SetupScreen({ missing }: { missing: string[] }) {
  return (
    <main id="main" className="container-x grid min-h-dvh place-items-center py-16">
      <div className="card max-w-xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Almost there: connect your services</h1>
        <p className="mt-3 text-ink-2">
          The store can&apos;t load until it knows how to reach your database. Add these settings to a file called{" "}
          <code className="rounded bg-paper px-1.5 py-0.5">.env.local</code> in the project folder (or to your hosting
          provider&apos;s environment variables), then restart.
        </p>
        <ul className="mt-5 grid gap-2">
          {missing.map((m) => (
            <li key={m} className="rounded-xl bg-paper px-3 py-2 font-mono text-sm">
              {m}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted">Step-by-step instructions are in SETUP.md, section 2.</p>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="text-[96px] font-semibold leading-none tracking-[-0.05em] text-line-2">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">This page isn&apos;t here</h1>
        <p className="mt-2 text-ink-2">The link may be old, or the template may have moved.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/templates" className="btn btn-primary">
            Browse templates
          </Link>
          <Link href="/" className="btn btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

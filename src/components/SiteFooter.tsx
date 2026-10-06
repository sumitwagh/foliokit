import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { site } from "@/config/site";

export function SiteFooter() {
  const social = Object.entries(site.social).filter(([, url]) => url);
  return (
    <footer className="mt-24 border-t border-line bg-surface pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 text-[19px] font-semibold tracking-tight">
            <LogoMark /> {site.name}
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Portfolio website templates made by a working designer. Pay once, keep them forever.
          </p>
        </div>
        <FooterCol title="Shop">
          <FooterLink href="/templates">All templates</FooterLink>
          <FooterLink href="/#free">Free template</FooterLink>
          <FooterLink href="/#pricing">Pricing</FooterLink>
          <FooterLink href="/#faq">FAQ</FooterLink>
        </FooterCol>
        <FooterCol title="Account">
          <FooterLink href="/account">My library</FooterLink>
          <FooterLink href="/account/orders">Order history</FooterLink>
          <FooterLink href="/login">Log in</FooterLink>
          <FooterLink href="/signup">Sign up</FooterLink>
        </FooterCol>
        <FooterCol title="Help">
          <FooterLink href={`mailto:${site.supportEmail}`}>{site.supportEmail}</FooterLink>
          <FooterLink href="/license">License</FooterLink>
          <FooterLink href="/refunds">Refund policy</FooterLink>
          <FooterLink href="/terms">Terms</FooterLink>
          <FooterLink href="/privacy">Privacy</FooterLink>
        </FooterCol>
      </div>
      <div className="container-x flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted">
        <p>
          © {new Date().getFullYear()} {site.ownerName}. Payments are processed securely by Dodo Payments, our merchant of record.
        </p>
        {social.length > 0 && (
          <div className="flex gap-4">
            {social.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-ink">
                {name}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <ul className="mt-3 grid gap-2">{children}</ul>
    </div>
  );
}
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[15px] text-muted transition-colors hover:text-ink">
        {children}
      </Link>
    </li>
  );
}

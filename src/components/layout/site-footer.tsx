import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Youtube, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const columns = [
  {
    title: "Marketplace",
    links: [
      { to: "/marketplace", label: "All crafts" },
      { to: "/marketplace?cat=textiles", label: "Textiles" },
      { to: "/marketplace?cat=pottery", label: "Pottery" },
      { to: "/marketplace?cat=jewellery", label: "Jewellery" },
      { to: "/reverse-marketplace", label: "Reverse marketplace" },
    ],
  },
  {
    title: "Platform",
    links: [
      { to: "/digital-twin", label: "Digital Twin" },
      { to: "/ai-features", label: "AI Features" },
      { to: "/kiosk", label: "Smart Kiosks" },
      { to: "/india-post", label: "India Post logistics" },
      { to: "/schemes", label: "Govt. schemes" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/team", label: "Team TAARANG" },
      { to: "/research", label: "Field research" },
      { to: "/contact", label: "Contact" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-earth text-cream">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img src={logo} alt="NAVSHAKTHI" width={44} height={44} className="h-11 w-11 brightness-125" />
              <div>
                <div className="font-display text-xl">NAVSHAKTHI</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-cream/60">Culture · Crafts · AI</div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-cream/70">
              An AI-powered marketplace connecting India's 70 lakh rural artisans to the world — with dignity, provenance, and government-backed livelihoods.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Twitter, Facebook, Youtube, Mail].map((Icon, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-cream/20 text-cream/70 transition hover:border-gold hover:text-gold" aria-label="social">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{c.title}</div>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to as any} className="text-sm text-cream/70 hover:text-cream transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} NAVSHAKTHI · Team TAARANG · Built for StartupTN Grand Finale.</div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-cream/20 px-3 py-1">Craftmark partner</span>
            <span className="rounded-full border border-cream/20 px-3 py-1">India Post enabled</span>
            <span className="rounded-full border border-cream/20 px-3 py-1">Made in Bharat</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

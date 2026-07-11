import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Terms of use" title="The rules of the marketplace." />
      <section className="container-x py-20 max-w-3xl space-y-6 text-sm leading-relaxed text-foreground/80">
        <p>By using NAVSHAKTHI, you agree to uphold the dignity of India's artisan community. Counterfeit listings, mass-produced imitations, and misrepresentation of provenance lead to permanent bans.</p>
        <p>Buyers agree to fair-trade pricing floors. Artisans retain 100% of their listed price minus a flat 4% platform fee that funds Smart Kiosks in new villages.</p>
        <p>All disputes are resolved through the Craft Council of India arbitration process, seated in Chennai.</p>
      </section>
    </PublicPage>
  ),
});

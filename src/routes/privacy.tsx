import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Privacy policy" title="Your data. Your consent. Always." />
      <section className="container-x py-20 max-w-3xl prose-neutral space-y-6 text-sm leading-relaxed text-foreground/80">
        <p>NAVSHAKTHI is committed to protecting the personal data of every artisan, buyer, and partner. This page summarises our commitments; the full policy is co-drafted with the Data Protection Officer of Team TAARANG.</p>
        <h3 className="font-display text-2xl text-foreground">What we collect</h3>
        <p>Name, contact details, Aadhaar (only for KYC), craft catalogue, order history, and payment metadata. Nothing more.</p>
        <h3 className="font-display text-2xl text-foreground">How we use it</h3>
        <p>To match artisans to buyers, to enable government scheme applications with explicit consent, and to improve our AI models via anonymised aggregates.</p>
        <h3 className="font-display text-2xl text-foreground">Your rights under DPDP Act 2023</h3>
        <p>You have the right to access, correct, erase, and port your data. Requests: privacy@navshakthi.in.</p>
      </section>
    </PublicPage>
  ),
});

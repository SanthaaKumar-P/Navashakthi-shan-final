import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";

const faqs = [
  { q: "How does NAVSHAKTHI verify a craft is authentic?", a: "Every craft passes through our AI Authenticity Score (vision + material fingerprinting) and receives a blockchain-anchored Digital Twin ID." },
  { q: "How do artisans get paid?", a: "Directly to their UPI or Jan Dhan account, within 24 hours of dispatch. No middlemen. No hidden fees. Impact contributions from buyers are added on top." },
  { q: "Which languages does the platform support?", a: "The artisan portal ships in English + 11 Indian languages (Tamil, Hindi, Telugu, Bengali, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, Assamese)." },
  { q: "How does India Post work with NAVSHAKTHI?", a: "Postmen collect from the artisan's home. India Post handles the entire domestic + international journey via Speed Post and EMS." },
  { q: "Can I visit an artisan's village?", a: "Yes — we run cultural immersion tours in partnership with the artisan clusters. Contact us for the current calendar." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Questions & answers" title="Everything you might want to know." />
      <section className="container-x py-20 max-w-3xl">
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border/60 bg-card p-6 open:shadow-elegant">
              <summary className="cursor-pointer list-none font-display text-lg flex items-center justify-between">
                {f.q}
                <span className="text-clay text-2xl group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </PublicPage>
  ),
});

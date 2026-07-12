import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { CraftPassport } from "@/components/passport/CraftPassport";
import { products } from "@/lib/mock-data";

const p = products[0];

const passport = {
  id: "NVSH-CP-208419",
  name: p.name,
  artisan: p.artisan,
  village: p.village,
  district: "Kutch",
  state: p.state,
  category: p.category,
  handmadeScore: 96,
  authenticity: p.authenticity,
  aiStatus: "AI Verified",
  craftmark: true,
  twinId: "0xTW·NVSH·4001·A7C2E9",
  govStatus: "Government approved",
  date: "12 Jul 2026",
  material: p.materials.join(", "),
  buildTime: "9 days",
  technique: "Hand-thrown · Warli motifs",
  impact: "Rice husk fired · zero plastic",
  story: p.story,
  image: p.image,
};

function Page() {
  return (
    <PublicPage>
      <PageHero eyebrow="Feature · Provenance" title="Digital Craft Passport" subtitle="Every verified craft receives a printable, blockchain-anchored certificate — the definitive record of who, where, and how it was made." />
      <section className="container-x py-16">
        <Reveal>
          <CraftPassport data={passport} onDownload={() => toast.success("Passport downloaded", { description: passport.id })} />
        </Reveal>

        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          <p>Every field on this passport is signed by three parties: the artisan, NAVSHAKTHI's AI pipeline, and a government reviewer. The Digital Twin ID is written to a public ledger, so buyers can independently verify — even 50 years from now.</p>
        </div>
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/craft-passport")({
  head: () => ({ meta: [
    { title: "Digital Craft Passport — NAVSHAKTHI" },
    { name: "description", content: "Printable, blockchain-anchored provenance certificate for every verified craft." },
  ] }),
  component: Page,
});

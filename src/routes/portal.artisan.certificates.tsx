import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Award, Download, ShieldCheck } from "lucide-react";
import { GenericSection } from "@/components/portal-sections";
import { downloadCertificatePdf } from "@/lib/download-pdf";
import { useAuth } from "@/lib/auth-context";

const CERTS = [
  { title: "Craftmark 2026", subtitle: "Handloom Authenticity · Kutch", seal: "Craftmark" },
  { title: "PM Vishwakarma", subtitle: "Traditional Artisan Recognition", seal: "Government of India" },
  { title: "GI Kanchipuram Silk", subtitle: "Geographical Indication · Verified", seal: "GI Registry" },
  { title: "NSDC Photography L1", subtitle: "National Skill Certification", seal: "NSDC" },
  { title: "MSME Udyam", subtitle: "Micro Enterprise Registration", seal: "MSME" },
] as const;

function Page() {
  const { user } = useAuth();
  const holder = user?.name || "Lakshmi Devi";

  const handleDownload = (title: string, subtitle: string, seal: string, idx: number) => {
    downloadCertificatePdf({
      title,
      subtitle,
      seal,
      holder,
      id: `NVSH-${title.split(" ")[0].toUpperCase()}-${2600 + idx * 113}`,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
      authority: "Team NAVSHAKTHI",
    });
    toast.success(`${title} downloaded`, { description: "Your certificate PDF is ready." });
  };

  return (
    <GenericSection title="Certificates" subtitle="Every recognition, digitally verified & printable.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CERTS.map((c, i) => (
          <div key={c.title} className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 text-center transition hover:-translate-y-1 hover:shadow-elegant">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-clay via-gold to-primary" />
            <Award className="mx-auto h-12 w-12 text-gold" />
            <div className="mt-4 font-display text-lg text-earth">{c.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.subtitle}</div>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3 w-3" /> Verified · 2026
            </div>
            <button
              onClick={() => handleDownload(c.title, c.subtitle, c.seal, i)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
          </div>
        ))}
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/certificates")({
  component: Page,
});

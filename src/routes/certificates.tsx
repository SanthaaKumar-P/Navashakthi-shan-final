import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { CertificateSheet } from "@/components/certificates/CertificateSheet";
import { certificateTypes } from "@/lib/enterprise-data";
import { downloadCertificatePdf } from "@/lib/download-pdf";
import { Download } from "lucide-react";

function Page() {
  return (
    <PublicPage>
      <PageHero eyebrow="Feature · Certificates" title="Certificate management" subtitle="Every recognition, in a beautiful printable format — ready to share with buyers, banks and boards." />

      <section className="container-x py-16 space-y-10">
        {certificateTypes.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.04}>
            <div>
              <CertificateSheet
                title={c.title}
                subtitle={c.subtitle}
                holder="Lakshmi Devi"
                id={`NVSH-${c.id.toUpperCase()}-${1000 + i * 137}`}
                date={new Date().toLocaleDateString("en-IN")}
                seal={c.seal}
              />
              <div className="mx-auto mt-4 flex max-w-3xl justify-end">
                <button onClick={() => {
                  downloadCertificatePdf({
                    title: c.title,
                    subtitle: c.subtitle,
                    seal: c.seal,
                    holder: "Lakshmi Devi",
                    id: `NVSH-${c.id.toUpperCase()}-${1000 + i * 137}`,
                    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
                  });
                  toast.success(`${c.title} downloaded`);
                }} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/certificates")({
  head: () => ({ meta: [{ title: "Certificates — NAVSHAKTHI" }] }),
  component: Page,
});

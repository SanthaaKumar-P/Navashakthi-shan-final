import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GenericSection } from "@/components/portal-sections";
import { schemes } from "@/lib/mock-data";
import { Landmark, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Status = "idle" | "applying" | "applied";

function Page() {
  const [status, setStatus] = useState<Record<string, Status>>({});

  const apply = (code: string, name: string) => {
    if (status[code] === "applying" || status[code] === "applied") return;
    setStatus((s) => ({ ...s, [code]: "applying" }));
    toast.loading(`Submitting your application to ${name}…`, { id: code });
    setTimeout(() => {
      setStatus((s) => ({ ...s, [code]: "applied" }));
      const ref = `NS-${code}-${Math.floor(1000 + Math.random() * 8999)}`;
      toast.success(`Applied to ${name}`, { id: code, description: `Reference ID ${ref}. Officer review in 3–5 working days.` });
    }, 1400);
  };

  return (
    <GenericSection title="Government schemes matched for you" subtitle="AI matches you to schemes based on your craft, region and eligibility.">
      <div className="grid gap-4 lg:grid-cols-2">
        {schemes.slice(0, 6).map((s) => {
          const st = status[s.code] ?? "idle";
          return (
            <div key={s.code} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Landmark className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg">{s.name}</span>
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-earth">{s.tag}</span>
                </div>
                <div className="mt-1 text-xs text-primary">{s.benefit}</div>
                <button
                  onClick={() => apply(s.code, s.name)}
                  disabled={st !== "idle"}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
                >
                  {st === "applying" && <Loader2 className="h-3 w-3 animate-spin" />}
                  {st === "applied" && <Check className="h-3 w-3" />}
                  {st === "applied" ? "Application submitted" : st === "applying" ? "Applying…" : "Apply"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/schemes")({ component: Page });

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { SlotGrid, generateDaySlots } from "@/components/booking/SlotGrid";
import { CertificateSheet } from "@/components/certificates/CertificateSheet";
import { courses } from "@/lib/enterprise-data";
import { Sun, Sunset, Moon, Calendar, CheckCircle2 } from "lucide-react";

function Page() {
  const [course, setCourse] = useState(courses[0].id);
  const [view, setView] = useState<"Monthly" | "Weekly" | "Daily">("Weekly");
  const [session, setSession] = useState<"Morning" | "Afternoon" | "Evening">("Morning");
  const [slot, setSlot] = useState<string>();
  const [confirmed, setConfirmed] = useState(false);

  const chosen = courses.find((c) => c.id === course)!;
  const slots = generateDaySlots();

  return (
    <PublicPage>
      <PageHero eyebrow="Feature · Workshop booking" title="Reserve your workshop slot" subtitle="Live availability updated every minute. Green = open, yellow = filling up, red = booked out." />

      <section className="container-x py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Choose course</div>
              <select value={course} onChange={(e) => setCourse(e.target.value)} className="mt-2 w-full rounded-xl border border-border/60 bg-background p-3 text-sm">
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <div className="mt-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">View</div>
              <div className="mt-2 flex gap-2">
                {(["Monthly", "Weekly", "Daily"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} className={`rounded-full border px-3 py-1.5 text-xs ${view === v ? "border-primary bg-primary text-primary-foreground" : "border-border/60"}`}>{v}</button>
                ))}
              </div>

              <div className="mt-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Session</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[{k:"Morning",I:Sun},{k:"Afternoon",I:Sunset},{k:"Evening",I:Moon}].map(({k,I}) => (
                  <button key={k} onClick={() => setSession(k as any)} className={`rounded-2xl border p-3 text-xs font-semibold ${session === k ? "border-primary bg-primary/5 text-primary" : "border-border/60"}`}>
                    <I className="mx-auto h-4 w-4" /><div className="mt-1">{k}</div><div className="text-[10px] font-normal text-muted-foreground">10 slots</div>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{chosen.name}</div>
                  <div className="font-display text-2xl">{view} · {session}</div>
                </div>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-5"><SlotGrid slots={slots} onPick={setSlot} selected={slot} /></div>
              <button
                disabled={!slot}
                onClick={() => { setConfirmed(true); toast.success("Workshop reserved", { description: `${chosen.name} · ${slot}` }); }}
                className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >Confirm booking</button>
            </div>
          </Reveal>
        </div>

        {confirmed && (
          <Reveal>
            <div className="mt-12">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-primary"><CheckCircle2 className="h-4 w-4" /> Digital pass + certificate preview</div>
              <CertificateSheet
                title="Workshop Enrolment"
                subtitle={chosen.name}
                holder="Lakshmi Devi"
                id={"NVSH-WS-" + Math.floor(10000 + Math.random() * 89999)}
                date={new Date().toLocaleDateString("en-IN")}
                seal="Digital Pass"
              />
            </div>
          </Reveal>
        )}
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/workshop-booking")({
  head: () => ({ meta: [{ title: "Workshop Booking — NAVSHAKTHI" }] }),
  component: Page,
});

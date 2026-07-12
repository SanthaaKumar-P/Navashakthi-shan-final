import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { SlotGrid, generateDaySlots } from "@/components/booking/SlotGrid";
import { KIOSKS } from "@/components/kiosk/KioskMap";
import { QrCode, MapPin, Clock, CheckCircle2 } from "lucide-react";

const STATES = Array.from(new Set(KIOSKS.map((k) => k.state)));

function Page() {
  const [state, setState] = useState(STATES[0]);
  const [kiosk, setKiosk] = useState(KIOSKS[0].id);
  const [date, setDate] = useState(() => new Date(Date.now() + 86400_000).toISOString().slice(0, 10));
  const [time, setTime] = useState<string | undefined>();
  const [ticket, setTicket] = useState<{ token: string; wait: number } | null>(null);

  const kioskOptions = KIOSKS.filter((k) => k.state === state);
  const slots = generateDaySlots();
  const chosen = KIOSKS.find((k) => k.id === kiosk);

  const confirm = () => {
    if (!time) return toast.error("Pick a time slot");
    const token = "K-" + Math.floor(1000 + Math.random() * 9000);
    setTicket({ token, wait: Math.floor(Math.random() * 25) + 5 });
    toast.success("Appointment confirmed", { description: `Token ${token}` });
  };

  return (
    <PublicPage>
      <PageHero eyebrow="Feature · Appointment" title="Book a Smart Kiosk visit" subtitle="Zero-wait service at your nearest village centre. Choose a slot, get your QR + token, arrive stress-free." />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="space-y-5 rounded-3xl border border-border/60 bg-card p-6">
              <Field label="State">
                <select value={state} onChange={(e) => { setState(e.target.value); setKiosk(KIOSKS.find(k => k.state === e.target.value)!.id); }} className="w-full rounded-xl border border-border/60 bg-background p-3 text-sm">
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="District / Kiosk">
                <select value={kiosk} onChange={(e) => setKiosk(e.target.value)} className="w-full rounded-xl border border-border/60 bg-background p-3 text-sm">
                  {kioskOptions.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </Field>
              <Field label="Date">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-border/60 bg-background p-3 text-sm" />
              </Field>
              <Field label="Time slot">
                <SlotGrid slots={slots} onPick={setTime} selected={time} />
              </Field>
              <button onClick={confirm} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Confirm appointment</button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {!ticket ? (
              <div className="grid h-full min-h-[400px] place-items-center rounded-3xl border-2 border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                Your appointment slip will appear here.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border-2 border-gold/40 bg-cream shadow-elegant">
                <div className="bg-primary p-5 text-primary-foreground">
                  <div className="text-[10px] uppercase tracking-widest opacity-80">NAVSHAKTHI · Kiosk appointment</div>
                  <div className="mt-1 font-display text-2xl">Appointment confirmed</div>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-6 p-6">
                  <div className="space-y-3 text-sm">
                    <Row icon={MapPin} k="Kiosk" v={chosen!.name} />
                    <Row icon={MapPin} k="State" v={chosen!.state} />
                    <Row icon={Clock} k="Date & time" v={`${date} · ${time}`} />
                    <Row icon={CheckCircle2} k="Token" v={ticket.token} />
                    <Row icon={Clock} k="Est. wait" v={`${ticket.wait} min`} />
                  </div>
                  <div className="text-center">
                    <div className="grid h-32 w-32 place-items-center rounded-2xl border border-earth bg-white">
                      <QrCode className="h-24 w-24 text-earth" />
                    </div>
                    <div className="mt-2 font-display text-xl text-earth">{ticket.token}</div>
                  </div>
                </div>
                <div className="border-t border-gold/30 bg-primary/5 p-4 text-center text-xs text-muted-foreground">
                  Show this QR at the kiosk reception to skip the queue.
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </PublicPage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
function Row({ icon: Icon, k, v }: { icon: any; k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div><div className="font-semibold text-earth">{v}</div></div>
    </div>
  );
}

export const Route = createFileRoute("/kiosk-appointment")({
  head: () => ({ meta: [{ title: "Book a Kiosk Appointment — NAVSHAKTHI" }] }),
  component: Page,
});

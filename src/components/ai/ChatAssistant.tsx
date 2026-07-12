import { useEffect, useRef, useState } from "react";
import { Bot, Mic, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "ai"; text: string }

const QUICK = [
  "How do I register as an artisan?",
  "Where is the nearest Smart Kiosk?",
  "Book a pottery workshop",
  "Which schemes can I apply to?",
  "How do I upload a product?",
  "Track my AI verification",
  "Explain Digital Twin",
];

function reply(q: string): string {
  const l = q.toLowerCase();
  if (l.includes("register")) return "Head to Sign up → choose Artisan role. You'll get a NAVSHAKTHI ID, Craftmark eligibility, and a linked PM Vishwakarma profile in under 3 minutes.";
  if (l.includes("kiosk")) return "Open Smart Kiosk Portal to find the nearest of 1,240+ village centres. Book an appointment slip with QR + token for zero-wait service.";
  if (l.includes("workshop") || l.includes("training")) return "Training Portal has 24 govt-sponsored courses across 9 crafts. Slots open weekly — morning, afternoon and evening. Free for verified artisans.";
  if (l.includes("scheme")) return "Based on your craft, PM Vishwakarma, Mudra Kishor and TRIFED are pre-matched. Visit Schemes to apply with your Udyam number.";
  if (l.includes("upload")) return "Go to Artisan Portal → Upload Craft. Drop 5 photos + a short video → AI Authentication runs a 12-step scan → Craftmark issued in 24 hours.";
  if (l.includes("verif")) return "Every submission runs Gemini Vision + CNN pattern models, then a human government reviewer approves the Craftmark within 24 hours.";
  if (l.includes("twin")) return "Digital Twin turns your craft into a 3D asset with a blockchain-anchored ID. Every buyer can inspect provenance, materials and story.";
  return "Ask me about registration, kiosks, workshops, schemes, uploads or Digital Twin — I'm trained on the full NAVSHAKTHI knowledge base.";
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Namaste 🙏 I'm NAVSHAKTHI AI — ask me anything about crafts, kiosks or schemes." },
  ]);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [msgs, open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setQ("");
    setTimeout(() => setMsgs((m) => [...m, { role: "ai", text: reply(t) }]), 550);
  };

  const startVoice = () => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { send("Voice input"); return; }
    const r = new SR();
    r.lang = "en-IN"; r.onresult = (e: any) => setQ(e.results[0][0].transcript);
    r.onstart = () => setListening(true); r.onend = () => setListening(false);
    r.start();
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" /> Ask NAVSHAKTHI AI
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elegant animate-scale-in">
          <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-primary-foreground">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><Bot className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm">NAVSHAKTHI AI</div>
              <div className="text-[10px] uppercase tracking-widest opacity-80">Online · powered by Gemini</div>
            </div>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"><X className="h-4 w-4" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" && "justify-end")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border border-border/60",
                )}>{m.text}</div>
              </div>
            ))}
            {msgs.length <= 2 && (
              <div className="pt-2">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Try asking</div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK.map((q) => (
                    <button key={q} onClick={() => send(q)} className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] hover:bg-muted">{q}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(q); }} className="flex items-center gap-2 border-t border-border/60 bg-background p-2.5">
            <button type="button" onClick={startVoice} title="Voice" className={cn("grid h-9 w-9 place-items-center rounded-full border border-border/60", listening && "bg-clay text-white")}>
              <Mic className="h-4 w-4" />
            </button>
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button type="submit" className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}

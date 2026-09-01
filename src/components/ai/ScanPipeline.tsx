import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const SCAN_STEPS = [
  "Scanning texture…",
  "Detecting carving patterns…",
  "Checking hand-tool marks…",
  "Comparing with traditional craft database…",
  "Running Vision Transformer on materials…",
  "Duplicate check across 84,500 crafts…",
  "Cross-referencing GI registry…",
  "Generating Digital Twin mesh…",
  "Minting blockchain ID…",
  "Computing authenticity score…",
];

export function ScanPipeline({
  running,
  onDone,
  steps = SCAN_STEPS,
  title = "AI Authenticity Pipeline",
  interval = 620,
}: {
  running: boolean;
  onDone?: () => void;
  steps?: string[];
  title?: string;
  interval?: number;
}) {
  const SCAN_STEPS = steps;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!running) { setI(0); return; }
    if (i >= SCAN_STEPS.length) { onDone?.(); return; }
    const t = setTimeout(() => setI((x) => x + 1), interval);
    return () => clearTimeout(t);
  }, [running, i, onDone, SCAN_STEPS.length, interval]);

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg">{title}</div>
        <div className="text-xs font-semibold text-muted-foreground">
          {running ? `Step ${Math.min(i + 1, SCAN_STEPS.length)}/${SCAN_STEPS.length}` : "Ready"}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-gold to-clay"
          animate={{ width: `${(Math.min(i, SCAN_STEPS.length) / SCAN_STEPS.length) * 100}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>
      <ol className="mt-5 space-y-2">
        {SCAN_STEPS.map((s, idx) => {
          const done = idx < i;
          const active = idx === i && running;
          return (
            <li key={s} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm", active && "bg-primary/5")}>
              <span className={cn(
                "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold",
                done ? "bg-primary text-primary-foreground" : active ? "bg-gold text-earth" : "bg-muted text-muted-foreground",
              )}>
                {done ? <Check className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : idx + 1}
              </span>
              <span className={cn(done ? "text-foreground" : "text-muted-foreground", active && "font-semibold text-foreground")}>{s}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

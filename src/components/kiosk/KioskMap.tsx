import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Kiosk { id: string; name: string; state: string; x: number; y: number; live: boolean }

export const KIOSKS: Kiosk[] = [
  { id: "k1", name: "Jaipur Village Centre", state: "Rajasthan", x: 28, y: 30, live: true },
  { id: "k2", name: "Kanchipuram Kiosk", state: "Tamil Nadu", x: 45, y: 76, live: true },
  { id: "k3", name: "Bhuj Craft Hub", state: "Gujarat", x: 15, y: 40, live: true },
  { id: "k4", name: "Majuli Bamboo Kiosk", state: "Assam", x: 82, y: 30, live: true },
  { id: "k5", name: "Channapatna Wood Studio", state: "Karnataka", x: 38, y: 68, live: false },
  { id: "k6", name: "Swamimalai Bronze Kiosk", state: "Tamil Nadu", x: 46, y: 72, live: true },
  { id: "k7", name: "Mahabalipuram Stone Kiosk", state: "Tamil Nadu", x: 50, y: 74, live: true },
  { id: "k8", name: "Varanasi Handloom Hub", state: "Uttar Pradesh", x: 55, y: 40, live: true },
  { id: "k9", name: "Srinagar Pashmina Kiosk", state: "J&K", x: 32, y: 12, live: true },
  { id: "k10", name: "Puri Pattachitra Centre", state: "Odisha", x: 62, y: 55, live: true },
];

export function KioskMap({ onSelect, selected }: { onSelect?: (k: Kiosk) => void; selected?: string }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-cream via-background to-gold/10 p-4">
      {/* Stylised India silhouette */}
      <svg viewBox="0 0 100 120" className="absolute inset-0 h-full w-full opacity-20">
        <path d="M30,8 Q45,4 55,10 Q68,14 72,22 L80,30 Q90,42 82,55 L78,70 Q72,88 55,100 L48,110 L42,100 Q30,88 24,72 L20,55 Q14,42 22,30 Z" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
      </svg>
      {KIOSKS.map((k) => (
        <button
          key={k.id}
          onClick={() => onSelect?.(k)}
          style={{ left: `${k.x}%`, top: `${k.y}%` }}
          className={cn(
            "group absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition",
            selected === k.id && "z-10",
          )}
        >
          <span className={cn(
            "grid h-6 w-6 place-items-center rounded-full border-2 shadow-elegant transition group-hover:scale-125",
            k.live ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground bg-background text-muted-foreground",
            selected === k.id && "scale-150 ring-2 ring-gold",
          )}>
            <MapPin className="h-3 w-3" />
          </span>
          {k.live && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/40" />}
          <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-earth px-2 py-0.5 text-[10px] font-semibold text-cream opacity-0 shadow group-hover:opacity-100">
            {k.name}
          </span>
        </button>
      ))}
    </div>
  );
}

import { cn } from "@/lib/utils";

export type SlotStatus = "available" | "almost" | "booked";
export interface Slot { time: string; status: SlotStatus }

export function SlotGrid({ slots, onPick, selected }: { slots: Slot[]; onPick?: (t: string) => void; selected?: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {slots.map((s) => {
        const disabled = s.status === "booked";
        const tone = s.status === "available" ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-800"
          : s.status === "almost" ? "border-amber-500/40 bg-amber-500/5 text-amber-800"
          : "border-red-400/40 bg-red-500/5 text-red-700 line-through";
        return (
          <button
            key={s.time}
            disabled={disabled}
            onClick={() => onPick?.(s.time)}
            className={cn(
              "rounded-2xl border px-3 py-3 text-sm font-medium transition",
              tone,
              selected === s.time && "ring-2 ring-primary",
              !disabled && "hover:-translate-y-0.5",
            )}
          >
            {s.time}
            <div className="mt-1 text-[10px] uppercase tracking-widest opacity-70">
              {s.status === "available" ? "Available" : s.status === "almost" ? "Almost full" : "Booked"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function generateDaySlots(): Slot[] {
  const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  const statuses: SlotStatus[] = ["available","available","almost","booked","available","almost","available","booked","available","available"];
  return times.map((t, i) => ({ time: t, status: statuses[i] }));
}

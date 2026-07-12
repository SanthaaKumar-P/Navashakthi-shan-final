import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  Camera,
  Globe2,
  BadgeCheck,
  Wallet,
  Lightbulb,
  RefreshCw,
  Check,
  X,
  Clock,
  Filter,
} from "lucide-react";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { cn } from "@/lib/utils";

type Category = "growth" | "content" | "market" | "certification" | "finance";
type Status = "new" | "acted" | "snoozed" | "dismissed";

interface Suggestion {
  id: string;
  title: string;
  detail: string;
  category: Category;
  impact: "High" | "Medium" | "Low";
  confidence: number; // 0-100
  eta: string;
  status: Status;
}

const CATEGORY_META: Record<Category, { label: string; icon: any; tone: string }> = {
  growth: { label: "Growth", icon: TrendingUp, tone: "bg-primary/10 text-primary" },
  content: { label: "Content", icon: Camera, tone: "bg-clay/10 text-clay" },
  market: { label: "Market", icon: Globe2, tone: "bg-gold/20 text-earth" },
  certification: { label: "Certification", icon: BadgeCheck, tone: "bg-emerald-500/10 text-emerald-700" },
  finance: { label: "Finance", icon: Wallet, tone: "bg-indigo-500/10 text-indigo-700" },
};

const POOL: Omit<Suggestion, "id" | "status">[] = [
  { title: "Add 3 more silk sarees before Diwali", detail: "Demand up 240% in Metros — festive buyers are searching Kanchipuram and Banarasi silks.", category: "growth", impact: "High", confidence: 92, eta: "2 days" },
  { title: "Reshoot pottery photos in morning light", detail: "Your pottery photos would score 22% higher with natural morning light. Watch the 3-min guide.", category: "content", impact: "Medium", confidence: 84, eta: "1 hour" },
  { title: "Try a small 'Warli wall art' collection", detail: "Buyers in USA are searching for Warli wall art — you have adjacent skills. Test 4 pieces.", category: "market", impact: "High", confidence: 78, eta: "1 week" },
  { title: "Finish Kanchipuram GI application", detail: "Application is 92% complete. Add proof of loom purchase to finish.", category: "certification", impact: "High", confidence: 96, eta: "30 min" },
  { title: "Pre-approved Mudra Kishor loan", detail: "You qualify for a ₹2,50,000 loan at 8.5% through PM Vishwakarma. No collateral needed.", category: "finance", impact: "High", confidence: 99, eta: "10 min" },
  { title: "Bundle brass diyas for gifting", detail: "Corporate gifting queries are up 3x. Create a set-of-6 SKU with premium packaging.", category: "growth", impact: "Medium", confidence: 81, eta: "3 days" },
  { title: "Enable multilingual product titles", detail: "French and German buyers convert 34% better when title includes their language.", category: "market", impact: "Medium", confidence: 74, eta: "20 min" },
  { title: "Record a 30-second craft story reel", detail: "Reels with the artisan's face get 4.1x more views than static images.", category: "content", impact: "High", confidence: 88, eta: "1 hour" },
  { title: "Apply for Craftmark on your bamboo range", detail: "AIACA is accepting applications this month. Your baskets already meet 8/10 criteria.", category: "certification", impact: "Medium", confidence: 82, eta: "2 hours" },
  { title: "Offer EMI on orders above ₹5,000", detail: "Enabling no-cost EMI historically lifts conversion by 18% in your price band.", category: "finance", impact: "Low", confidence: 68, eta: "5 min" },
  { title: "Restock rosewood elephants", detail: "3 buyers wishlisted this item last week. You have raw material for 5 more units.", category: "growth", impact: "Medium", confidence: 86, eta: "4 days" },
  { title: "Add a lifestyle shot to every listing", detail: "Products with an in-use photo see 27% longer session time.", category: "content", impact: "Medium", confidence: 79, eta: "2 hours" },
];

const uid = () => Math.random().toString(36).slice(2, 9);

// Deterministic initial slice — same on server + client — prevents hydration mismatch.
function initial(count = 6): Suggestion[] {
  return POOL.slice(0, count).map((s, i) => ({ ...s, id: `s-${i}`, status: "new" }));
}
function shuffle(count = 6): Suggestion[] {
  const arr = [...POOL].sort(() => Math.random() - 0.5).slice(0, count);
  return arr.map((s) => ({ ...s, id: uid(), status: "new" }));
}

function Component() {
  const [items, setItems] = useState<Suggestion[]>(() => initial(6));
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [thinking, setThinking] = useState<string | null>(null);

  const visible = useMemo(
    () => items.filter((i) => (filter === "all" ? true : i.category === filter) && i.status !== "dismissed"),
    [items, filter],
  );

  const stats = useMemo(() => {
    const acted = items.filter((i) => i.status === "acted").length;
    const active = items.filter((i) => i.status === "new").length;
    const avg = items.length
      ? Math.round(items.reduce((s, i) => s + i.confidence, 0) / items.length)
      : 0;
    const high = items.filter((i) => i.impact === "High" && i.status === "new").length;
    return { acted, active, avg, high };
  }, [items]);

  const update = (id: string, status: Status) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  const onAct = (s: Suggestion) => {
    setThinking(s.id);
    setTimeout(() => {
      update(s.id, "acted");
      setThinking(null);
      toast.success("Marked as acted on", { description: s.title });
    }, 700);
  };

  const onSnooze = (s: Suggestion) => {
    update(s.id, "snoozed");
    toast("Snoozed for 24 hours", { description: s.title });
  };

  const onDismiss = (s: Suggestion) => {
    update(s.id, "dismissed");
    toast("Suggestion dismissed", { description: s.title });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setItems((prev) => {
        const keepActed = prev.filter((i) => i.status === "acted");
        const fresh = shuffle(6).filter((f) => !keepActed.some((k) => k.title === f.title));
        return [...keepActed, ...fresh];
      });
      setRefreshing(false);
      toast.success("Fresh AI suggestions ready");
    }, 900);
  };

  return (
    <GenericSection
      title="AI suggestions"
      subtitle="Personalised growth prompts, updated every morning."
    >
      <InfoTiles
        tiles={[
          { label: "Active", value: String(stats.active), hint: `${stats.high} high impact` },
          { label: "Acted on", value: String(stats.acted), hint: "This week" },
          { label: "Avg. confidence", value: `${stats.avg}%`, hint: "Across all prompts" },
          { label: "Model", value: "NAVSHAKTHI AI", hint: "v2.3 · updated today" },
        ]}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter
          </span>
          {(["all", ...Object.keys(CATEGORY_META)] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k as any)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                filter === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-card hover:bg-muted",
              )}
            >
              {k === "all" ? "All" : CATEGORY_META[k as Category].label}
            </button>
          ))}
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-elegant disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Generating…" : "Generate new"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-10 text-center text-sm text-muted-foreground">
            <Lightbulb className="mx-auto mb-3 h-6 w-6 text-gold" />
            No suggestions in this filter. Try another category or generate new.
          </div>
        )}
        {visible.map((s) => {
          const meta = CATEGORY_META[s.category];
          const Icon = meta.icon;
          const isActed = s.status === "acted";
          const isSnoozed = s.status === "snoozed";
          const isBusy = thinking === s.id;
          return (
            <div
              key={s.id}
              className={cn(
                "group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 transition sm:flex-row sm:items-center",
                isActed && "opacity-70",
              )}
            >
              <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", meta.tone)}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {meta.label}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      s.impact === "High"
                        ? "bg-clay/15 text-clay"
                        : s.impact === "Medium"
                          ? "bg-gold/20 text-earth"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s.impact} impact
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {s.eta}
                  </span>
                  {isActed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <Check className="h-3 w-3" /> Acted
                    </span>
                  )}
                  {isSnoozed && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Snoozed
                    </span>
                  )}
                </div>
                <div className="mt-1 font-display text-lg leading-snug text-foreground">{s.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.detail}</div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-[width] duration-700"
                      style={{ width: `${s.confidence}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {s.confidence}% confidence
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
                <button
                  onClick={() => onAct(s)}
                  disabled={isActed || isBusy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {isBusy ? (
                    <>
                      <Sparkles className="h-3 w-3 animate-pulse" /> Working…
                    </>
                  ) : isActed ? (
                    <>
                      <Check className="h-3 w-3" /> Done
                    </>
                  ) : (
                    "Act on it"
                  )}
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => onSnooze(s)}
                    disabled={isActed}
                    title="Snooze"
                    className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted disabled:opacity-40"
                  >
                    <Clock className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDismiss(s)}
                    title="Dismiss"
                    className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/ai")({
  component: Component,
});

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Grid2X2, List, Mic, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — NAVSHAKTHI" },
      { name: "description", content: "Browse AI-verified handmade crafts from India's rural artisans across nine living traditions." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [max, setMax] = useState(50000);

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      (cat === "all" || p.category === cat) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.village.toLowerCase().includes(q.toLowerCase())) &&
      p.price <= max
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [cat, q, sort, max]);

  return (
    <PublicLayout>
      <section className="relative bg-mesh-warm pt-32 pb-16">
        <div className="container-x">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-clay backdrop-blur">
              <Sparkles className="h-3 w-3" /> AI-curated marketplace
            </div>
            <h1 className="mt-5 font-display text-5xl leading-tight text-foreground sm:text-6xl">The Marketplace.</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {products.length}+ living crafts from {new Set(products.map((p) => p.village)).size} villages.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-warm sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-background px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search crafts, artisans, villages…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="grid h-8 w-8 place-items-center rounded-full bg-clay/10 text-clay" aria-label="Voice search">
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              <Sparkles className="h-4 w-4" /> AI Search
            </button>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </div>

              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-clay">Category</div>
                <div className="mt-3 space-y-1">
                  <FilterPill active={cat === "all"} onClick={() => setCat("all")} label="All crafts" count={products.length} />
                  {categories.map((c) => (
                    <FilterPill
                      key={c.slug}
                      active={cat === c.slug}
                      onClick={() => setCat(c.slug)}
                      label={`${c.icon}  ${c.name}`}
                      count={products.filter((p) => p.category === c.slug).length}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-clay">
                  <span>Max price</span>
                  <span className="text-foreground">₹{max.toLocaleString("en-IN")}</span>
                </div>
                <input type="range" min={500} max={50000} step={500} value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-3 w-full accent-primary" />
              </div>

              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-clay">Trust badges</div>
                <div className="mt-3 space-y-2 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-primary" /> Craftmark certified</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> GI-tagged</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> Digital Twin available</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> AI score {'>'}95</label>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> crafts
              </div>
              <div className="flex items-center gap-2">
                <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-full border border-border bg-background px-4 py-2 text-sm">
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
                <div className="flex rounded-full border border-border p-1">
                  <button onClick={() => setView("grid")} className={cn("grid h-8 w-8 place-items-center rounded-full", view === "grid" && "bg-primary text-primary-foreground")}>
                    <Grid2X2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setView("list")} className={cn("grid h-8 w-8 place-items-center rounded-full", view === "list" && "bg-primary text-primary-foreground")}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center">
                <div className="font-display text-2xl">No crafts match your search.</div>
                <p className="mt-2 text-sm text-muted-foreground">Try broadening your filters or clearing the search.</p>
              </div>
            ) : view === "grid" ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {filtered.map((p) => (
                  <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="flex gap-5 rounded-3xl border border-border/60 bg-card p-4 hover-lift">
                    <img src={p.image} alt={p.name} className="h-32 w-32 shrink-0 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{p.category} · {p.village}</div>
                      <div className="mt-1 font-display text-xl">{p.name}</div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.story}</p>
                      <div className="mt-3 flex items-baseline gap-3">
                        <span className="text-lg font-semibold text-primary">₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-muted-foreground line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
                        <span className="ml-auto text-xs text-clay">AI {p.authenticity}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function FilterPill({ active, onClick, label, count }: { active?: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"
      )}
    >
      <span>{label}</span>
      <span className={cn("text-xs", active ? "text-primary-foreground/70" : "text-muted-foreground")}>{count}</span>
    </button>
  );
}

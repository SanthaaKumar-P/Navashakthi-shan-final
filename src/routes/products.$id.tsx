import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Share2, ShieldCheck, Sparkles, Truck, RefreshCcw, Award, Minus, Plus, MapPin } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProductCard } from "@/components/product-card";
import { getProduct, related } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — NAVSHAKTHI` },
          { name: "description", content: loaderData.product.story },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [{ title: "Craft — NAVSHAKTHI" }],
  }),
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container-x py-32 text-center">
        <h1 className="font-display text-4xl">Craft not found</h1>
        <Link to="/marketplace" className="mt-6 inline-block text-primary">← Back to marketplace</Link>
      </div>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => <div className="p-10">{error.message}</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const { add, toggleWishlist, inWishlist } = useCart();
  const wl = inWishlist(product.id);
  const rel = related(product.id, product.category);

  return (
    <PublicLayout>
      <div className="container-x pt-28 pb-24">
        <div className="mb-6 text-xs text-muted-foreground">
          <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="relative overflow-hidden rounded-3xl bg-muted">
              <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {product.digitalTwin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                    <Sparkles className="h-3 w-3" /> Digital Twin · 360°
                  </span>
                )}
                {product.giCertified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-earth">
                    <ShieldCheck className="h-3 w-3" /> GI Certified
                  </span>
                )}
                {product.craftmark && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-clay px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    <Award className="h-3 w-3" /> Craftmark
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <button key={i} className="overflow-hidden rounded-2xl bg-muted ring-1 ring-border transition hover:ring-primary">
                  <img src={product.image} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">{product.category} · {product.village}, {product.state}</div>
            <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>★ {product.rating} · {product.reviews} reviews</span>
              <span>·</span>
              <span className="text-clay">AI Authenticity {product.authenticity}%</span>
            </div>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-display text-4xl text-primary">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-lg text-muted-foreground line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
              <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                {Math.round((1 - product.price / product.mrp) * 100)}% off
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">The craft story</div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{product.story}</p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center"><Plus className="h-4 w-4" /></button>
              </div>
              <button
                onClick={() => { add(product, qty); toast.success(`${product.name} added to cart`); }}
                className="flex-1 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Add to cart
              </button>
              <button onClick={() => toggleWishlist(product.id)} className="grid h-12 w-12 place-items-center rounded-full border border-border hover:bg-muted" aria-label="Wishlist">
                <Heart className={`h-4 w-4 ${wl ? "fill-accent text-accent" : ""}`} />
              </button>
              <button className="grid h-12 w-12 place-items-center rounded-full border border-border hover:bg-muted" aria-label="Share">
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Truck, label: "Free India Post shipping" },
                { icon: RefreshCcw, label: "7-day easy returns" },
                { icon: ShieldCheck, label: "Authenticity guaranteed" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-3">
                  <f.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground/80">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-3xl bg-mesh-warm p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                  {product.artisan.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Meet the artisan</div>
                  <div className="font-display text-lg">{product.artisan}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {product.village}, {product.state}
                  </div>
                </div>
                <Link to="/marketplace" className="rounded-full border border-earth/20 bg-white/70 px-4 py-2 text-xs font-semibold backdrop-blur">
                  Visit profile
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-clay">Materials</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {product.materials.map((m: string) => <li key={m}>· {m}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-clay">Origin</div>
                <p className="mt-2 text-sm">{product.village}, {product.state}</p>
                <div className="text-xs text-muted-foreground">In stock: {product.inStock} pieces</div>
              </div>
            </div>
          </div>
        </div>

        {rel.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-3xl">You may also love</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {rel.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

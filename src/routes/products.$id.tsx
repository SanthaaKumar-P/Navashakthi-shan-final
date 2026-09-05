import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Heart, Share2, ShieldCheck, Sparkles, Truck, RefreshCcw, Award, Minus, Plus, MapPin } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProductCard } from "@/components/product-card";
import { getProduct, related, type Product } from "@/lib/mock-data";
import { findPublishedProduct, type PublishedProduct } from "@/lib/published-listings";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => ({ product: getProduct(params.id) ?? null, id: params.id }),
  head: ({ loaderData }) => ({
    meta: loaderData?.product
      ? [
          { title: `${loaderData.product.name} — NAVSHAKTHI` },
          { name: "description", content: loaderData.product.story },
        ]
      : [
          { title: "Craft — NAVSHAKTHI" },
          { name: "description", content: "An AI-verified handmade craft on the NAVSHAKTHI marketplace." },
        ],
  }),
  errorComponent: ({ error }) => <div className="p-10">{error.message}</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product: mockProduct, id } = Route.useLoaderData();
  const [publishedProduct, setPublishedProduct] = useState<PublishedProduct | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setPublishedProduct(findPublishedProduct(id));
    setResolved(true);
  }, [id]);

  const product: Product | PublishedProduct | null = publishedProduct ?? mockProduct;

  if (!product) {
    return (
      <PublicLayout>
        <div className="container-x py-32 text-center">
          <h1 className="font-display text-4xl">{resolved ? "Craft not found" : "Loading craft…"}</h1>
          {resolved && (
            <Link to="/marketplace" className="mt-6 inline-block text-primary">← Back to marketplace</Link>
          )}
        </div>
      </PublicLayout>
    );
  }

  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }: { product: Product | PublishedProduct }) {
  const ai = "aiPublished" in product ? (product as PublishedProduct) : null;
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { add, toggleWishlist, inWishlist } = useCart();
  const wl = inWishlist(product.id);
  const rel = related(product.id, product.category);

  const gallery = useMemo(
    () => (ai ? Array.from(new Set(ai.images)) : [product.image, product.image, product.image, product.image]),
    [ai, product.image],
  );

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: product.name, text: product.story, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Product link copied to clipboard");
    } catch {
      toast.error("Could not share this craft");
    }
  };

  const details = ai
    ? Object.entries(ai.attributes).filter(([, v]) => v && String(v).trim())
    : [];

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
              <img src={gallery[activeImage] ?? product.image} alt={product.name} className="aspect-square w-full object-cover" />
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {ai && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-clay px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    <Sparkles className="h-3 w-3" /> AI Published
                  </span>
                )}
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
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`overflow-hidden rounded-2xl bg-muted ring-1 transition ${activeImage === i ? "ring-primary" : "ring-border hover:ring-primary"}`}
                  >
                    <img src={src} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              {product.category}{product.village ? ` · ${product.village}` : ""}{product.state ? `, ${product.state}` : ""}
            </div>
            <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>★ {product.rating} · {product.reviews} reviews</span>
              <span>·</span>
              <span className="text-clay">AI confidence {product.authenticity}%</span>
            </div>

            <div className="mt-8 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-4xl text-primary">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-lg text-muted-foreground line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
              <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                {Math.round((1 - product.price / product.mrp) * 100)}% off
              </span>
            </div>

            {ai && (
              <div className="mt-4 rounded-2xl border border-border/60 bg-background p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-widest text-clay">AI pricing guidance</div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-foreground/80">
                  <span>Fair range: ₹{ai.priceLow.toLocaleString("en-IN")} – ₹{ai.priceHigh.toLocaleString("en-IN")}</span>
                  {ai.marketBenchmark ? <span>Market benchmark: ₹{Math.round(ai.marketBenchmark).toLocaleString("en-IN")}</span> : null}
                  <span>Confidence: {ai.confidence}%</span>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">The craft story</div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{product.story}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
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
              <button onClick={share} className="grid h-12 w-12 place-items-center rounded-full border border-border hover:bg-muted" aria-label="Share">
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
              <div className="flex flex-wrap items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                  {product.artisan.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-[140px] flex-1">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Meet the artisan</div>
                  <div className="font-display text-lg">{product.artisan}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {product.village}{product.state ? `, ${product.state}` : ""}
                  </div>
                </div>
                <Link to="/marketplace" className="rounded-full border border-earth/20 bg-white/70 px-4 py-2 text-xs font-semibold backdrop-blur">
                  Visit profile
                </Link>
              </div>
            </div>

            {ai && details.length > 0 && (
              <div className="mt-10">
                <div className="text-xs font-semibold uppercase tracking-widest text-clay">Craft details</div>
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {details.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-border/50 py-1">
                      <dt className="capitalize text-muted-foreground">{k.replace(/[_-]/g, " ")}</dt>
                      <dd className="text-right font-medium text-foreground/90">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-clay">Materials</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {product.materials.map((m: string) => <li key={m}>· {m}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-clay">Origin</div>
                <p className="mt-2 text-sm">{product.village}{product.state ? `, ${product.state}` : ""}</p>
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

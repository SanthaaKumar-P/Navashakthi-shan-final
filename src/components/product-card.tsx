import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import type { Product } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { toggleWishlist, inWishlist, add } = useCart();
  const wl = inWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="block overflow-hidden rounded-3xl bg-card hover-lift"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {(product as any).aiPublished && (
                <span className="inline-flex items-center gap-1 rounded-full bg-clay px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  <Sparkles className="h-3 w-3" /> AI Published
                </span>
              )}
              {product.digitalTwin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur">
                  <Sparkles className="h-3 w-3" /> Digital Twin
                </span>
              )}
              {product.giCertified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-earth backdrop-blur">
                  <ShieldCheck className="h-3 w-3" /> GI Certified
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition",
                wl ? "text-accent" : "text-foreground/60 hover:text-accent"
              )}
              aria-label="Wishlist"
            >
              <Heart className={cn("h-4 w-4", wl && "fill-current")} />
            </button>
          </div>
          <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                add(product);
                toast.success(`${product.name} added to cart`);
              }}
              className="w-full rounded-full bg-white/95 px-4 py-2.5 text-xs font-semibold text-earth backdrop-blur hover:bg-white"
            >
              Add to cart
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>{product.category}</span>
            <span>★ {product.rating}</span>
          </div>
          <h3 className="mt-2 font-display text-lg leading-tight text-foreground line-clamp-2 min-h-[2.6rem]">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            by {product.artisan} · {product.village}
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-primary">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
            <span className="ml-auto rounded-full bg-clay/10 px-2 py-0.5 text-[10px] font-semibold text-clay">
              AI {product.authenticity}%
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

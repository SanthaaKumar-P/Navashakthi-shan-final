import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { useCart } from "@/lib/cart-context";
import { products } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/portal/customer/wishlist")({
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useCart();
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <PageHeader title="Wishlist" subtitle={`${items.length} saved crafts`} />
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center">
          <div className="font-display text-2xl">Nothing saved yet.</div>
          <Link to="/marketplace" className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Discover crafts</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Stat } from "@/components/portal-shell";
import { products } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/portal/customer/")({
  component: Overview,
});

function Overview() {
  return (
    <>
      <PageHeader title="Welcome back." subtitle="Your NAVSHAKTHI journey — orders, wishlists and personalised recommendations." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value="12" hint="+3 this month" />
        <Stat label="Wishlist" value="7" />
        <Stat label="Villages supported" value="9" hint="Across 5 states" />
        <Stat label="Impact score" value="82" hint="Top 8% of buyers" />
      </div>
      <div className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl">AI recommendations for you</h2>
          <Link to="/marketplace" className="text-sm text-primary">Browse all →</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/portal/customer/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, remove, total, clear } = useCart();
  return (
    <>
      <PageHeader title="Your cart" subtitle={`${items.length} craft${items.length === 1 ? "" : "s"} in your bag`} />
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center">
          <div className="font-display text-2xl">Your cart is empty.</div>
          <Link to="/marketplace" className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Browse marketplace</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.product.id} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4">
                <img src={i.product.image} alt="" className="h-24 w-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{i.product.village}</div>
                  <div className="font-display text-lg">{i.product.name}</div>
                  <div className="mt-1 text-sm text-primary font-semibold">₹{i.product.price.toLocaleString("en-IN")}</div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => remove(i.product.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button onClick={() => updateQty(i.product.id, i.qty - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <button onClick={() => updateQty(i.product.id, i.qty + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">Clear cart</button>
          </div>
          <aside className="h-fit rounded-2xl border border-border/60 bg-card p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Summary</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>India Post shipping</span><span className="text-primary">Free</span></div>
              <div className="flex justify-between"><span>Artisan impact fund</span><span>₹{Math.round(total * 0.02).toLocaleString("en-IN")}</span></div>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-xl">
              <span>Total</span><span className="text-primary">₹{(total + Math.round(total * 0.02)).toLocaleString("en-IN")}</span>
            </div>
            <Link
  to="/portal/customer/checkout"
  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
>
  Proceed to checkout
</Link>
          </aside>
        </div>
      )}
    </>
  );
}

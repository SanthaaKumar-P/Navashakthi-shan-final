import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";

export const Route = createFileRoute("/portal/customer/gifts")({
  component: () => (
    <>
      <PageHeader title="Gift orders" subtitle="Send a story, not just a product." />
      <div className="rounded-3xl bg-mesh-warm p-10">
        <h2 className="font-display text-3xl">Gift a village craft with a handwritten note.</h2>
        <p className="mt-3 max-w-lg text-muted-foreground">Add a personal message and we'll include a handwritten card from the artisan with every gift order.</p>
        <button className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Start a gift order</button>
      </div>
    </>
  ),
});

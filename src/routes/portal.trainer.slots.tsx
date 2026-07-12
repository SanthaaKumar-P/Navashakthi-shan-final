import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { SlotGrid, generateDaySlots } from "@/components/booking/SlotGrid";
export const Route = createFileRoute("/portal/trainer/slots")({
  component: () => (
    <GenericSection title="Slot management" subtitle="Open, close and monitor workshop slots.">
      <div className="rounded-3xl border border-border/60 bg-card p-6">
        <div className="mb-4 font-display text-lg">Today · 12 Jul 2026</div>
        <SlotGrid slots={generateDaySlots()} />
      </div>
    </GenericSection>
  ),
});

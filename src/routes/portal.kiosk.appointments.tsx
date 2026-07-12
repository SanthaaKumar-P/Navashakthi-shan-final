import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/kiosk/appointments")({
  component: () => (
    <GenericSection title="Appointments" subtitle="Manage today's schedule and tokens.">
      <DataTable
        headers={["Token", "Time", "Artisan", "Service", "Status"]}
        rows={Array.from({ length: 10 }).map((_, i) => [`K-10${40 + i}`, `${9 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}`, ["Lakshmi","Ramesh","Meena","Selvi","Mohan"][i % 5], ["Upload","Passport","Scheme","NFC","Training"][i % 5], i < 3 ? "Done" : i === 3 ? "Live" : "Booked"])}
      />
    </GenericSection>
  ),
});

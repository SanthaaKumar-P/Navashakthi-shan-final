import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles, DataTable } from "@/components/portal-sections";

function Component() {
  return (
    <GenericSection title="Kiosk overview" subtitle="Bhuj Village Smart Centre · Gujarat">
      <InfoTiles tiles={[
        { label: "Today's appointments", value: "42" },
        { label: "Walk-ins", value: "18" },
        { label: "Avg. wait", value: "12 min" },
        { label: "Artisans onboarded", value: "1,248", hint: "All time" },
      ]} />
      <div className="mt-8">
        <DataTable
          headers={["Token", "Artisan", "Service", "Slot", "Status"]}
          rows={[
            ["K-1042", "Lakshmi Devi", "Product upload", "10:00", "In progress"],
            ["K-1043", "Ramesh S", "Craft passport", "10:15", "Waiting"],
            ["K-1044", "Meena Bora", "Scheme application", "10:30", "Waiting"],
            ["K-1045", "Selvi Ammal", "NFC card", "10:45", "Booked"],
          ]}
        />
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/kiosk/")({ component: Component });

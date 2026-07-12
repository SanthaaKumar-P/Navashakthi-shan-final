import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/kiosk/artisans")({
  component: () => (
    <GenericSection title="Artisans helped">
      <DataTable
        headers={["Name","Craft","Village","Onboarded","Status"]}
        rows={[
          ["Lakshmi Devi","Pottery","Bhuj","12 Jul 2026","Verified"],
          ["Ramesh Sthapati","Bronze","Swamimalai","10 Jul 2026","Verified"],
          ["Meena Bora","Bamboo","Majuli","9 Jul 2026","Pending"],
          ["Selvi Ammal","Silk","Kanchipuram","8 Jul 2026","Verified"],
        ]}
      />
    </GenericSection>
  ),
});

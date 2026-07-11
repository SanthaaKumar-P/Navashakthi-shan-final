import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/admin/users")({
  component: () => (
    <GenericSection title="Users" subtitle="Every artisan, buyer, government official and admin.">
      <DataTable
        headers={["Name", "Role", "Joined", "Status"]}
        rows={[
          ["Selvi Ammal", "Artisan", "12 Feb 2024", <span key="1" className="text-primary">Verified</span>],
          ["Priya Menon", "Customer", "04 May 2025", <span key="2" className="text-primary">Active</span>],
          ["Rahul Sharma", "Government", "22 Aug 2025", <span key="3" className="text-primary">Active</span>],
          ["Lakshmi Devi", "Artisan", "18 Nov 2024", <span key="4" className="text-primary">Verified</span>],
        ]}
      />
    </GenericSection>
  ),
});

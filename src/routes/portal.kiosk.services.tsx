import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
const services = ["Registration","Digital Twin","Photography","Product Upload","Marketplace Registration","Training","Loan Assistance","Insurance","Export Guidance","Certification","NFC Card","Government Help"];
export const Route = createFileRoute("/portal/kiosk/services")({
  component: () => (
    <GenericSection title="Services" subtitle="Toggle which services this kiosk is currently offering.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4">
            <div className="font-semibold text-sm">{s}</div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Active</span>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});

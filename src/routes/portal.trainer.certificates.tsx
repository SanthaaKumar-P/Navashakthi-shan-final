import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { CertificateSheet } from "@/components/certificates/CertificateSheet";
export const Route = createFileRoute("/portal/trainer/certificates")({
  component: () => (
    <GenericSection title="Issue certificates" subtitle="NSDC-affiliated completion certificates for your learners.">
      <CertificateSheet title="Skill Verification" subtitle="Traditional Pottery Basics · 6 weeks" holder="Lakshmi Devi" id="NVSH-SKILL-4471" date="12 Jul 2026" seal="NSDC" />
    </GenericSection>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
import { courses } from "@/lib/enterprise-data";
export const Route = createFileRoute("/portal/trainer/courses")({
  component: () => (
    <GenericSection title="My courses">
      <DataTable
        headers={["Course","Craft","Duration","Seats","Level","Language"]}
        rows={courses.map((c) => [c.name, c.craft, c.duration, String(c.seats), c.level, c.language])}
      />
    </GenericSection>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { PlayCircle } from "lucide-react";

const trainingModules = [
  {
    title: "Smart Cataloger",
    video: "/videos/smart-cataloger.mp4",
  },
  {
    title: "Fair pricing for handmade",
    video: "/videos/fair-pricing.mp4",
  },
  {
    title: "Customer Portal",
    video: "/videos/customer-portal.mp4",
  },
  {
    title: "AI Image Studio",
    video: "/videos/ai-image-studio.mp4",
  },
];

export const Route = createFileRoute("/portal/artisan/training")({
  component: () => (
    <GenericSection
      title="Training modules"
      subtitle="Free NSDC-certified courses in your language."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trainingModules.map((module, i) => (
          <div
            key={module.title}
            className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Video area */}
            <div className="relative aspect-video overflow-hidden bg-mesh-forest">
              {module.video ? (
                <video
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                >
                  <source src={module.video} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="h-14 w-14 text-cream/80 transition group-hover:scale-110" />
                  </div>

                  <div className="absolute bottom-3 left-3 rounded-full bg-black/30 px-3 py-1 text-xs text-white backdrop-blur-sm">
                    Coming soon
                  </div>
                </>
              )}
            </div>

            {/* Module details */}
            <div className="p-4">
              <div className="text-xs text-muted-foreground">
                Module {i + 1} · 22 min
              </div>

              <div className="mt-1 font-display text-lg">
                {module.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
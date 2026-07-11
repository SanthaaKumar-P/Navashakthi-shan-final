import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { Upload, Sparkles, Camera, FileText } from "lucide-react";
export const Route = createFileRoute("/portal/artisan/upload")({
  component: () => (
    <GenericSection title="Upload a new craft" subtitle="We'll auto-fill descriptions, tags and pricing using AI.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-12 text-center">
          <Camera className="mx-auto h-10 w-10 text-primary" />
          <div className="mt-4 font-display text-2xl">Drag & drop craft photos</div>
          <div className="mt-1 text-sm text-muted-foreground">Or scan from your phone with the Smart Kiosk app</div>
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"><Upload className="h-4 w-4" /> Upload photos</button>
        </div>
        <div className="rounded-3xl bg-mesh-warm p-6">
          <div className="text-xs uppercase tracking-widest text-clay">AI will auto-generate</div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Craft story & description</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Fair pricing suggestion</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Category & tags</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Digital Twin request</li>
            <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Craftmark eligibility check</li>
          </ul>
        </div>
      </div>
    </GenericSection>
  ),
});

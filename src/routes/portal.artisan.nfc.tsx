import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { GenericSection } from "@/components/portal-sections";
import { NfcCard } from "@/components/nfc/NfcCard";
import { Download, Share2, Eye } from "lucide-react";

const data = {
  name: "Lakshmi Devi",
  artisanId: "NVSH-A-208419",
  govId: "VSHK-TN-4471",
  village: "Bhuj, Gujarat",
  craft: "Warli Pottery",
  issued: "12 Jul 2026",
  expiry: "12 Jul 2031",
  rating: 4.9,
  twinStatus: "Live",
  passport: "CP-208419",
};

function Component() {
  return (
    <GenericSection title="NFC Digital ID" subtitle="Your official artisan card — tap on any NFC reader to reveal your verified profile.">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <NfcCard data={data} />
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button onClick={() => toast.success("Preview opened")} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs"><Eye className="h-3.5 w-3.5" /> Preview</button>
            <button onClick={() => toast.success("Card downloaded")} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Download className="h-3.5 w-3.5" /> Download PNG</button>
            <button onClick={() => toast("Link copied")} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs"><Share2 className="h-3.5 w-3.5" /> Share</button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="font-display text-lg">What's on your card</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Photo, name, artisan ID and government ID</li>
              <li>• Village, primary craft & verified badge</li>
              <li>• NFC symbol + printable QR to your storefront</li>
              <li>• Issue and expiry dates (auto-renews on verification)</li>
              <li>• Live marketplace rating & Digital Twin status</li>
              <li>• Linked Craft Passport number</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="font-display text-lg">Use it anywhere</div>
            <p className="mt-2 text-sm text-muted-foreground">Show at kiosks, banks, exhibitions, buyer meets, or tap on any NFC-enabled phone for instant verification.</p>
          </div>
        </div>
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/nfc")({ component: Component });

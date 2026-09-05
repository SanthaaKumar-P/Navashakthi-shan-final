import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { GenericSection } from "@/components/portal-sections";
import {
  CraftPassport,
  type PassportData,
} from "@/components/passport/CraftPassport";
import { products } from "@/lib/mock-data";

function getNumericProductId(id: string) {
  const number = Number.parseInt(id.replace(/\D/g, ""), 10);
  return Number.isFinite(number) ? number : 0;
}

function getPassportId(productId: string) {
  const numericId = getNumericProductId(productId);
  return `NVSH-CP-${200000 + numericId * 137}`;
}

function getTwinId(productId: string) {
  const numericId = getNumericProductId(productId);

  return `0xTW·${productId.toUpperCase()}·${4000 + numericId}A7C2`;
}

function getHandmadeScore(authenticity: number) {
  return Math.max(0, Math.min(100, authenticity - 2));
}

function getGovernmentStatus(
  product: (typeof products)[number],
) {
  if (product.giCertified) {
    return "GI-certified";
  }

  return "Government status not provided";
}

function getCraftDate(productId: string) {
  /*
   * The master catalogue does not currently store an actual
   * passport issue date.
   *
   * We therefore generate a stable catalogue-record date from
   * the product ID instead of pretending every passport was
   * issued on the same day.
   */
  const numericId = getNumericProductId(productId);

  const base = new Date("2026-07-01T00:00:00Z");
  base.setUTCDate(base.getUTCDate() + numericId);

  return base.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function toPassport(product: (typeof products)[number]): PassportData {
  return {
    id: getPassportId(product.id),

    name: product.name,

    artisan: product.artisan,

    village: product.village,

    /*
     * District is not currently part of the master catalogue.
     * Don't invent one.
     */
    district: "Not provided",

    state: product.state,

    category: product.category,

    handmadeScore: getHandmadeScore(product.authenticity),

    authenticity: product.authenticity,

    aiStatus:
      product.authenticity >= 90
        ? "AI Verified"
        : "Verification review",

    craftmark: product.craftmark,

    twinId: getTwinId(product.id),

    govStatus: getGovernmentStatus(product),

    date: getCraftDate(product.id),

    material:
      product.materials.length > 0
        ? product.materials.join(", ")
        : "Not provided",

    /*
     * Build time is not available in the master catalogue.
     * We should not display a fake "9 days" for every craft.
     */
    buildTime: "Not provided",

    technique: "Traditional handwork",

    /*
     * This is the sustainability information currently
     * represented by the catalogue.
     */
    impact: "Sustainable · natural materials",

    story: product.story,

    image: product.image,
  };
}

function Component() {
  const [active, setActive] = useState(products[0]?.id ?? "");

  const currentProduct = useMemo(() => {
    return products.find((product) => product.id === active) ?? products[0];
  }, [active]);

  const current = useMemo(() => {
    return currentProduct ? toPassport(currentProduct) : null;
  }, [currentProduct]);

  if (!current || !currentProduct) {
    return (
      <GenericSection
        title="Craft Passports"
        subtitle="Every verified craft carries a printable provenance passport."
      >
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No catalogue crafts are available yet.
          </p>
        </div>
      </GenericSection>
    );
  }

  const handleDownload = () => {
    /*
     * Use the browser's native print engine.
     *
     * Users can select "Save as PDF" from the print dialog.
     * This avoids introducing another PDF dependency into the project.
     */
    toast.success("Passport ready to save as PDF", {
      description: current.id,
    });

    window.setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <GenericSection
      title="Craft Passports"
      subtitle="Every verified craft carries a printable provenance passport."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        {/* PRODUCT / PASSPORT SELECTOR */}
        <div className="space-y-2">
          <div className="mb-4 rounded-2xl border border-border/60 bg-card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Master Catalogue
            </div>

            <div className="mt-1 font-display text-xl text-earth">
              {products.length} Craft Passports
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Every passport is linked to the same catalogue product.
            </div>
          </div>

          {products.map((product) => {
            const passportId = getPassportId(product.id);
            const isActive = active === product.id;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => setActive(product.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 bg-card hover:bg-muted"
                }`}
              >
                <img
                  src={product.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-earth">
                    {product.name}
                  </div>

                  <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {passportId}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] capitalize text-muted-foreground">
                      {product.category}
                    </span>

                    {product.craftmark && (
                      <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-semibold text-earth">
                        Craftmark
                      </span>
                    )}

                    {product.giCertified && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                        GI
                      </span>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* PASSPORT */}
        <div id="craft-passport-print-area">
          <CraftPassport
            data={current}
            onDownload={handleDownload}
          />
        </div>
      </div>

      {/* PRINT-ONLY INFORMATION */}
      <div className="mt-6 hidden print:block">
        <div className="border-t border-border pt-4 text-center text-[10px] text-muted-foreground">
          NAVSHAKTHI Digital Craft Passport · {current.id}
        </div>
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/passport")({
  component: Component,
});
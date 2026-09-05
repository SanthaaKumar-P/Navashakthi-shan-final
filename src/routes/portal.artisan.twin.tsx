import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { TwinViewer } from "@/components/twin/TwinViewer";
import { products } from "@/lib/mock-data";

function getTwinNumber(id: string) {
  const numericPart = Number(id.replace(/\D/g, "") || 0);
  return 4000 + numericPart;
}

function Page() {
  // Use the COMPLETE master craft catalogue.
  // Do not use slice() or digitalTwin filtering here.
  const list = products;

  const [activeId, setActiveId] = useState(list[0]?.id ?? "");

  const active = useMemo(() => {
    return (
      list.find((product) => product.id === activeId) ??
      list[0]
    );
  }, [activeId, list]);

  /*
   * Demo Digital Twin metrics are derived from the catalogue.
   *
   * Every catalogue product currently has a Digital Twin workspace
   * representation, so the counts remain synchronized with the
   * master catalogue.
   */
  const twinCount = list.length;
  const verificationPassed = list.length;
  const blockchainIdsMinted = list.length;

  // No pending requests are currently represented in the catalogue.
  const requestsPending = 0;

  if (!active) {
    return (
      <GenericSection
        title="Digital Twin studio"
        subtitle="Turn every craft into a 3D digital twin with a blockchain ID."
      >
        <div className="rounded-3xl border border-dashed border-border p-16 text-center">
          <h2 className="font-display text-2xl">
            No crafts available
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Add crafts to the master catalogue to create Digital
            Twin records.
          </p>
        </div>
      </GenericSection>
    );
  }

  return (
    <GenericSection
      title="Digital Twin studio"
      subtitle="Turn every craft into a 3D digital twin with a blockchain ID."
    >
      {/* STATS */}
      <InfoTiles
        tiles={[
          {
            label: "Twins created",
            value: String(twinCount),
            hint: `Of ${list.length} catalogue crafts`,
          },
          {
            label: "Verification passed",
            value: String(verificationPassed),
            hint: "100% catalogue coverage",
          },
          {
            label: "Blockchain IDs minted",
            value: String(blockchainIdsMinted),
            hint: "Unique Twin IDs assigned",
          },
          {
            label: "Requests pending",
            value: String(requestsPending),
            hint: "No pending requests",
          },
        ]}
      />

      {/* DIGITAL TWIN WORKSPACE */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* ACTIVE TWIN */}
        <div className="min-w-0">
          <TwinViewer
            src={active.image}
            alt={active.name}
            twinId={`0xTW·${active.id.toUpperCase()}·${getTwinNumber(active.id)}`}
          />

          {/* ACTIVE PRODUCT DETAILS */}
          <div className="mt-4 rounded-2xl border border-border/60 bg-card p-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Active digital twin
            </div>

            <h3 className="mt-2 font-display text-xl">
              {active.name}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {active.artisan} · {active.village},{" "}
              {active.state}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Authenticity
                </div>

                <div className="mt-1 font-display text-xl text-primary">
                  {active.authenticity}%
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Twin ID
                </div>

                <div className="mt-1 break-all font-mono text-[10px]">
                  0xTW·{active.id.toUpperCase()}·
                  {getTwinNumber(active.id)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ALL CRAFTS */}
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl">
                Craft Digital Twins
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Select any catalogue craft to inspect its digital
                twin.
              </p>
            </div>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {list.length} crafts
            </span>
          </div>

          <div className="grid max-h-[720px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {list.map((product) => {
              const twinNumber = getTwinNumber(product.id);

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setActiveId(product.id)}
                  className={`overflow-hidden rounded-2xl border bg-card text-left transition hover:-translate-y-0.5 ${
                    active.id === product.id
                      ? "border-primary shadow-elegant"
                      : "border-border/60"
                  }`}
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="aspect-video w-full object-cover transition duration-300 hover:scale-105"
                    />

                    <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-primary backdrop-blur">
                      3D Digital Twin
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Twin ID · 0xTW·
                      {product.id.toUpperCase()}·
                      {twinNumber}
                    </div>

                    <div className="mt-1 line-clamp-2 min-h-[2.75rem] font-display text-base">
                      {product.name}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {product.category} · {product.village}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-primary">
                        ✓ Verified
                      </span>

                      <span className="text-muted-foreground">
                        {product.authenticity}% AI
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CATALOGUE COVERAGE */}
      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Catalogue coverage
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              All {list.length} crafts in the NAVSHAKTHI master
              catalogue are available in the Digital Twin studio.
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
            {list.length}/{list.length} available
          </div>
        </div>
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/twin")({
  component: Page,
});
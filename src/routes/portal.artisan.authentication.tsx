import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Eye,
  Loader2,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GenericSection,
  InfoTiles,
} from "@/components/portal-sections";
import { products } from "@/lib/mock-data";

type AuthenticationResult = {
  productMatch: number;
  handmadeEvidence: number;
  materialConsistency: number;
  craftTechniqueConsistency: number;
  overallScore: number;
  decision: string;
  detectedCraft: string;
  detectedMaterials: string[];
  visibleEvidence: string[];
  concerns: string[];
  explanation: string;
};

type ScanRecord = {
  productId: string;
  result: AuthenticationResult;
  model: string;
  analyzedAt: string;
};

const STORAGE_KEY = "navshakthi_authentication_results_v1";

const PIPELINE_STEPS = [
  "Reading product image",
  "Analyzing craft identity",
  "Checking handmade visual evidence",
  "Comparing material characteristics",
  "Evaluating craft technique",
  "Generating authenticity assessment",
];

function readStoredResults(): Record<string, ScanRecord> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as Record<string, ScanRecord>;
  } catch {
    return {};
  }
}

function saveStoredResult(record: ScanRecord) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = readStoredResults();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...current,
        [record.productId]: record,
      }),
    );
  } catch (error) {
    console.error(
      "Failed to save authentication result:",
      error,
    );
  }
}

function scoreLabel(score: number) {
  if (score >= 85) {
    return "High confidence";
  }

  if (score >= 65) {
    return "Review recommended";
  }

  return "Low confidence";
}

function scoreTone(score: number) {
  if (score >= 85) {
    return "text-emerald-700";
  }

  if (score >= 65) {
    return "text-amber-700";
  }

  return "text-red-700";
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function Component() {
  const [storedResults, setStoredResults] =
    useState<Record<string, ScanRecord>>(
      readStoredResults,
    );

  const [scanning, setScanning] = useState<string | null>(
    null,
  );

  const [pipelineStep, setPipelineStep] = useState(-1);

  const [selectedProductId, setSelectedProductId] =
    useState(products[0]?.id ?? "");

  const [selectedResult, setSelectedResult] =
    useState<ScanRecord | null>(null);

  const verifiedCount = Object.keys(storedResults).filter(
    (id) =>
      storedResults[id]?.result?.overallScore >= 85,
  ).length;

  const pendingCount = Math.max(
    0,
    products.length - Object.keys(storedResults).length,
  );

  const averageAuthenticity = useMemo(() => {
    const values = Object.values(storedResults)
      .map((record) => record.result?.overallScore)
      .filter(
        (value): value is number =>
          typeof value === "number" &&
          Number.isFinite(value),
      );

    if (values.length === 0) {
      return 0;
    }

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) /
        values.length,
    );
  }, [storedResults]);

  const successRate = useMemo(() => {
    const values = Object.values(storedResults)
      .map((record) => record.result?.overallScore)
      .filter(
        (value): value is number =>
          typeof value === "number" &&
          Number.isFinite(value),
      );

    if (values.length === 0) {
      return 0;
    }

    const successful = values.filter(
      (value) => value >= 85,
    ).length;

    return Math.round(
      (successful / values.length) * 1000,
    ) / 10;
  }, [storedResults]);

  const selectedProduct = useMemo(() => {
    return (
      products.find(
        (product) => product.id === selectedProductId,
      ) ?? products[0]
    );
  }, [selectedProductId]);

  const runAuthentication = async (
    product: (typeof products)[number],
  ) => {
    if (scanning) {
      return;
    }

    setSelectedProductId(product.id);
    setSelectedResult(null);
    setScanning(product.id);
    setPipelineStep(0);

    try {
      /*
       * Fetch the real catalogue image from /public.
       * This is then sent to the server-side Gemini vision API.
       */
      const imageResponse = await fetch(product.image);

      if (!imageResponse.ok) {
        throw new Error(
          `Could not load product image (${imageResponse.status}).`,
        );
      }

      const imageBlob = await imageResponse.blob();

      setPipelineStep(1);

      const formData = new FormData();

      formData.append(
        "image",
        new File(
          [imageBlob],
          `${product.id}-authentication.jpg`,
          {
            type: imageBlob.type || "image/jpeg",
          },
        ),
      );

      formData.append("productName", product.name);
      formData.append("category", product.category);
      formData.append("village", product.village);
      formData.append("state", product.state);
      formData.append("story", product.story);
      formData.append(
        "materials",
        product.materials.join(", "),
      );
      formData.append(
        "catalogueAuthenticity",
        String(product.authenticity),
      );
      formData.append(
        "craftmark",
        String(product.craftmark),
      );
      formData.append(
        "giCertified",
        String(product.giCertified),
      );

      setPipelineStep(2);

      const response = await fetch(
        "/api/authentication/analyze",
        {
          method: "POST",
          body: formData,
        },
      );

      setPipelineStep(3);

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.error ||
            "Authentication analysis failed.",
        );
      }

      setPipelineStep(4);

      const record: ScanRecord = {
        productId: product.id,
        result: payload.result,
        model: payload.model || "Gemini Vision",
        analyzedAt:
          payload.analyzedAt ||
          new Date().toISOString(),
      };

      saveStoredResult(record);

      setStoredResults((current) => ({
        ...current,
        [product.id]: record,
      }));

      setSelectedResult(record);

      setPipelineStep(5);

      toast.success("AI authentication completed", {
        description: `${product.name} · ${payload.result.overallScore}% assessment`,
      });
    } catch (error) {
      console.error(
        "Authentication scan failed:",
        error,
      );

      toast.error("Authentication failed", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });

      setPipelineStep(-1);
    } finally {
      setScanning(null);
    }
  };

  const openResult = (
    productId: string,
  ) => {
    setSelectedProductId(productId);
    setSelectedResult(
      storedResults[productId] ?? null,
    );
  };

  return (
    <GenericSection
      title="AI Craft Authentication"
      subtitle="Analyze every catalogue craft with server-side visual AI and evidence-based authenticity assessment."
    >
      {/* =========================================================
          SUMMARY
      ========================================================= */}
      <InfoTiles
        tiles={[
          {
            label: "AI verified",
            value: String(verifiedCount),
            hint: `of ${products.length} catalogue crafts`,
          },
          {
            label: "AI success rate",
            value:
              Object.keys(storedResults).length > 0
                ? `${successRate}%`
                : "—",
            hint:
              Object.keys(storedResults).length > 0
                ? "Based on completed AI scans"
                : "Run a scan to calculate",
          },
          {
            label: "Pending review",
            value: String(pendingCount),
            hint: "Not yet analyzed in this browser",
          },
          {
            label: "Avg. AI assessment",
            value:
              Object.keys(storedResults).length > 0
                ? `${averageAuthenticity}%`
                : "—",
            hint:
              Object.keys(storedResults).length > 0
                ? "Across completed scans"
                : "No completed scans",
          },
        ]}
      />

      {/* =========================================================
          MAIN AREA
      ========================================================= */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* =======================================================
            PRODUCT LIST
        ======================================================= */}
        <div className="space-y-3">
          <div className="mb-4 rounded-3xl border border-border/60 bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <ScanSearch className="h-4 w-4" />
                  Live AI verification
                </div>

                <h2 className="mt-2 font-display text-xl text-earth">
                  {products.length} catalogue products
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Select any craft and run a real Gemini visual
                  assessment against its catalogue record.
                </p>
              </div>

              <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Engine
                </div>
                <div className="mt-1 text-xs font-semibold text-earth">
                  Gemini Vision
                </div>
              </div>
            </div>
          </div>

          {products.map((product) => {
            const record = storedResults[product.id];
            const isScanning =
              scanning === product.id;
            const isSelected =
              selectedProductId === product.id;

            return (
              <div
                key={product.id}
                className={`rounded-2xl border bg-card p-4 transition ${
                  isSelected
                    ? "border-primary/50 shadow-sm"
                    : "border-border/60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-earth">
                      {product.name}
                    </div>

                    <div className="text-xs capitalize text-muted-foreground">
                      {product.category} ·{" "}
                      {product.village}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        Catalogue:{" "}
                        {product.authenticity}%
                      </span>

                      {product.craftmark && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-semibold text-earth">
                          Craftmark record
                        </span>
                      )}

                      {product.giCertified && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                          GI record
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {record ? (
                      <button
                        type="button"
                        onClick={() =>
                          openResult(product.id)
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          record.result.overallScore >=
                          85
                            ? "bg-emerald-500/15 text-emerald-700"
                            : record.result.overallScore >=
                                65
                              ? "bg-amber-500/15 text-amber-700"
                              : "bg-red-500/15 text-red-700"
                        }`}
                      >
                        {record.result.overallScore >=
                        85 ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <TriangleAlert className="h-3.5 w-3.5" />
                        )}

                        {record.result.overallScore}%
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          runAuthentication(product)
                        }
                        disabled={Boolean(scanning)}
                        className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isScanning
                          ? "Analyzing…"
                          : "Run AI verify"}
                      </button>
                    )}
                  </div>
                </div>

                {record && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {record.model}
                      <span>·</span>
                      {formatDate(
                        record.analyzedAt,
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        runAuthentication(product)
                      }
                      disabled={Boolean(scanning)}
                      className="text-[10px] font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      Re-analyze
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* =======================================================
            RIGHT PANEL
        ======================================================= */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          {scanning ? (
            <AuthenticationPipeline
              product={
                products.find(
                  (product) =>
                    product.id === scanning,
                ) ?? products[0]
              }
              step={pipelineStep}
            />
          ) : selectedResult ? (
            <AuthenticationResultPanel
              product={
                products.find(
                  (product) =>
                    product.id ===
                    selectedResult.productId,
                ) ?? products[0]
              }
              record={selectedResult}
            />
          ) : (
            <EmptyAuthenticationPanel
              product={selectedProduct}
              onRun={() =>
                selectedProduct &&
                runAuthentication(
                  selectedProduct,
                )
              }
            />
          )}
        </div>
      </div>

      {/* =========================================================
          DISCLAIMER
      ========================================================= */}
      <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

          <div>
            <div className="text-xs font-semibold text-earth">
              AI assessment ≠ legal certification
            </div>

            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              The visual model evaluates evidence visible in
              the supplied photograph. It does not independently
              certify Craftmark/GI status or prove the complete
              manufacturing history of a product. Final
              certification can require physical inspection,
              documentation and authorized verification.
            </p>
          </div>
        </div>
      </div>
    </GenericSection>
  );
}

function AuthenticationPipeline({
  product,
  step,
}: {
  product: (typeof products)[number] | undefined;
  step: number;
}) {
  const progress =
    step < 0
      ? 0
      : Math.min(
          100,
          ((step + 1) /
            PIPELINE_STEPS.length) *
            100,
        );

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" />
            Live AI pipeline
          </div>

          <h3 className="mt-2 font-display text-xl text-earth">
            {product?.name ?? "Craft"}
          </h3>
        </div>

        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-gold to-clay transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          Step{" "}
          {Math.min(
            Math.max(step + 1, 1),
            PIPELINE_STEPS.length,
          )}
          /{PIPELINE_STEPS.length}
        </span>

        <span>{Math.round(progress)}%</span>
      </div>

      <ol className="mt-6 space-y-3">
        {PIPELINE_STEPS.map(
          (pipelineStep, index) => {
            const completed = index < step;
            const active = index === step;

            return (
              <li
                key={pipelineStep}
                className="flex items-center gap-3"
              >
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    completed
                      ? "bg-emerald-500/15 text-emerald-700"
                      : active
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                </div>

                <div
                  className={`text-xs ${
                    active
                      ? "font-semibold text-earth"
                      : "text-muted-foreground"
                  }`}
                >
                  {pipelineStep}
                </div>
              </li>
            );
          },
        )}
      </ol>

      <div className="mt-6 rounded-2xl bg-muted/50 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-earth">
          <Eye className="h-4 w-4 text-primary" />
          Visual evidence mode
        </div>

        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          Gemini is evaluating the actual product image against
          the catalogue record. No simulated completion timer
          is being used.
        </p>
      </div>
    </div>
  );
}

function AuthenticationResultPanel({
  product,
  record,
}: {
  product: (typeof products)[number] | undefined;
  record: ScanRecord;
}) {
  const result = record.result;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
      <div className="border-b border-border/60 bg-primary/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <ShieldCheck className="h-4 w-4" />
              AI assessment complete
            </div>

            <h3 className="mt-2 font-display text-2xl text-earth">
              {product?.name}
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(record.analyzedAt)} ·{" "}
              {record.model}
            </p>
          </div>

          <div className="text-right">
            <div
              className={`font-display text-4xl ${scoreTone(
                result.overallScore,
              )}`}
            >
              {result.overallScore}%
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {scoreLabel(result.overallScore)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-6">
        <Metric
          label="Product match"
          value={result.productMatch}
        />

        <Metric
          label="Handmade evidence"
          value={result.handmadeEvidence}
        />

        <Metric
          label="Material match"
          value={result.materialConsistency}
        />

        <Metric
          label="Technique match"
          value={
            result.craftTechniqueConsistency
          }
        />
      </div>

      <div className="border-t border-border/60 p-6">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Detected craft
        </div>

        <div className="mt-1 text-sm font-semibold text-earth">
          {result.detectedCraft}
        </div>
      </div>

      {result.detectedMaterials.length > 0 && (
        <div className="border-t border-border/60 p-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Detected materials
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {result.detectedMaterials.map(
              (material) => (
                <span
                  key={material}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-earth"
                >
                  {material}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      <div className="border-t border-border/60 p-6">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Visual evidence
        </div>

        <div className="mt-3 space-y-2">
          {result.visibleEvidence.length > 0 ? (
            result.visibleEvidence.map(
              (evidence) => (
                <div
                  key={evidence}
                  className="flex gap-2 text-xs leading-5 text-earth"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{evidence}</span>
                </div>
              ),
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              No specific visual evidence was returned.
            </p>
          )}
        </div>
      </div>

      {result.concerns.length > 0 && (
        <div className="border-t border-border/60 bg-amber-500/5 p-6">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-amber-800">
            <TriangleAlert className="h-4 w-4" />
            Review points
          </div>

          <div className="mt-3 space-y-2">
            {result.concerns.map((concern) => (
              <div
                key={concern}
                className="flex gap-2 text-xs leading-5 text-earth"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700" />
                <span>{concern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border/60 p-6">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          AI explanation
        </div>

        <p className="mt-2 text-sm leading-6 text-earth">
          {result.explanation}
        </p>
      </div>

      <div className="border-t border-border/60 bg-muted/30 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

          <p className="text-[11px] leading-5 text-muted-foreground">
            This result is an AI visual assessment. It does not
            independently certify Craftmark, GI registration or
            legal authenticity.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyAuthenticationPanel({
  product,
  onRun,
}: {
  product: (typeof products)[number] | undefined;
  onRun: () => void;
}) {
  if (!product) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
      <img
        src={product.image}
        alt={product.name}
        className="aspect-[4/3] w-full object-cover"
      />

      <div className="p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <ScanSearch className="h-4 w-4" />
          Ready for AI analysis
        </div>

        <h3 className="mt-2 font-display text-2xl text-earth">
          {product.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Gemini will analyze the actual catalogue image and
          compare its visible characteristics with the stored
          craft information.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Info
            label="Category"
            value={product.category}
          />

          <Info
            label="State"
            value={product.state}
          />

          <Info
            label="Catalogue score"
            value={`${product.authenticity}%`}
          />

          <Info
            label="Materials"
            value={product.materials.join(", ")}
          />
        </div>

        <button
          type="button"
          onClick={onRun}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" />
          Run Gemini AI Verification
        </button>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>

      <div
        className={`mt-1 font-display text-2xl ${scoreTone(
          value,
        )}`}
      >
        {value}%
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-3">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 break-words text-xs font-semibold text-earth">
        {value}
      </div>
    </div>
  );
}

export const Route = createFileRoute(
  "/portal/artisan/authentication",
)({
  component: Component,
});
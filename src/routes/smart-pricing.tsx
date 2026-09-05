import { createFileRoute } from "@tanstack/react-router";
import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";
import {
  Check,
  CloudUpload,
  Copy,
  Image as ImageIcon,
  IndianRupee,
  Landmark,
  Loader2,
  ScanSearch,
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";

import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { saveCraftPricing } from "@/lib/craft-draft";

export const Route = createFileRoute("/smart-pricing")({
  component: SmartPricingPage,
});

type CraftCategory =
  | "Pottery"
  | "Handloom & Textiles"
  | "Wooden Crafts"
  | "Metal Casting"
  | "Jewelry & Beadwork"
  | "Folk & Tribal Art"
  | "Bamboo & Cane Products"
  | "Sculptures & Stone Carving"
  | "Folk Musical Instruments";

type FinishLevel = "Basic" | "Fine" | "Intricate";

type SizeLabel =
  | "Mini"
  | "Small"
  | "Standard"
  | "Medium"
  | "Large"
  | "Extra Large"
  | "Monumental";

interface Analysis {
  category: CraftCategory;
  productType: string;
  material: string;
  finish: FinishLevel;
  complexity: number;
  decoration: string;
  sizeLabel: SizeLabel;
  dimensions: string;
  confidence: number;
}

interface MarketData {
  low: number;
  median: number;
  high: number;
  demandChange: number;
  comparableCount: number;
  matchLabel: string;
  sourceType: "curated_reference" | "official_reference";
  sourceLabel: string;
  updatedAt: string;
  materialCostReference: number;
  labourBenchmark: number;
}

interface CraftProfile {
  materialCost: number;
  labourBenchmark: number;
  baseHours: number;
}

interface PriceResult {
  materialCost: number;
  labourBenchmark: number;
  estimatedLabourCost: number;
  packaging: number;
  overhead: number;
  sustainableFloor: number;
  marketBenchmark: number;
  recommended: number;
  low: number;
  high: number;
  confidence: number;
}

const CRAFT_PROFILES: Record<CraftCategory, CraftProfile> = {
  Pottery: {
    materialCost: 25,
    labourBenchmark: 35,
    baseHours: 1.5,
  },

  "Handloom & Textiles": {
    materialCost: 220,
    labourBenchmark: 65,
    baseHours: 4,
  },

  "Wooden Crafts": {
    materialCost: 120,
    labourBenchmark: 55,
    baseHours: 3.5,
  },

  "Metal Casting": {
    materialCost: 220,
    labourBenchmark: 65,
    baseHours: 4,
  },

  "Jewelry & Beadwork": {
    materialCost: 160,
    labourBenchmark: 65,
    baseHours: 2.5,
  },

  "Folk & Tribal Art": {
    materialCost: 70,
    labourBenchmark: 50,
    baseHours: 3,
  },

  "Bamboo & Cane Products": {
    materialCost: 55,
    labourBenchmark: 45,
    baseHours: 2.5,
  },

  "Sculptures & Stone Carving": {
    materialCost: 350,
    labourBenchmark: 65,
    baseHours: 6,
  },

  "Folk Musical Instruments": {
    materialCost: 220,
    labourBenchmark: 55,
    baseHours: 4.5,
  },
};

const SIZE_MULTIPLIER: Record<SizeLabel, number> = {
  Mini: 0.65,
  Small: 0.82,
  Standard: 1,
  Medium: 1.15,
  Large: 1.45,
  "Extra Large": 1.85,
  Monumental: 2.5,
};

const FINISH_MULTIPLIER: Record<FinishLevel, number> = {
  Basic: 0.96,
  Fine: 1.06,
  Intricate: 1.16,
};

const CATEGORY_ICONS: Record<CraftCategory, string> = {
  Pottery: "🏺",
  "Handloom & Textiles": "🧵",
  "Wooden Crafts": "🪵",
  "Metal Casting": "⚒️",
  "Jewelry & Beadwork": "💎",
  "Folk & Tribal Art": "🎨",
  "Bamboo & Cane Products": "🎋",
  "Sculptures & Stone Carving": "🗿",
  "Folk Musical Instruments": "🎶",
};

function roundToFive(value: number) {
  return Math.max(5, Math.round(value / 5) * 5);
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getDecorationMultiplier(decoration: string) {
  const text = decoration.toLowerCase().trim();

  if (
    !text ||
    /plain|minimal|simple surface|no decoration|without decoration|unpainted/.test(
      text,
    )
  ) {
    return 1;
  }

  if (
    /filigree|openwork|elaborate|ornate|highly detailed|intricate|complex motif|beadwork|inlay|embroidery|hand-painted|hand painted/.test(
      text,
    )
  ) {
    return 1.09;
  }

  if (
    /engraved|carved|embossed|decorative|pattern|patterned|motif|geometric|floral|painted|woven detail|dotted|grooves|bands/.test(
      text,
    )
  ) {
    return 1.04;
  }

  return 1.02;
}

function calculateFairPrice(
  analysis: Analysis,
  market: MarketData,
): PriceResult {
  const profile = CRAFT_PROFILES[analysis.category];

  /* =========================================================
     1. AI-DERIVED CRAFTSMANSHIP SIGNALS
     ========================================================= */

  const sizeMultiplier =
    SIZE_MULTIPLIER[analysis.sizeLabel] ?? 1;

  const finishMultiplier =
    FINISH_MULTIPLIER[analysis.finish] ?? 1;

  /*
   * Complexity now has a meaningful but bounded effect.
   *
   * Approximate signal:
   *   1/10 -> 0.94x
   *   3/10 -> 1.01x
   *   5/10 -> 1.08x
   *   8/10 -> 1.18x
   *  10/10 -> 1.25x
   *
   * This makes a visibly more difficult product worth more
   * without allowing complexity alone to create an extreme price.
   */
  const complexityMultiplier = clamp(
    0.90 + analysis.complexity * 0.035,
    0.90,
    1.25,
  );

  /*
   * Decoration is derived from Gemini's existing description.
   * No second AI call is required.
   *
   * Plain/minimal work gets no premium.
   * Visible patterns/engraving get a small premium.
   * Elaborate/ornate work gets a stronger premium.
   */
  const decorationMultiplier =
    getDecorationMultiplier(analysis.decoration);

  /*
   * Demand affects price modestly.
   *
   * Example:
   * +14% demand -> roughly +4.2% pricing signal,
   * not +14%.
   */
  const trendMultiplier = clamp(
    1 + (market.demandChange / 100) * 0.30,
    0.97,
    1.07,
  );

  /* =========================================================
     2. REFERENCE PRODUCTION COST
     ========================================================= */

  /*
   * A photograph cannot reveal exact labour hours.
   * Therefore this is a transparent reference estimate.
   *
   * Complexity now affects labour more clearly:
   * higher visual complexity -> more reference labour time.
   */
  const estimatedHours =
    profile.baseHours *
    (0.75 + analysis.complexity * 0.08) *
    sizeMultiplier *
    (analysis.finish === "Intricate"
      ? 1.12
      : analysis.finish === "Fine"
        ? 1.05
        : 1);

  const estimatedLabourCost = Math.round(
    estimatedHours * market.labourBenchmark,
  );

  /*
   * Material reference scales with broad visual size.
   */
  const materialCost = Math.round(
    market.materialCostReference * sizeMultiplier,
  );

  /*
   * Small packaging allowance.
   */
  const packaging = Math.max(
    10,
    Math.round(
      (materialCost + estimatedLabourCost) * 0.045,
    ),
  );

  /*
   * Small production overhead allowance.
   */
  const overhead = Math.max(
    10,
    Math.round(
      (materialCost + estimatedLabourCost) * 0.055,
    ),
  );

  /*
   * Minimum sustainable production cost.
   */
  const sustainableFloor = roundToFive(
    materialCost +
      estimatedLabourCost +
      packaging +
      overhead,
  );

  /* =========================================================
     3. MARKET-ANCHORED CRAFT VALUE
     ========================================================= */

  /*
   * The market median is still the primary anchor.
   *
   * AI signals:
   *   - complexity
   *   - finish
   *   - size
   *   - visible decoration
   *   - demand
   *
   * all contribute, but within controlled bounds.
   */
  const rawMarketPrice =
    market.median *
    complexityMultiplier *
    finishMultiplier *
    sizeMultiplier *
    decorationMultiplier *
    trendMultiplier;

  /*
   * Allow craftsmanship to move the median meaningfully,
   * but prevent an AI visual estimate from becoming extreme.
   *
   * Normal range:
   *   0.85x to 1.45x of market median.
   */
  const marketAnchoredPrice = clamp(
    rawMarketPrice,
    market.median * 0.85,
    market.median * 1.45,
  );

  /* =========================================================
     4. FAIR-PRICE GUARDRAILS
     ========================================================= */

  let recommended: number;

  /*
   * NORMAL MARKET CASE
   *
   * If the estimated production cost fits inside the observed
   * market range, the market remains the dominant signal.
   */
  if (sustainableFloor <= market.high) {
    recommended = Math.max(
      marketAnchoredPrice,
      sustainableFloor * 1.08,
    );

    /*
     * A normal product should not exceed the observed market
     * high merely because AI detected more decoration.
     */
    recommended = Math.min(
      recommended,
      market.high,
    );
  } else {
    /*
     * COST-PRESSURE CASE
     *
     * If production itself is above the observed market high,
     * never force the artisan to sell below cost.
     *
     * A modest 10% sustainable margin is used.
     */
    recommended = sustainableFloor * 1.10;
  }

  /*
   * Always keep the final price above the production floor.
   */
  recommended = roundToFive(
    Math.max(
      recommended,
      sustainableFloor,
    ),
  );

  /* =========================================================
     5. SUGGESTED SELLING RANGE
     ========================================================= */

  let low: number;
  let high: number;

  if (sustainableFloor <= market.high) {
    /*
     * Normal case:
     * keep the suggested range inside the observed market band.
     */
    low = roundToFive(
      Math.max(
        market.low,
        sustainableFloor,
        recommended * 0.92,
      ),
    );

    high = roundToFive(
      Math.min(
        market.high,
        Math.max(
          recommended * 1.08,
          recommended + 10,
        ),
      ),
    );

    if (low > recommended) {
      low = recommended;
    }

    if (high < recommended) {
      high = recommended;
    }
  } else {
    /*
     * Cost-pressure case:
     * show a transparent range around the sustainable price.
     */
    low = roundToFive(
      Math.max(
        sustainableFloor,
        recommended * 0.95,
      ),
    );

    high = roundToFive(
      Math.max(
        recommended * 1.10,
        recommended + 25,
      ),
    );
  }

  /* =========================================================
     6. PRICING CONFIDENCE
     ========================================================= */

  /*
   * Prototype market confidence is based on the number of
   * comparable products available in the reference dataset.
   */
  const marketConfidence = clamp(
    70 + market.comparableCount * 0.4,
    70,
    90,
  );

  /*
   * AI visual confidence is weighted more heavily because the
   * price calculation directly depends on detected features.
   */
  const confidence = Math.round(
    analysis.confidence * 0.65 +
      marketConfidence * 0.35,
  );

  /* =========================================================
     7. FINAL RESULT
     ========================================================= */

  return {
    materialCost,
    labourBenchmark: market.labourBenchmark,
    estimatedLabourCost,
    packaging,
    overhead,
    sustainableFloor,
    marketBenchmark: market.median,
    recommended,
    low,
    high,
    confidence: clamp(
      confidence,
      0,
      100,
    ),
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Landmark;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function SmartPricingPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [priceResult, setPriceResult] =
    useState<PriceResult | null>(null);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [isPricing, setIsPricing] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [marketData, setMarketData] =
    useState<MarketData | null>(null);

  const handleImage = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8 MB.");
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    setAnalysis(null);
    setMarketData(null);
    setPriceResult(null);
    setCopied(false);
  };

  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setMarketData(null);
    setPriceResult(null);
    setCopied(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runAnalysis = async () => {
    if (!imageFile) {
      toast.error("Please upload a craft image first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setMarketData(null);
    setPriceResult(null);

    try {
      const formData = new FormData();

      /*
       * IMPORTANT:
       * Send the actual File object.
       * We do NOT send the filename for AI classification.
       */
      formData.append("image", imageFile);

      const response = await fetch(
        "/api/pricing/analyze",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to analyze the craft image.",
        );
      }

      if (!data?.success || !data?.analysis) {
        throw new Error(
          data?.error ||
            "Gemini did not return a valid analysis.",
        );
      }

      const detected =
        data.analysis as Analysis;

      setAnalysis(detected);

      toast.success(
        "AI craft analysis completed.",
      );
    } catch (error) {
      console.error(
        "NAVSHAKTHI AI analysis error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to analyze the image.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runPricing = async () => {
    if (!analysis) {
      toast.error(
        "Complete AI analysis first.",
      );
      return;
    }

    setIsPricing(true);
    setMarketData(null);
    setPriceResult(null);

    try {
      /*
       * Step 4 market intelligence:
       * match the AI-detected product to the most relevant
       * product-specific market profile on the server.
       */
      const params = new URLSearchParams({
        category: analysis.category,
        productType: analysis.productType,
        material: analysis.material,
        sizeLabel: analysis.sizeLabel,
        complexity: String(analysis.complexity),
      });

      const response = await fetch(
        `/api/pricing/market?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.market) {
        throw new Error(
          data?.error ||
            "Unable to retrieve market intelligence.",
        );
      }

      const matchedMarket = data.market as MarketData;

      /*
       * The market API already accounts for product-specific
       * market segment, broad size and visual complexity.
       * The local engine then adds finish, decoration, demand
       * and the sustainable production floor.
       */
      const result = calculateFairPrice(
        analysis,
        matchedMarket,
      );

      setMarketData(matchedMarket);
      setPriceResult(result);

      saveCraftPricing({
        materialCost: result.materialCost,
        labourBenchmark: result.labourBenchmark,
        estimatedLabourCost: result.estimatedLabourCost,
        packaging: result.packaging,
        overhead: result.overhead,
        sustainableFloor: result.sustainableFloor,
        marketBenchmark: result.marketBenchmark,
        recommended: result.recommended,
        low: result.low,
        high: result.high,
        confidence: result.confidence,
        market: {
          low: matchedMarket.low,
          median: matchedMarket.median,
          high: matchedMarket.high,
          demandChange: matchedMarket.demandChange,
          comparableCount: matchedMarket.comparableCount,
          matchLabel: matchedMarket.matchLabel,
          sourceType: matchedMarket.sourceType,
          sourceLabel: matchedMarket.sourceLabel,
          updatedAt: matchedMarket.updatedAt,
          materialCostReference:
            matchedMarket.materialCostReference,
          labourBenchmark: matchedMarket.labourBenchmark,
        },
      });

      window.dispatchEvent(
        new Event("navshakthi:craft-draft-updated"),
      );

      toast.success(
        `Matched market segment: ${matchedMarket.matchLabel}` ,
      );
    } catch (error) {
      console.error(
        "Pricing calculation failed:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to calculate the price.",
      );
    } finally {
      setIsPricing(false);
    }
  };

  const copyPrice = async () => {
    if (!priceResult) {
      return;
    }

    const text =
      `NAVSHAKTHI Fair Price\n` +
      `${analysis?.productType ?? "Craft product"}\n` +
      `Recommended price: ₹${formatCurrency(
        priceResult.recommended,
      )}\n` +
      `Range: ₹${formatCurrency(
        priceResult.low,
      )} – ₹${formatCurrency(
        priceResult.high,
      )}`;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      toast.success(
        "Price details copied.",
      );

      setTimeout(
        () => setCopied(false),
        2000,
      );
    } catch {
      toast.error(
        "Unable to copy price details.",
      );
    }
  };

  return (
    <PublicPage>
      <PageHero
  eyebrow="AI-POWERED FAIR PRICING"
  title="Know the right price for your craft."
  subtitle="Upload a photo of your handmade product. NAVSHAKTHI uses visual AI, market benchmarks and a transparent pricing model to help you arrive at a competitive and sustainable selling price."
/>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* ------------------------------------------------------- */}
        {/* HOW IT WORKS                                            */}
        {/* ------------------------------------------------------- */}

        <Reveal>
          <section className="mb-10 grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={ScanSearch}
              title="1. AI understands the craft"
              text="The uploaded image is analyzed for craft category, product type, material, finish, decoration, complexity and visual size."
            />

            <InfoCard
              icon={TrendingUp}
              title="2. Market benchmarks"
              text="The pricing engine compares the detected craft against benchmark market ranges and demand signals."
            />

            <InfoCard
              icon={Landmark}
              title="3. Protect the artisan"
              text="A sustainable cost floor and market sanity checks help prevent both underpricing and unrealistic AI-generated prices."
            />
          </section>
        </Reveal>

        {/* ------------------------------------------------------- */}
        {/* UPLOAD + ANALYSIS                                       */}
        {/* ------------------------------------------------------- */}

        <Reveal>
          <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            {/* Upload card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />

                  <span className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                    Step 1
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-foreground">
                  Upload your craft
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  A clear product photo gives the AI
                  better visual evidence.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
              />

              {!imagePreview ? (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="group flex min-h-[360px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 text-center transition hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-105">
                    <CloudUpload className="h-8 w-8" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">
                    Upload product photo
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    JPG, PNG or WEBP · Maximum 8 MB
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                    <Upload className="h-4 w-4" />
                    Choose image
                  </span>
                </button>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Uploaded craft"
                      className="max-h-[420px] w-full object-contain"
                    />

                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute right-3 top-3 rounded-lg bg-background/90 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-3 border-t border-border p-4">
                    <ImageIcon className="h-5 w-5 shrink-0 text-primary" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {imageFile?.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {imageFile
                          ? `${(
                              imageFile.size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={
                  !imageFile ||
                  isAnalyzing
                }
                onClick={runAnalysis}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing image with AI...
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" />
                    Analyze Craft with AI
                  </>
                )}
              </button>

              <div className="mt-5 rounded-xl bg-muted/40 p-4">
                <p className="text-xs leading-5 text-muted-foreground">
                  <strong className="text-foreground">
                    Privacy:
                  </strong>{" "}
                  Your image is sent to the AI analysis
                  service only when you press the analysis
                  button. The API key remains on the server.
                </p>
              </div>
            </div>

            {/* Analysis card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <ScanSearch className="h-5 w-5 text-primary" />

                  <span className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                    Step 2
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-foreground">
                  AI craft analysis
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Gemini analyzes the actual image and
                  returns structured craft characteristics.
                </p>
              </div>

              {isAnalyzing ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl bg-muted/30 px-6 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-8 w-8 animate-pulse" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">
                    Understanding your craft...
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    Identifying material, category,
                    workmanship, decoration and complexity.
                  </p>

                  <Loader2 className="mt-6 h-5 w-5 animate-spin text-primary" />
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  {/* Product heading */}
                  <div className="rounded-2xl bg-primary/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl shadow-sm">
                        {CATEGORY_ICONS[
                          analysis.category
                        ]}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          Detected product
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-foreground">
                          {analysis.productType}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {analysis.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI characteristics */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AnalysisItem
                      label="Material"
                      value={analysis.material}
                    />

                    <AnalysisItem
                      label="Finish"
                      value={analysis.finish}
                    />

                    <AnalysisItem
                      label="Visual complexity"
                      value={`${analysis.complexity}/10`}
                    />

                    <AnalysisItem
                      label="Visual size"
                      value={analysis.sizeLabel}
                    />

                    <AnalysisItem
                      label="Dimensions"
                      value={analysis.dimensions}
                    />

                    <AnalysisItem
                      label="AI confidence"
                      value={`${analysis.confidence}%`}
                    />
                  </div>

                  {/* Decoration */}
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Visible decoration
                    </p>

                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {analysis.decoration}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Visual analysis confidence
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Confidence reflects the AI's
                          visual certainty, not pricing accuracy.
                        </p>
                      </div>

                      <span className="text-lg font-bold text-primary">
                        {analysis.confidence}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${clamp(
                            analysis.confidence,
                            0,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price button */}
                  <button
                    type="button"
                    disabled={isPricing}
                    onClick={runPricing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPricing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Calculating fair price...
                      </>
                    ) : (
                      <>
                        <IndianRupee className="h-4 w-4" />
                        Calculate Fair Price
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl bg-muted/30 px-6 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ScanSearch className="h-8 w-8" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">
                    Waiting for your photo
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    Upload a craft image and press
                    "Analyze Craft with AI" to identify the
                    product.
                  </p>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        {/* ------------------------------------------------------- */}
        {/* PRICE RESULT                                            */}
        {/* ------------------------------------------------------- */}

        {priceResult && analysis && marketData && (
          <Reveal>
            <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />

                    <span className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                      Step 3
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Fair price recommendation
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Based on AI-detected characteristics,
                    market benchmark and sustainable production
                    cost.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyPrice}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy price
                    </>
                  )}
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Main price */}
                <div className="rounded-3xl bg-primary/5 p-7 sm:p-9">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Recommended selling price
                  </p>

                  <div className="mt-3 flex items-baseline gap-2">
                    <IndianRupee className="h-8 w-8 text-primary" />

                    <span className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
                      {formatCurrency(
                        priceResult.recommended,
                      )}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Suggested range:
                    <span className="ml-1 font-semibold text-foreground">
                      ₹
                      {formatCurrency(
                        priceResult.low,
                      )}{" "}
                      – ₹
                      {formatCurrency(
                        priceResult.high,
                      )}
                    </span>
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                      {analysis.category}
                    </span>

                    <span className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                      {analysis.sizeLabel}
                    </span>

                    <span className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                      {analysis.finish} finish
                    </span>
                  </div>
                </div>

                {/* Market benchmark */}
                <div className="rounded-3xl border border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <TrendingUp className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Market benchmark
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {marketData.matchLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <Metric
                      label="Low"
                      value={`₹${formatCurrency(
                        marketData.low,
                      )}`}
                    />

                    <Metric
                      label="Median"
                      value={`₹${formatCurrency(
                        marketData.median,
                      )}`}
                      emphasized
                    />

                    <Metric
                      label="High"
                      value={`₹${formatCurrency(
                        marketData.high,
                      )}`}
                    />
                  </div>

                  <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Comparable products
                      </span>

                      <span className="font-bold text-foreground">
                        {marketData.comparableCount}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Demand trend
                      </span>

                      <span className="font-bold text-primary">
                        +{marketData.demandChange}%
                      </span>
                    </div>

                    <div className="mt-3 border-t border-border/60 pt-3">
                      <p className="text-xs text-muted-foreground">
                        Source: {marketData.sourceLabel}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated: {marketData.updatedAt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-bold text-foreground">
                  Transparent cost breakdown
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <CostItem
                    label="Material reference"
                    value={priceResult.materialCost}
                  />

                  <CostItem
                    label="Labour estimate"
                    value={priceResult.estimatedLabourCost}
                    note={`₹${priceResult.labourBenchmark}/hr benchmark`}
                  />

                  <CostItem
                    label="Packaging"
                    value={priceResult.packaging}
                  />

                  <CostItem
                    label="Overhead"
                    value={priceResult.overhead}
                  />
                </div>
              </div>

              {/* Sustainable floor */}
              <div className="mt-6 rounded-2xl border border-border p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-foreground">
                      Sustainable production floor
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      The minimum reference level required to
                      cover estimated material, labour, packaging
                      and overhead costs.
                    </p>
                  </div>

                  <div className="text-xl font-bold text-foreground">
                    ₹
                    {formatCurrency(
                      priceResult.sustainableFloor,
                    )}
                  </div>
                </div>
              </div>

              {/* Methodology */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoCard
                  icon={Sparkles}
                  title="AI visual analysis"
                  text="Gemini analyzes the actual uploaded image to extract product characteristics. It does not directly decide the final price."
                />

                <InfoCard
                  icon={TrendingUp}
                  title="Product-specific market anchor"
                  text="The system matches the detected product and material to the most relevant market segment before applying controlled craftsmanship adjustments."
                />

                <InfoCard
                  icon={Landmark}
                  title="Artisan protection"
                  text="A sustainable production floor prevents the recommendation from falling below estimated material, labour, packaging and overhead requirements."
                />
              </div>

              <div className="mt-6 rounded-2xl bg-muted/40 p-5">
                <p className="text-xs leading-6 text-muted-foreground">
                  <strong className="text-foreground">
                    Important:
                  </strong>{" "}
                  Material and labour figures shown here are
                  prototype reference values. They are not
                  presented as universal government rates.
                  In the production version, verified market
                  and applicable official reference datasets
                  can replace these values.
                </p>
              </div>
            </section>
          </Reveal>
        )}

        {/* ------------------------------------------------------- */}
        {/* CRAFT CATEGORIES                                        */}
        {/* ------------------------------------------------------- */}

        <Reveal>
          <section className="mt-16">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                Supported crafts
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                Built for India's craft diversity
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The AI classification layer supports multiple
                traditional craft categories rather than
                assuming every handmade product is pottery.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                Object.keys(
                  CRAFT_PROFILES,
                ) as CraftCategory[]
              ).map((category) => (
                <div
                  key={category}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="text-2xl">
                    {CATEGORY_ICONS[category]}
                  </span>

                  <span className="text-sm font-semibold text-foreground">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </PublicPage>
  );
}

function AnalysisItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-bold ${
          emphasized
            ? "text-primary"
            : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CostItem({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-foreground">
        ₹{formatCurrency(value)}
      </p>

      {note && (
        <p className="mt-1 text-xs text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}
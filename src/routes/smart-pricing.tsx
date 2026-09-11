import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Check,
  CloudUpload,
  Copy,
  IndianRupee,
  Landmark,
  Loader2,
  PackageCheck,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
   Image as ImageIcon,
} from "lucide-react";

import {
  PublicPage,
  PageHero,
} from "@/components/public-page";
import { Reveal } from "@/components/section";
import {
  saveCraftDNA,
  saveCraftPricing,
} from "@/lib/craft-draft";

import { buildCraftDNA } from "@/lib/craft-dna/build-dna";

/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute(
  "/smart-pricing",
)({
  component: SmartPricingPage,
});

/* =========================================================
   TYPES
========================================================= */

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

type FinishLevel =
  | "Basic"
  | "Fine"
  | "Intricate";

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

  primaryColour: string;
  secondaryColours: string[];
  shape: string;
  pattern: string;
  texture: string;

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
  sourceType:
    | "curated_reference"
    | "official_reference";
  sourceLabel: string;
  updatedAt: string;
  materialCostReference: number;
  labourBenchmark: number;
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

interface FutureOutlook {
  low: number;
  central: number;
  high: number;
  changePercent: number;
}

interface GovernmentEvent {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  relevance: number;
  source: string;
}

interface PlannerSource {
  label: string;
  url: string;
  type:
    | "official"
    | "curated_reference"
    | "calculation";
  updatedAt?: string;
}

interface PlannerDataQuality {
  marketReferenceAvailable: boolean;
  governmentEventsAvailable: boolean;
  tradeDataAvailable: boolean;
  odopDataAvailable: boolean;
  notes: string[];
}

interface FuturePlannerResult {
  currentReference: number;
  currentLow: number;
  currentHigh: number;

  threeMonth: FutureOutlook;
  sixMonth: FutureOutlook;

  demandDirection:
    | "increasing"
    | "stable"
    | "decreasing"
    | "insufficient_data";

  demandChange: number | null;
  comparableCount: number;

  seasonalityLevel:
    | "low"
    | "moderate"
    | "high";

  opportunityScore: number;

  opportunityLevel:
    | "low"
    | "moderate"
    | "high";

  productionRecommendation: string;

  forecast: Array<{
    month: string;
    demandScore: number;
    seasonalityIndex: number;
  }>;

  governmentEvents: GovernmentEvent[];

  sources: PlannerSource[];

  dataQuality: PlannerDataQuality;
}

interface FuturePlannerResponse {
  success: boolean;
  result?: FuturePlannerResult;

  error?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const CRAFT_PROFILES: Record<
  CraftCategory,
  {
    materialCost: number;
    labourBenchmark: number;
    baseHours: number;
  }
> = {
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

const SIZE_MULTIPLIER: Record<
  SizeLabel,
  number
> = {
  Mini: 0.65,
  Small: 0.82,
  Standard: 1,
  Medium: 1.15,
  Large: 1.45,
  "Extra Large": 1.85,
  Monumental: 2.5,
};

const FINISH_MULTIPLIER: Record<
  FinishLevel,
  number
> = {
  Basic: 0.96,
  Fine: 1.06,
  Intricate: 1.16,
};

const CATEGORY_ICONS: Record<
  CraftCategory,
  string
> = {
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

/* =========================================================
   HELPERS
========================================================= */

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

function roundToFive(
  value: number,
) {
  return Math.max(
    5,
    Math.round(value / 5) * 5,
  );
}

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDate(
  value: string,
) {
  if (!value) {
    return "Date unavailable";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function createCraftDNAFromAnalysis(
  detected: Analysis,
) {
  return buildCraftDNA({
    category: detected.category,
    productType: detected.productType,
    material: detected.material,
    primaryColour: detected.primaryColour,
    secondaryColours: detected.secondaryColours,
    shape: detected.shape,
    pattern: detected.pattern,
    texture: detected.texture,
    finish: detected.finish,
    complexity: detected.complexity,
    decoration: detected.decoration,
    sizeLabel: detected.sizeLabel,
    dimensions: detected.dimensions,
    confidence: detected.confidence,
  });
}

function getDecorationMultiplier(
  decoration: string,
) {
  const text =
    decoration
      .toLowerCase()
      .trim();

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

/* =========================================================
   PRICE ENGINE
========================================================= */

function calculateFairPrice(
  analysis: Analysis,
  market: MarketData,
): PriceResult {
  const profile =
    CRAFT_PROFILES[
      analysis.category
    ];

  const sizeMultiplier =
    SIZE_MULTIPLIER[
      analysis.sizeLabel
    ] ?? 1;

  const finishMultiplier =
    FINISH_MULTIPLIER[
      analysis.finish
    ] ?? 1;

  /*
   * Bounded craftsmanship signal.
   */
  const complexityMultiplier =
    clamp(
      0.90 +
        analysis.complexity *
          0.035,
      0.90,
      1.25,
    );

  const decorationMultiplier =
    getDecorationMultiplier(
      analysis.decoration,
    );

  /*
   * Demand is intentionally NOT
   * treated as direct price growth.
   */
  const trendMultiplier =
    clamp(
      1 +
        (market.demandChange /
          100) *
          0.30,
      0.97,
      1.07,
    );

  /*
   * Reference labour estimate.
   */
  const estimatedHours =
    profile.baseHours *
    (0.75 +
      analysis.complexity *
        0.08) *
    sizeMultiplier *
    (analysis.finish ===
    "Intricate"
      ? 1.12
      : analysis.finish ===
          "Fine"
        ? 1.05
        : 1);

  const estimatedLabourCost =
    Math.round(
      estimatedHours *
        market.labourBenchmark,
    );

  /*
   * Reference material cost.
   */
  const materialCost =
    Math.round(
      market.materialCostReference *
        sizeMultiplier,
    );

  /*
   * Packaging allowance.
   */
  const packaging =
    Math.max(
      10,
      Math.round(
        (materialCost +
          estimatedLabourCost) *
          0.045,
      ),
    );

  /*
   * Overhead allowance.
   */
  const overhead =
    Math.max(
      10,
      Math.round(
        (materialCost +
          estimatedLabourCost) *
          0.055,
      ),
    );

  /*
   * Sustainable production floor.
   */
  const sustainableFloor =
    roundToFive(
      materialCost +
        estimatedLabourCost +
        packaging +
        overhead,
    );

  /*
   * Market anchored value.
   */
  const rawMarketPrice =
    market.median *
    complexityMultiplier *
    finishMultiplier *
    sizeMultiplier *
    decorationMultiplier *
    trendMultiplier;

  /*
   * Guardrail:
   * visual signals cannot create an
   * extreme unrestricted price.
   */
  const marketAnchoredPrice =
    clamp(
      rawMarketPrice,
      market.median * 0.85,
      market.median * 1.45,
    );

  let recommended: number;

  /*
   * Normal market case.
   */
  if (
    sustainableFloor <=
    market.high
  ) {
    recommended =
      Math.max(
        marketAnchoredPrice,
        sustainableFloor * 1.08,
      );

    recommended =
      Math.min(
        recommended,
        market.high,
      );
  } else {
    /*
     * Cost pressure case.
     */
    recommended =
      sustainableFloor * 1.10;
  }

  recommended =
    roundToFive(
      Math.max(
        recommended,
        sustainableFloor,
      ),
    );

  let low: number;
  let high: number;

  if (
    sustainableFloor <=
    market.high
  ) {
    low =
      roundToFive(
        Math.max(
          market.low,
          sustainableFloor,
          recommended * 0.92,
        ),
      );

    high =
      roundToFive(
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
    low =
      roundToFive(
        Math.max(
          sustainableFloor,
          recommended * 0.95,
        ),
      );

    high =
      roundToFive(
        Math.max(
          recommended * 1.10,
          recommended + 25,
        ),
      );
  }

  const marketConfidence =
    clamp(
      70 +
        market.comparableCount *
          0.4,
      70,
      90,
    );

  const confidence =
    Math.round(
      analysis.confidence *
        0.65 +
        marketConfidence *
          0.35,
    );

  return {
    materialCost,
    labourBenchmark:
      market.labourBenchmark,
    estimatedLabourCost,
    packaging,
    overhead,
    sustainableFloor,
    marketBenchmark:
      market.median,
    recommended,
    low,
    high,
    confidence:
      clamp(
        confidence,
        0,
        100,
      ),
  };
}

/* =========================================================
   SMART PRICING PAGE
========================================================= */

function SmartPricingPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    imageFile,
    setImageFile,
  ] =
    useState<File | null>(null);

  const [
    imagePreview,
    setImagePreview,
  ] =
    useState<string | null>(
      null,
    );

  const [
    analysis,
    setAnalysis,
  ] =
    useState<Analysis | null>(
      null,
    );

  const [
    marketData,
    setMarketData,
  ] =
    useState<MarketData | null>(
      null,
    );

  const [
    priceResult,
    setPriceResult,
  ] =
    useState<PriceResult | null>(
      null,
    );

  const [
    isAnalyzing,
    setIsAnalyzing,
  ] =
    useState(false);

  const [
    isPricing,
    setIsPricing,
  ] =
    useState(false);

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  /* ---------------------------------------------------------
     FUTURE PLANNER STATE
  --------------------------------------------------------- */

  const [
    futurePlanner,
    setFuturePlanner,
  ] =
    useState<FuturePlannerResult | null>(
      null,
    );

  const [
    futureLoading,
    setFutureLoading,
  ] =
    useState(false);

  const [
    futureError,
    setFutureError,
  ] =
    useState("");

  /*
   * Prevent stale object URLs.
   */
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview,
        );
      }
    };
  }, [imagePreview]);

  /* =========================================================
     IMAGE HANDLER
  ========================================================= */

  const handleImage = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      toast.error(
        "Please upload a valid image.",
      );
      return;
    }

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      toast.error(
        "Image must be smaller than 8 MB.",
      );
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview,
      );
    }

    const previewUrl =
      URL.createObjectURL(
        file,
      );

    setImageFile(file);
    setImagePreview(
      previewUrl,
    );

    setAnalysis(null);
    setMarketData(null);
    setPriceResult(null);

    setFuturePlanner(null);
    setFutureError("");

    setCopied(false);
  };

  /* =========================================================
     CLEAR IMAGE
  ========================================================= */

  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview,
      );
    }

    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setMarketData(null);
    setPriceResult(null);

    setFuturePlanner(null);
    setFutureError("");

    setCopied(false);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };

  /* =========================================================
     AI ANALYSIS
  ========================================================= */

  const runAnalysis = async () => {
    if (!imageFile) {
      toast.error(
        "Please upload a craft image first.",
      );
      return;
    }

    setIsAnalyzing(true);

    setAnalysis(null);
    setMarketData(null);
    setPriceResult(null);

    setFuturePlanner(null);
    setFutureError("");

    try {
      const formData =
        new FormData();

      /*
       * Send the actual image.
       */
      formData.append(
        "image",
        imageFile,
      );

      const response =
        await fetch(
          "/api/pricing/analyze",
          {
            method: "POST",
            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to analyze the craft image.",
        );
      }

      if (
        !data?.success ||
        !data?.analysis
      ) {
        throw new Error(
          data?.error ||
            "Gemini did not return a valid analysis.",
        );
      }

      const detected =
        data.analysis as Analysis;

      /*
       * =======================================================
       * CRAFT DNA
       * =======================================================
       *
       * The existing Gemini image analysis is the primary
       * evidence. We convert that structured analysis into
       * the reusable Craft DNA profile without making a
       * second AI request.
       */
      const craftDNA =
        createCraftDNAFromAnalysis(
          detected,
        );

      /*
       * Persist Craft DNA into the shared Craft Draft so
       * Cataloger, Pricing, Future Planner and later
       * verification workflows can reuse the same craft
       * identity.
       */
      saveCraftDNA(
        craftDNA,
      );

      setAnalysis(
        detected,
      );

      toast.success(
        "AI craft analysis completed and Craft DNA created.",
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

  /* =========================================================
     MARKET + PRICE
  ========================================================= */

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

    setFuturePlanner(null);
    setFutureError("");

    try {
      /*
       * Product-specific market lookup.
       */
      const params =
        new URLSearchParams({
          category:
            analysis.category,
          productType:
            analysis.productType,
          material:
            analysis.material,
          sizeLabel:
            analysis.sizeLabel,
          complexity:
            String(
              analysis.complexity,
            ),
        });

      const response =
        await fetch(
          `/api/pricing/market?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.success ||
        !data?.market
      ) {
        throw new Error(
          data?.error ||
            "Unable to retrieve market intelligence.",
        );
      }

      const matchedMarket =
        data.market as MarketData;

      /*
       * Local transparent price
       * engine.
       */
      const result =
        calculateFairPrice(
          analysis,
          matchedMarket,
        );

      setMarketData(
        matchedMarket,
      );

      setPriceResult(
        result,
      );

      /*
       * Save pricing into shared
       * Craft Draft.
       */
      saveCraftPricing({
        materialCost:
          result.materialCost,

        labourBenchmark:
          result.labourBenchmark,

        estimatedLabourCost:
          result.estimatedLabourCost,

        packaging:
          result.packaging,

        overhead:
          result.overhead,

        sustainableFloor:
          result.sustainableFloor,

        marketBenchmark:
          result.marketBenchmark,

        recommended:
          result.recommended,

        low:
          result.low,

        high:
          result.high,

        confidence:
          result.confidence,

        market: {
          low:
            matchedMarket.low,

          median:
            matchedMarket.median,

          high:
            matchedMarket.high,

          demandChange:
            matchedMarket.demandChange,

          comparableCount:
            matchedMarket.comparableCount,

          matchLabel:
            matchedMarket.matchLabel,

          sourceType:
            matchedMarket.sourceType,

          sourceLabel:
            matchedMarket.sourceLabel,

          updatedAt:
            matchedMarket.updatedAt,

          materialCostReference:
            matchedMarket.materialCostReference,

          labourBenchmark:
            matchedMarket.labourBenchmark,
        },
      });

      window.dispatchEvent(
        new Event(
          "navshakthi:craft-draft-updated",
        ),
      );

      toast.success(
        `Matched market segment: ${matchedMarket.matchLabel}`,
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

  /* =========================================================
     FUTURE PLANNER
  ========================================================= */

  const handleGenerateFutureForecast =
  async () => {
    if (!analysis) {
      toast.error(
        "Complete AI craft analysis first.",
      );
      return;
    }

    if (!priceResult) {
      toast.error(
        "Calculate the fair price first.",
      );
      return;
    }

    setFutureLoading(true);
    setFutureError("");

    try {
      /*
       * The Future Planner receives the same
       * craft characteristics and current
       * pricing range used by Smart Pricing.
       *
       * The backend then retrieves the exact
       * matched market reference itself.
       */
      const response =
        await fetch(
          "/api/pricing/future-planner",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              category:
                analysis.category,

              productType:
                analysis.productType,

              material:
                analysis.material,

              currentLow:
                priceResult.low,

              currentHigh:
                priceResult.high,

              complexity:
                analysis.complexity,
            }),
          },
        );

      const data =
        (await response.json()) as FuturePlannerResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.result
      ) {
        throw new Error(
          data.error ||
            "Unable to generate the future planning outlook.",
        );
      }

      /*
       * Keep the planner result in the page state.
       *
       * We intentionally do NOT pass it through
       * saveCraftPricing(), because that function
       * accepts only CraftPricingDraft fields.
       */
      setFuturePlanner(
        data.result,
      );

      toast.success(
        "Future planning outlook refreshed.",
      );
    } catch (error) {
      console.error(
        "Future Planner error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate the future outlook.";

      setFutureError(
        message,
      );

      toast.error(
        message,
      );
    } finally {
      setFutureLoading(false);
    }
  };
  /* =========================================================
     COPY
  ========================================================= */

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
      await navigator.clipboard.writeText(
        text,
      );

      setCopied(true);

      toast.success(
        "Price details copied.",
      );

      window.setTimeout(
        () => setCopied(false),
        2000,
      );
    } catch {
      toast.error(
        "Unable to copy price details.",
      );
    }
  };

  /* =========================================================
     DERIVED VALUES
  ========================================================= */

  const demandChange =
    marketData?.demandChange ??
    futurePlanner?.demandChange ??
    null;

  const demandDirection =
    futurePlanner?.demandDirection ??
    (demandChange === null
      ? "insufficient_data"
      : demandChange >= 3
        ? "increasing"
        : demandChange <= -3
          ? "decreasing"
          : "stable");

  const opportunityScore =
    futurePlanner?.opportunityScore ??
    (demandChange === null
      ? 0
      : clamp(
          Math.round(
            50 +
              demandChange *
                (50 / 30),
          ),
          0,
          100,
        ));

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <PublicPage>
      <PageHero
        eyebrow="AI-POWERED FAIR PRICING"
        title="Know the right price for your craft."
        subtitle="Upload a photo of your handmade product. NAVSHAKTHI uses visual AI, product-specific market benchmarks and a transparent pricing model to help you arrive at a competitive and sustainable selling price."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

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
              text="The pricing engine matches the detected craft against product-specific market references and observed demand signals."
            />

            <InfoCard
              icon={ShieldCheck}
              title="3. Protect the artisan"
              text="A sustainable production floor and bounded pricing rules help prevent both underpricing and unrealistic AI-generated prices."
            />

          </section>
        </Reveal>

        {/* =====================================================
            UPLOAD + ANALYSIS
        ===================================================== */}

        <Reveal>
          <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">

            {/* -------------------------------------------------
                UPLOAD
            ------------------------------------------------- */}

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
                  A clear product photo gives the AI better visual evidence.
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
                  Your image is sent to the AI analysis service only when you
                  press the analysis button. The API key remains on the server.

                </p>

              </div>

            </div>

            {/* -------------------------------------------------
                ANALYSIS
            ------------------------------------------------- */}

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
                  Gemini analyzes the actual image and returns structured craft characteristics.
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
                    Identifying material, category, workmanship, decoration and complexity.
                  </p>

                  <Loader2 className="mt-6 h-5 w-5 animate-spin text-primary" />

                </div>

              ) : analysis ? (

                <div className="space-y-4">

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

                  {/* CRAFT DNA */}

                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          Craft DNA
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-foreground">
                          Image-derived craft identity
                        </h3>
                      </div>

                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                      <AnalysisItem
                        label="Primary colour"
                        value={
                          analysis.primaryColour ||
                          "Not provided"
                        }
                      />

                      <AnalysisItem
                        label="Secondary colours"
                        value={
                          analysis.secondaryColours?.length
                            ? analysis.secondaryColours.join(", ")
                            : "Not provided"
                        }
                      />

                      <AnalysisItem
                        label="Shape"
                        value={
                          analysis.shape ||
                          "Not provided"
                        }
                      />

                      <AnalysisItem
                        label="Pattern"
                        value={
                          analysis.pattern ||
                          "Not provided"
                        }
                      />

                      <AnalysisItem
                        label="Texture"
                        value={
                          analysis.texture ||
                          "Not provided"
                        }
                      />

                      <AnalysisItem
                        label="Visual confidence"
                        value={`${analysis.confidence}%`}
                      />

                    </div>

                    <div className="mt-4 rounded-xl bg-background/70 p-4">
                      <p className="text-xs leading-5 text-muted-foreground">
                        These visual attributes are extracted from the uploaded
                        product image and stored as the shared Craft DNA for
                        downstream NAVSHAKTHI workflows.
                      </p>
                    </div>

                  </div>

                  <div className="rounded-2xl border border-border p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Visible decoration
                    </p>

                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {analysis.decoration}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-border p-4">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-sm font-semibold text-foreground">
                          Visual analysis confidence
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Confidence reflects AI visual certainty, not pricing accuracy.
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
                    Upload a craft image and press “Analyze Craft with AI” to identify the product.
                  </p>

                </div>

              )}

            </div>

          </section>
        </Reveal>

        {/* =====================================================
            PRICE RESULT
        ===================================================== */}

        {priceResult &&
          analysis &&
          marketData && (

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
                      Based on AI-detected characteristics, product-specific market benchmark and sustainable production cost.
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

                  {/* MAIN PRICE */}

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

                      <span className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-primary">
                        {priceResult.confidence}% confidence
                      </span>

                    </div>

                  </div>

                  {/* MARKET */}

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
                          {marketData.demandChange > 0
                            ? "+"
                            : ""}
                          {marketData.demandChange}%
                        </span>

                      </div>

                      <div className="mt-3 border-t border-border/60 pt-3">

                        <p className="text-xs text-muted-foreground">
                          Source: {marketData.sourceLabel}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Updated: {formatDate(
                            marketData.updatedAt,
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* COST BREAKDOWN */}

                <div className="mt-6">

                  <h3 className="mb-4 text-lg font-bold text-foreground">
                    Transparent cost breakdown
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    <CostItem
                      label="Material reference"
                      value={
                        priceResult.materialCost
                      }
                    />

                    <CostItem
                      label="Labour estimate"
                      value={
                        priceResult.estimatedLabourCost
                      }
                      note={`₹${priceResult.labourBenchmark}/hr benchmark`}
                    />

                    <CostItem
                      label="Packaging"
                      value={
                        priceResult.packaging
                      }
                    />

                    <CostItem
                      label="Overhead"
                      value={
                        priceResult.overhead
                      }
                    />

                  </div>

                </div>

                {/* SUSTAINABLE FLOOR */}

                <div className="mt-6 rounded-2xl border border-border p-5">

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                    <div>

                      <div className="flex items-center gap-2">

                        <PackageCheck className="h-4 w-4 text-primary" />

                        <p className="font-semibold text-foreground">
                          Sustainable production floor
                        </p>

                      </div>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Minimum reference level required to cover estimated material, labour, packaging and overhead costs.
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

                {/* METHODOLOGY */}

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
                    Material and labour figures are prototype reference values.
                    They are not presented as universal government rates.
                    Future production deployments can replace them with verified
                    applicable datasets.

                  </p>

                </div>

              </section>

            </Reveal>

          )}

        {/* =====================================================
            FUTURE PLANNER
        ===================================================== */}

        {priceResult &&
          analysis &&
          marketData && (

            <Reveal>

              <section className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">

                {/* HEADER */}

                <div className="border-b border-border bg-primary/5 p-6 sm:p-8">

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                      <div className="mb-2 flex items-center gap-2">

                        <CalendarDays className="h-5 w-5 text-primary" />

                        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                          Step 4 · Future Planner
                        </span>

                      </div>

                      <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                        Plan what to make next.
                      </h2>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                        NAVSHAKTHI converts available market, seasonal and
                        government opportunity signals into a bounded
                        production-planning outlook.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleGenerateFutureForecast
                      }
                      disabled={
                        futureLoading
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {futureLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-4 w-4" />
                          Refresh outlook
                        </>
                      )}

                    </button>

                  </div>

                </div>

                {/* ERROR */}

                {futureError && (

                  <div className="m-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">

                    <strong>
                      Future Planner:
                    </strong>{" "}
                    {futureError}

                  </div>

                )}

                {/* EMPTY */}

                {!futurePlanner &&
                  !futureLoading &&
                  !futureError && (

                    <div className="p-8 text-center sm:p-12">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                        <CalendarDays className="h-7 w-7" />

                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-foreground">
                        Plan your next production cycle
                      </h3>

                      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        Generate a 3-month and 6-month outlook using the same
                        market evidence already used by Smart Pricing.
                      </p>

                    </div>

                  )}

                {/* LOADING */}

                {futureLoading && (

                  <div className="p-10 text-center">

                    <RefreshCw className="mx-auto h-7 w-7 animate-spin text-primary" />

                    <p className="mt-4 text-sm font-medium text-foreground">
                      Building your future planning outlook...
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Combining market reference, seasonal and government opportunity signals.
                    </p>

                  </div>

                )}

                {/* RESULT */}

                {futurePlanner && (

                  <div className="space-y-6 p-6 sm:p-8">

                    {/* TOP METRICS */}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      <PlannerMetric
                        icon={
                          <CalendarDays className="h-4 w-4" />
                        }
                        label="3-Month Outlook"
                        value={`₹${formatCurrency(
                          futurePlanner.threeMonth.central,
                        )}`}
                        note={`${futurePlanner.threeMonth.changePercent >= 0 ? "+" : ""}${futurePlanner.threeMonth.changePercent}% vs current`}
                      />

                      <PlannerMetric
                        icon={
                          <TrendingUp className="h-4 w-4" />
                        }
                        label="6-Month Outlook"
                        value={`₹${formatCurrency(
                          futurePlanner.sixMonth.central,
                        )}`}
                        note={`${futurePlanner.sixMonth.changePercent >= 0 ? "+" : ""}${futurePlanner.sixMonth.changePercent}% vs current`}
                      />

                      <PlannerMetric
                        icon={
                          demandDirection ===
                          "decreasing"
                            ? (
                              <TrendingDown className="h-4 w-4" />
                            )
                            : (
                              <TrendingUp className="h-4 w-4" />
                            )
                        }
                        label="Demand Direction"
                        value={formatDemandDirection(
                          demandDirection,
                        )}
                        note={
                          demandChange ===
                          null
                            ? "Signal unavailable"
                            : `${demandChange > 0 ? "+" : ""}${demandChange}% observed signal`
                        }
                      />

                      <PlannerMetric
                        icon={
                          <Target className="h-4 w-4" />
                        }
                        label="Opportunity"
                        value={`${opportunityScore}/100`}
                        note={
                          futurePlanner.opportunityLevel
                        }
                      />

                    </div>

                    {/* THREE / SIX MONTH */}

                    <div className="grid gap-6 lg:grid-cols-2">

                      <OutlookCard
                        eyebrow="NEXT 3 MONTHS"
                        title="Price outlook"
                        outlook={
                          futurePlanner.threeMonth
                        }
                        icon={
                          <CalendarDays className="h-5 w-5" />
                        }
                        current={
                          futurePlanner.currentReference
                        }
                      />

                      <OutlookCard
                        eyebrow="NEXT 6 MONTHS"
                        title="Price outlook"
                        outlook={
                          futurePlanner.sixMonth
                        }
                        icon={
                          <CalendarDays className="h-5 w-5" />
                        }
                        current={
                          futurePlanner.currentReference
                        }
                      />

                    </div>

                    {/* SIGNAL CARDS */}

                    <div className="grid gap-4 md:grid-cols-3">

                      <SignalCard
                        icon={
                          demandDirection ===
                          "decreasing"
                            ? (
                              <TrendingDown className="h-5 w-5" />
                            )
                            : (
                              <TrendingUp className="h-5 w-5" />
                            )
                        }
                        title="Demand trend"
                        value={formatDemandDirection(
                          demandDirection,
                        )}
                        text={
                          demandChange ===
                          null
                            ? "No normalized demand signal is available for this craft yet."
                            : `Observed market signal: ${demandChange > 0 ? "+" : ""}${demandChange}%. This is a demand signal, not a direct price-growth percentage.`
                        }
                      />

                      <SignalCard
                        icon={
                          <CalendarDays className="h-5 w-5" />
                        }
                        title="Seasonality"
                        value={
                          capitalize(
                            futurePlanner.seasonalityLevel,
                          )
                        }
                        text="Seasonal and event signals can influence production timing and market preparation."
                      />

                      <SignalCard
                        icon={
                          <Target className="h-5 w-5" />
                        }
                        title="Opportunity score"
                        value={`${futurePlanner.opportunityScore}/100`}
                        text="NAVSHAKTHI decision-support score combining the currently available opportunity signals."
                      />

                    </div>

                    {/* WHAT SHOULD I MAKE */}

                    <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8">

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">

                          <Sparkles className="h-6 w-6" />

                        </div>

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                            Production recommendation
                          </p>

                          <h3 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
                            What should I make next?
                          </h3>

                          <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/80">
                            {futurePlanner.productionRecommendation}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* FORECAST SIGNALS */}

                    {futurePlanner.forecast.length >
                      0 && (

                      <div>

                        <div className="mb-4">

                          <h3 className="text-lg font-bold text-foreground">
                            Six-month signal path
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Relative demand and seasonality indicators used by the planning engine.
                          </p>

                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                          {futurePlanner.forecast.map(
                            (point) => (

                              <div
                                key={point.month}
                                className="rounded-2xl border border-border p-4"
                              >

                                <div className="flex items-center justify-between">

                                  <span className="text-sm font-semibold text-foreground">
                                    {point.month}
                                  </span>

                                  <Activity className="h-4 w-4 text-primary" />

                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">

                                  <Metric
                                    label="Demand"
                                    value={`${point.demandScore}/100`}
                                    emphasized
                                  />

                                  <Metric
                                    label="Seasonality"
                                    value={`${point.seasonalityIndex}/100`}
                                  />

                                </div>

                              </div>

                            ),
                          )}

                        </div>

                      </div>

                    )}

                    {/* GOVERNMENT EVENTS */}

                    <div>

                      <div className="mb-4">

                        <div className="flex items-center gap-2">

                          <Landmark className="h-5 w-5 text-primary" />

                          <h3 className="text-lg font-bold text-foreground">
                            Government market opportunities
                          </h3>

                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Upcoming official handicraft events detected for the planning horizon.
                        </p>

                      </div>

                      {futurePlanner.governmentEvents.length >
                        0 ? (

                        <div className="grid gap-3 md:grid-cols-2">

                          {futurePlanner.governmentEvents.map(
                            (
                              event,
                              index,
                            ) => (

                              <div
                                key={`${event.title}-${event.startDate}-${index}`}
                                className="rounded-2xl border border-border bg-background p-5"
                              >

                                <div className="flex items-start gap-3">

                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">

                                    <CalendarDays className="h-5 w-5" />

                                  </div>

                                  <div className="min-w-0">

                                    <h4 className="font-semibold text-foreground">
                                      {event.title}
                                    </h4>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {formatDate(
                                        event.startDate,
                                      )}{" "}
                                      –{" "}
                                      {formatDate(
                                        event.endDate,
                                      )}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {event.location}
                                    </p>

                                  </div>

                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">

                                  <span className="text-xs text-muted-foreground">
                                    Relevance
                                  </span>

                                  <span className="font-semibold text-primary">
                                    {event.relevance}/100
                                  </span>

                                </div>

                              </div>

                            ),
                          )}

                        </div>

                      ) : (

                        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                          No upcoming government event signal was available for this planning window.
                        </div>

                      )}

                    </div>

                    {/* SOURCES */}

                    <div className="rounded-2xl bg-muted/40 p-5">

                      <div className="flex items-center gap-2">

                        <ShieldCheck className="h-5 w-5 text-primary" />

                        <h3 className="font-semibold text-foreground">
                          Evidence & data quality
                        </h3>

                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <DataQualityItem
                          label="Market reference"
                          available={
                            futurePlanner.dataQuality
                              .marketReferenceAvailable
                          }
                        />

                        <DataQualityItem
                          label="Government events"
                          available={
                            futurePlanner.dataQuality
                              .governmentEventsAvailable
                          }
                        />

                        <DataQualityItem
                          label="TRADESTAT"
                          available={
                            futurePlanner.dataQuality
                              .tradeDataAvailable
                          }
                        />

                        <DataQualityItem
                          label="ODOP"
                          available={
                            futurePlanner.dataQuality
                              .odopDataAvailable
                          }
                        />

                      </div>

                      {futurePlanner.sources.length >
                        0 && (

                        <div className="mt-5 border-t border-border/60 pt-5">

                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Sources
                          </p>

                          <div className="mt-3 space-y-2">

                            {futurePlanner.sources.map(
                              (
                                source,
                                index,
                              ) => (

                                <div
                                  key={`${source.label}-${index}`}
                                  className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between"
                                >

                                  <span className="text-muted-foreground">
                                    {source.label}
                                  </span>

                                  <span className="text-muted-foreground">

                                    {source.updatedAt
                                      ? `Updated ${formatDate(
                                          source.updatedAt,
                                        )}`
                                      : source.type}

                                  </span>

                                </div>

                              ),
                            )}

                          </div>

                        </div>

                      )}

                      {futurePlanner.dataQuality.notes.length >
                        0 && (

                        <div className="mt-5 border-t border-border/60 pt-5">

                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Planning notes
                          </p>

                          <ul className="mt-3 space-y-2">

                            {futurePlanner.dataQuality.notes.map(
                              (
                                note,
                                index,
                              ) => (

                                <li
                                  key={index}
                                  className="text-xs leading-5 text-muted-foreground"
                                >
                                  • {note}
                                </li>

                              ),
                            )}

                          </ul>

                        </div>

                      )}

                    </div>

                    {/* DISCLAIMER */}

                    <div className="rounded-2xl border border-border p-5">

                      <p className="text-xs leading-6 text-muted-foreground">

                        <strong className="text-foreground">
                          Planning note:
                        </strong>{" "}
                        Future Planner provides bounded decision support from
                        available market, seasonal and government opportunity
                        signals. It does not guarantee future prices or demand.
                        The artisan remains the final decision-maker.

                      </p>

                    </div>

                  </div>

                )}

              </section>

            </Reveal>

          )}

        {/* =====================================================
            SUPPORTED CRAFTS
        ===================================================== */}

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
                The AI classification layer supports multiple traditional craft categories rather than assuming every handmade product is pottery.
              </p>

            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {(
                Object.keys(
                  CRAFT_PROFILES,
                ) as CraftCategory[]
              ).map(
                (category) => (

                  <div
                    key={category}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >

                    <span className="text-2xl">
                      {CATEGORY_ICONS[
                        category
                      ]}
                    </span>

                    <span className="text-sm font-semibold text-foreground">
                      {category}
                    </span>

                  </div>

                ),
              )}

            </div>

          </section>

        </Reveal>

      </div>
    </PublicPage>
  );
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{
    className?: string;
  }>;
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
        {value || "Not provided"}
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
        ₹
        {formatCurrency(
          value,
        )}
      </p>

      {note && (
        <p className="mt-1 text-xs text-muted-foreground">
          {note}
        </p>
      )}

    </div>
  );
}

function PlannerMetric({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-foreground">
            {value}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {note}
      </p>

    </div>
  );
}

function OutlookCard({
  eyebrow,
  title,
  outlook,
  icon,
  current,
}: {
  eyebrow: string;
  title: string;
  outlook: FutureOutlook;
  icon: ReactNode;
  current: number;
}) {
  return (
    <div className="rounded-3xl border border-border p-6">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            {eyebrow}
          </p>

          <h3 className="mt-2 font-display text-2xl text-foreground">
            {title}
          </h3>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Central reference
      </p>

      <p className="mt-1 text-4xl font-black text-foreground">
        ₹
        {formatCurrency(
          outlook.central,
        )}
      </p>

      <p className="mt-2 text-sm text-muted-foreground">

        Reference range:

        <span className="ml-1 font-semibold text-foreground">
          ₹
          {formatCurrency(
            outlook.low,
          )}{" "}
          – ₹
          {formatCurrency(
            outlook.high,
          )}
        </span>

      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">

        <div className="rounded-2xl bg-muted/40 p-4">

          <p className="text-xs text-muted-foreground">
            Change vs current
          </p>

          <p
            className={`mt-1 text-lg font-bold ${
              outlook.changePercent > 0
                ? "text-primary"
                : outlook.changePercent < 0
                  ? "text-destructive"
                  : "text-foreground"
            }`}
          >
            {outlook.changePercent >= 0
              ? "+"
              : ""}
            {outlook.changePercent}%
          </p>

        </div>

        <div className="rounded-2xl bg-muted/40 p-4">

          <p className="text-xs text-muted-foreground">
            Current reference
          </p>

          <p className="mt-1 text-lg font-bold text-foreground">
            ₹
            {formatCurrency(
              current,
            )}
          </p>

        </div>

      </div>

    </div>
  );
}

function SignalCard({
  icon,
  title,
  value,
  text,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 font-bold text-foreground">
            {value}
          </p>

        </div>

      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {text}
      </p>

    </div>
  );
}

function DataQualityItem({
  label,
  available,
}: {
  label: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3">

      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          available
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {available ? (
          <>
            <Check className="h-3 w-3" />
            Available
          </>
        ) : (
          "Not available"
        )}
      </span>

    </div>
  );
}

/* =========================================================
   LABEL HELPERS
========================================================= */

function formatDemandDirection(
  direction:
    | "increasing"
    | "stable"
    | "decreasing"
    | "insufficient_data",
) {
  switch (direction) {
    case "increasing":
      return "Increasing";

    case "decreasing":
      return "Decreasing";

    case "stable":
      return "Stable";

    default:
      return "Insufficient data";
  }
}

function capitalize(
  value: string,
) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
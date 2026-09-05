import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Image as ImageIcon,
  Languages,
  Loader2,
  PackageCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  getCraftDraft,
  publishCraftDraft,
  saveFinalSellingPrice,
  type CraftDraft,
} from "@/lib/craft-draft";

export const Route = createFileRoute("/portal/artisan/upload")({
  component: ArtisanCraftUploadPage,
});

function ArtisanCraftUploadPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<CraftDraft | null>(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [publishing, setPublishing] = useState(false);

  const refreshDraft = () => {
    const nextDraft = getCraftDraft();
    setDraft(nextDraft);
    setSellingPrice(
      nextDraft?.finalSellingPrice
        ? String(nextDraft.finalSellingPrice)
        : "",
    );
  };

  const handleSellingPriceChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value.replace(/\D/g, "");
    setSellingPrice(value);

    const numericValue = Number(value);
    saveFinalSellingPrice(numericValue > 0 ? numericValue : null);
    window.dispatchEvent(new Event("navshakthi:craft-draft-updated"));
  };

  useEffect(() => {
    refreshDraft();

    const handleDraftUpdate = () => refreshDraft();
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "navshakthi_craft_draft_v1" ||
        event.key === "navshakthi_artisan_listings_v1"
      ) {
        refreshDraft();
      }
    };

    window.addEventListener(
      "navshakthi:craft-draft-updated",
      handleDraftUpdate,
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "navshakthi:craft-draft-updated",
        handleDraftUpdate,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const imageReady = Boolean(draft?.image?.enhancedImage);
  const catalogReady = Boolean(draft?.catalog?.english?.title);
  const pricingReady = Boolean(draft?.pricing?.recommended);
  const sellingPriceReady = Boolean(
    draft?.finalSellingPrice && draft.finalSellingPrice > 0,
  );

  const completedSteps = [
    imageReady,
    catalogReady,
    pricingReady,
    sellingPriceReady,
  ].filter(Boolean).length;

  const canPublish =
    imageReady && catalogReady && pricingReady && sellingPriceReady;

  const handlePublish = () => {
    if (!canPublish || publishing) return;

    setPublishing(true);

    const published = publishCraftDraft();

    if (published) {
      navigate({ to: "/portal/artisan" });
    } else {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              AI Craft Publishing Workspace
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Upload & publish your craft
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Bring your work through Image Studio, Multilingual Cataloger and
              Smart Pricing — then review everything before publishing.
            </p>
          </div>

          <div className="rounded-2xl bg-muted/50 px-5 py-4">
            <div className="text-xs font-medium text-muted-foreground">
              Publishing progress
            </div>

            <div className="mt-1 text-2xl font-bold">
              {completedSteps}/4
            </div>

            <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(completedSteps / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <div className="grid gap-6 lg:grid-cols-3">
        <WorkflowStep
          number="01"
          icon={<ImageIcon className="h-5 w-5" />}
          title="AI Image Studio"
          description="Enhance the product image and prepare it for marketplace publishing."
          done={imageReady}
          action={
            <Link
              to="/ai-image-studio"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {imageReady ? "Edit image" : "Open Image Studio"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <WorkflowStep
          number="02"
          icon={<Languages className="h-5 w-5" />}
          title="Multilingual Cataloger"
          description="Turn your voice or product details into marketplace-ready listings."
          done={catalogReady}
          action={
            <Link
              to="/smart-cataloger"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {catalogReady ? "Edit catalog" : "Open Cataloger"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <WorkflowStep
          number="03"
          icon={<CircleDollarSign className="h-5 w-5" />}
          title="Smart Pricing"
          description="Generate a market-aware price range with cost and sustainability checks."
          done={pricingReady}
          action={
            <Link
              to="/smart-pricing"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {pricingReady ? "Edit pricing" : "Open Smart Pricing"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>

      {/* Image Preview */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <SectionHeader
          icon={<ImageIcon className="h-5 w-5" />}
          title="1. Craft image"
          subtitle="Your enhanced image from AI Image Studio."
        />

        {draft?.image?.enhancedImage ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={draft.image.enhancedImage}
                alt="Enhanced craft"
                className="aspect-square h-full w-full object-cover"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Sharpness"
                value={draft.image.afterImageScore?.sharpness ?? "-"}
              />
              <MetricCard
                label="Exposure"
                value={draft.image.afterImageScore?.exposure ?? "-"}
              />
              <MetricCard
                label="Contrast"
                value={draft.image.afterImageScore?.contrast ?? "-"}
              />

              <div className="rounded-2xl bg-muted/50 p-5 sm:col-span-3">
                <div className="text-sm font-semibold">
                  Background processing
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {draft.image.backgroundRemovedPercent}% background
                  improvement detected by the image pipeline.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyModule
            icon={<Upload className="h-6 w-6" />}
            title="No craft image yet"
            description="Start with AI Image Studio to create the visual asset for this listing."
            href="/ai-image-studio"
            button="Upload craft image"
          />
        )}
      </section>

      {/* Catalog */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <SectionHeader
          icon={<Languages className="h-5 w-5" />}
          title="2. AI-generated catalog"
          subtitle="Content generated from your Smart Cataloger workflow."
        />

        {draft?.catalog ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <ListingLanguageCard
                language="English"
                title={draft.catalog.english.title}
                description={draft.catalog.english.description}
                metaDescription={draft.catalog.english.metaDescription}
              />

              <ListingLanguageCard
                language="Hindi"
                title={draft.catalog.hindi.title}
                description={draft.catalog.hindi.description}
                metaDescription={draft.catalog.hindi.metaDescription}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-muted/50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  Detected language
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {draft.catalog.detectedLanguage || "Not provided"}
                </div>
              </div>

              <div className="rounded-2xl bg-muted/50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI confidence
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {Math.round(draft.catalog.confidence * 100)}%
                </div>
              </div>

              <div className="rounded-2xl bg-muted/50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-primary" />
                  SEO keywords
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {draft.catalog.seoKeywords.length > 0 ? (
                    draft.catalog.seoKeywords.slice(0, 8).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Not provided
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-semibold">
                Extracted product attributes
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(draft.catalog.product).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-border p-4"
                    >
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {formatLabel(key)}
                      </div>
                      <div className="mt-1 text-sm font-medium">
                        {value || "Not provided"}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyModule
            icon={<Languages className="h-6 w-6" />}
            title="No catalog generated yet"
            description="Use Smart Cataloger to generate English and Hindi marketplace content."
            href="/smart-cataloger"
            button="Open Smart Cataloger"
          />
        )}
      </section>

      {/* Pricing */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <SectionHeader
          icon={<CircleDollarSign className="h-5 w-5" />}
          title="3. Smart Pricing"
          subtitle="Market benchmark, cost structure and recommended selling price."
        />

        {draft?.pricing ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <PriceCard
                label="Low"
                value={draft.pricing.low}
                description="Lower market position"
              />
              <PriceCard
                label="Recommended"
                value={draft.pricing.recommended}
                description="Suggested sustainable price"
                featured
              />
              <PriceCard
                label="High"
                value={draft.pricing.high}
                description="Premium market position"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <CostItem
                label="Material"
                value={draft.pricing.materialCost}
              />
              <CostItem
                label="Estimated labour"
                value={draft.pricing.estimatedLabourCost}
              />
              <CostItem
                label="Packaging"
                value={draft.pricing.packaging}
              />
              <CostItem
                label="Overhead"
                value={draft.pricing.overhead}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-muted/50 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <PackageCheck className="h-4 w-4 text-primary" />
                  Sustainable floor
                </div>

                <div className="mt-2 text-2xl font-bold">
                  {formatCurrency(draft.pricing.sustainableFloor)}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  Reference floor based on material, labour, packaging and
                  overhead assumptions.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/50 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Market intelligence
                </div>

                {draft.pricing.market ? (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Matched segment
                      </span>
                      <span className="font-medium text-right">
                        {draft.pricing.market.matchLabel}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Market median
                      </span>
                      <span className="font-medium">
                        {formatCurrency(draft.pricing.market.median)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Comparable products
                      </span>
                      <span className="font-medium">
                        {draft.pricing.market.comparableCount}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Demand change
                      </span>
                      <span className="font-medium">
                        {draft.pricing.market.demandChange > 0 ? "+" : ""}
                        {draft.pricing.market.demandChange}%
                      </span>
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground">
                      Source: {draft.pricing.market.sourceLabel}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Market reference not available.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyModule
            icon={<CircleDollarSign className="h-6 w-6" />}
            title="No pricing recommendation yet"
            description="Run Smart Pricing after your product details are ready."
            href="/smart-pricing"
            button="Open Smart Pricing"
          />
        )}
      </section>

      {/* Final Selling Price */}
      <section className="rounded-3xl border border-primary/20 bg-card p-6 shadow-sm md:p-8">
        <SectionHeader
          icon={<CircleDollarSign className="h-5 w-5" />}
          title="4. Set your selling price"
          subtitle="Smart Pricing gives you a recommendation. You decide the final price customers will pay."
        />

        {draft?.pricing ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-muted/50 p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                AI suggested price
              </div>

              <div className="mt-2 text-3xl font-bold">
                {formatCurrency(draft.pricing.recommended)}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                Suggested range{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(draft.pricing.low)} –{" "}
                  {formatCurrency(draft.pricing.high)}
                </span>
              </p>

              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                This is only an AI recommendation based on the available cost
                and market references. It does not automatically become your
                selling price.
              </p>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <label
                htmlFor="artisan-selling-price"
                className="text-sm font-semibold"
              >
                Your Selling Price
              </label>

              <div className="mt-3 flex items-center rounded-2xl border border-border bg-background px-4 py-3 focus-within:border-primary">
                <span className="mr-2 text-lg font-semibold">₹</span>
                <input
                  id="artisan-selling-price"
                  type="text"
                  inputMode="numeric"
                  value={sellingPrice}
                  onChange={handleSellingPriceChange}
                  placeholder="Enter your price"
                  aria-describedby="artisan-selling-price-help"
                  className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-muted-foreground/60"
                />
              </div>

              <p
                id="artisan-selling-price-help"
                className="mt-3 text-sm text-muted-foreground"
              >
                This is the price customers will see on the marketplace.
              </p>

              {sellingPriceReady && (
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Final selling price saved
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-muted/30 p-6 text-sm text-muted-foreground">
            Run Smart Pricing first. Then enter the final price you want
            customers to pay.
          </div>
        )}
      </section>

      {/* Publish */}
      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Ready to publish?
            </div>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review the image, multilingual listing, AI price suggestion and
              your final selling price. The price you enter is the price
              customers will see.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish || publishing}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                Publish craft
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {!canPublish && (
          <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <StatusBadge
              done={imageReady}
              label="AI Image Studio"
            />
            <StatusBadge
              done={catalogReady}
              label="Multilingual Cataloger"
            />
            <StatusBadge
              done={pricingReady}
              label="Smart Pricing"
            />
            <StatusBadge
              done={sellingPriceReady}
              label="Final Selling Price"
            />
          </div>
        )}
      </section>
    </div>
  );
}

function WorkflowStep({
  number,
  icon,
  title,
  description,
  done,
  action,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
  done: boolean;
  action: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>

        {done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready
          </span>
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">
            STEP {number}
          </span>
        )}
      </div>

      <h2 className="mt-5 font-display text-xl font-bold">{title}</h2>

      <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-5">{action}</div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyModule({
  icon,
  title,
  description,
  href,
  button,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  button: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      <Link
        to={href}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {button}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function ListingLanguageCard({
  language,
  title,
  description,
  metaDescription,
}: {
  language: string;
  title: string;
  description: string;
  metaDescription: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
        {language}
      </div>

      <h3 className="mt-3 font-display text-xl font-bold">
        {title || "Not provided"}
      </h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description || "Not provided"}
      </p>

      <div className="mt-4 rounded-xl bg-muted/50 p-3">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Meta description
        </div>
        <div className="mt-1 text-xs leading-5">
          {metaDescription || "Not provided"}
        </div>
      </div>
    </div>
  );
}

function PriceCard({
  label,
  value,
  description,
  featured = false,
}: {
  label: string;
  value: number;
  description: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        featured
          ? "border-primary bg-primary/5"
          : "border-border bg-background"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </div>

      <div className="mt-2 text-3xl font-bold">
        {formatCurrency(value)}
      </div>

      <div className="mt-1 text-xs text-muted-foreground">
        {description}
      </div>
    </div>
  );
}

function CostItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{formatCurrency(value)}</div>
    </div>
  );
}

function StatusBadge({
  done,
  label,
}: {
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-background/70 px-4 py-3">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
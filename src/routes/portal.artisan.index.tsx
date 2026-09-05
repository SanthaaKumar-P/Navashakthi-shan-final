import { useEffect, useState, type ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Package,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  deleteArtisanListing,
  getArtisanListings,
  type CraftDraft,
} from "@/lib/craft-draft";

import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/artisan/")({
  component: ArtisanDashboard,
});

function ArtisanDashboard() {
  const [publishedCrafts, setPublishedCrafts] = useState<CraftDraft[]>([]);

  const refreshListings = () => {
    setPublishedCrafts(getArtisanListings());
  };

  useEffect(() => {
    refreshListings();

    const handlePublished = () => {
      refreshListings();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "navshakthi_artisan_listings_v1") {
        refreshListings();
      }
    };

    window.addEventListener(
      "navshakthi:craft-published",
      handlePublished,
    );

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "navshakthi:craft-published",
        handlePublished,
      );

      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const totalListings = products.length + publishedCrafts.length;

  const handleDelete = (id: string) => {
    deleteArtisanListing(id);
    refreshListings();
  };

  return (
    <div className="space-y-8">
      {/* =========================================================
          HEADER
      ========================================================== */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            வணக்கம், Selvi Ammal.
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Your craft, your dashboard — earnings, orders and government
            support in one glance.
          </p>
        </div>

        <Link
          to="/portal/artisan/upload"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Upload new craft
        </Link>
      </section>

      {/* =========================================================
          STATS
      ========================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Total listings"
          value={totalListings}
          description="Products in your catalog"
        />

        <StatCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          label="AI pricing"
          value={publishedCrafts.length}
          description="AI-assisted craft listings"
        />

        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Published crafts"
          value={publishedCrafts.length}
          description="Ready for marketplace"
        />

        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="AI pipeline"
          value={publishedCrafts.length > 0 ? "Active" : "Ready"}
          description="Image + catalog + pricing"
        />
      </section>

      {/* =========================================================
          AI WORKFLOW
      ========================================================== */}
      <section className="overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              NAVSHAKTHI AI Publishing
            </div>

            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">
              Turn one craft into a marketplace-ready listing
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload your craft image, generate multilingual product content
              and get a market-aware price recommendation — all from one
              workflow.
            </p>
          </div>

          <Link
            to="/portal/artisan/upload"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Start publishing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <PipelineCard
            number="01"
            title="AI Image Studio"
            text="Enhance craft photography"
          />

          <PipelineCard
            number="02"
            title="Multilingual Cataloger"
            text="Generate product listings"
          />

          <PipelineCard
            number="03"
            title="Smart Pricing"
            text="Find a fair price range"
          />
        </div>
      </section>

      {/* =========================================================
          AI PUBLISHED CRAFTS
      ========================================================== */}
      {publishedCrafts.length > 0 && (
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-4 w-4" />
                AI Published
              </div>

              <h2 className="mt-2 font-display text-2xl font-bold">
                Your new craft listings
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Crafts published through the NAVSHAKTHI AI workflow.
              </p>
            </div>

            <Link
              to="/portal/artisan/upload"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Add another craft
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {publishedCrafts.map((craft) => (
              <PublishedCraftCard
                key={craft.id}
                craft={craft}
                onDelete={() => handleDelete(craft.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          EXISTING LISTINGS
      ========================================================== */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">
              My Listings
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your current craft catalog.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="hidden items-center gap-2 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            View marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="divide-y divide-border">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {product.category}
                  </div>

                  <div className="mt-1 truncate font-semibold">
                    {product.name}
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    ₹{product.price.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Active
                  </span>

                  <Link
                    to="/marketplace"
                    className="rounded-full border border-border p-2 text-muted-foreground transition hover:bg-muted"
                    title="View marketplace"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================== */}
      <section className="grid gap-5 md:grid-cols-3">
        <QuickAction
          href="/ai-image-studio"
          icon={<Sparkles className="h-5 w-5" />}
          title="AI Image Studio"
          description="Enhance your craft photography."
        />

        <QuickAction
          href="/smart-cataloger"
          icon={<Package className="h-5 w-5" />}
          title="Smart Cataloger"
          description="Create multilingual product content."
        />

        <QuickAction
          href="/smart-pricing"
          icon={<CircleDollarSign className="h-5 w-5" />}
          title="Smart Pricing"
          description="Get a market-aware price recommendation."
        />
      </section>
    </div>
  );
}

/* ===============================================================
   PUBLISHED CRAFT CARD
================================================================ */

function PublishedCraftCard({
  craft,
  onDelete,
}: {
  craft: CraftDraft;
  onDelete: () => void;
}) {
  const title =
    craft.catalog?.english.title ||
    craft.catalog?.product.productType ||
    craft.catalog?.product.name ||
    "Untitled craft";

  const productType =
    craft.catalog?.product.productType ||
    craft.catalog?.product.category ||
    "Handcrafted product";

  const recommendedPrice = craft.pricing?.recommended;

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {craft.image?.enhancedImage ? (
          <img
            src={craft.image.enhancedImage}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">
          AI Published
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">
          {productType}
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-xl font-bold">
          {title}
        </h3>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">
              Recommended price
            </div>

            <div className="mt-1 text-xl font-bold">
              {recommendedPrice
                ? formatCurrency(recommendedPrice)
                : "Not available"}
            </div>
          </div>

          {craft.catalog?.confidence !== undefined && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                AI confidence
              </div>

              <div className="mt-1 text-sm font-semibold">
                {Math.round(craft.catalog.confidence * 100)}%
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          <Link
            to="/portal/artisan/upload"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Open workspace
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-border p-2.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            title="Delete listing"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ===============================================================
   STAT CARD
================================================================ */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 text-2xl font-bold">{value}</div>

      <div className="mt-1 text-xs text-muted-foreground">
        {description}
      </div>
    </div>
  );
}

/* ===============================================================
   PIPELINE CARD
================================================================ */

function PipelineCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
      <div className="text-xs font-bold text-primary">{number}</div>

      <div className="mt-2 text-sm font-semibold">{title}</div>

      <div className="mt-1 text-xs text-muted-foreground">{text}</div>
    </div>
  );
}

/* ===============================================================
   QUICK ACTION
================================================================ */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>

      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
        Open
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

/* ===============================================================
   CURRENCY
================================================================ */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Edit3,
  Eye,
  Image as ImageIcon,
  Info,
  Mic2,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  PublicPage,
  PageHero,
} from "@/components/public-page";

import type {
  CraftDNA,
  CraftDNAAttribute,
  CraftDNAValueSource,
} from "@/lib/craft-dna/types";

import {
  getCraftDNA as getStoredCraftDNA,
  saveCraftDNA as saveStoredCraftDNA,
} from "@/lib/craft-dna/storage";

import {
  getCraftDraft,
  saveCraftDNA as saveDraftCraftDNA,
} from "@/lib/craft-draft";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type EditableTextKey =
  | "craftCategory"
  | "productType"
  | "material"
  | "primaryColour"
  | "shape"
  | "pattern"
  | "texture"
  | "finish"
  | "decoration"
  | "size"
  | "dimensions"
  | "useCase";

type DNAFieldProps = {
  label: string;
  attribute: CraftDNAAttribute<string>;
  icon?: ReactNode;
  editing: boolean;
  onChange: (value: string) => void;
};

/* -------------------------------------------------------------------------- */
/* Source configuration                                                       */
/* -------------------------------------------------------------------------- */

const SOURCE_LABELS: Record<
  CraftDNAValueSource,
  string
> = {
  image: "Image Intelligence",
  artisan_voice: "Artisan Voice",
  catalog: "Smart Cataloger",
  manual: "Manual Review",
};

const SOURCE_STYLES: Record<
  CraftDNAValueSource,
  string
> = {
  image:
    "border-sky-200 bg-sky-50 text-sky-700",
  artisan_voice:
    "border-violet-200 bg-violet-50 text-violet-700",
  catalog:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  manual:
    "border-amber-200 bg-amber-50 text-amber-700",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function clampConfidence(
  value: number,
) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    1,
    Math.max(0, value),
  );
}

function confidencePercent(
  value: number,
) {
  return Math.round(
    clampConfidence(value) * 100,
  );
}

function confidenceLabel(
  value: number,
) {
  const percent =
    confidencePercent(value);

  if (percent >= 85) {
    return "High confidence";
  }

  if (percent >= 65) {
    return "Medium confidence";
  }

  return "Low confidence";
}

function sourceLabel(
  source: CraftDNAValueSource,
) {
  return (
    SOURCE_LABELS[source] ??
    "Unknown source"
  );
}

function isMissingValue(
  value: string,
) {
  return (
    !value.trim() ||
    value.trim().toLowerCase() ===
      "not provided"
  );
}

/* -------------------------------------------------------------------------- */
/* Attribute Card                                                             */
/* -------------------------------------------------------------------------- */

function AttributeCard({
  label,
  attribute,
  icon,
  editing,
  onChange,
}: DNAFieldProps) {
  const percent =
    confidencePercent(
      attribute.confidence,
    );

  const missing =
    isMissingValue(attribute.value);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
            {icon ?? (
              <Tag className="h-4 w-4" />
            )}
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            {label}
          </p>
        </div>

        {!missing && (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${SOURCE_STYLES[attribute.source]}`}
          >
            {sourceLabel(
              attribute.source,
            )}
          </span>
        )}
      </div>

      {editing ? (
        <input
          type="text"
          value={attribute.value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-500 focus:bg-white"
          placeholder="Enter value"
        />
      ) : (
        <p
          className={`min-h-[42px] text-sm leading-6 ${
            missing
              ? "italic text-stone-400"
              : "font-medium text-stone-900"
          }`}
        >
          {missing
            ? "Not provided"
            : attribute.value}
        </p>
      )}

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            {confidenceLabel(
              attribute.confidence,
            )}
          </span>

          <span className="text-[11px] font-semibold text-stone-600">
            {percent}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-stone-800 transition-all"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* List Attribute Card                                                        */
/* -------------------------------------------------------------------------- */

function ListAttributeCard({
  label,
  values,
  editing,
  onChange,
  confidence,
  source,
}: {
  label: string;
  values: string[];
  editing: boolean;
  onChange: (values: string[]) => void;
  confidence: number;
  source: CraftDNAValueSource;
}) {
  const percent =
    confidencePercent(confidence);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
            <Palette className="h-4 w-4" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            {label}
          </p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${SOURCE_STYLES[source]}`}
        >
          {sourceLabel(source)}
        </span>
      </div>

      {editing ? (
        <input
          type="text"
          value={values.join(", ")}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(",")
                .map((item) =>
                  item.trim(),
                )
                .filter(Boolean),
            )
          }
          className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-900 outline-none focus:border-stone-500 focus:bg-white"
          placeholder="e.g. Red, Gold, Maroon"
        />
      ) : values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700"
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-stone-400">
          Not provided
        </p>
      )}

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            {confidenceLabel(confidence)}
          </span>

          <span className="text-[11px] font-semibold text-stone-600">
            {percent}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-stone-800"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Heading                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
        {eyebrow}
      </p>

      <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

function CraftDNA() {
  const [dna, setDNA] =
    useState<CraftDNA | null>(null);

  const [image, setImage] =
    useState<string | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [draftDNA, setDraftDNA] =
    useState<CraftDNA | null>(null);

  const [saved, setSaved] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* Load DNA                                                                */
  /* ---------------------------------------------------------------------- */

  const loadDNA = () => {
    const draft =
      getCraftDraft();

    /*
     * Shared Craft Draft has priority because it is the
     * common workflow state used by the other modules.
     *
     * Standalone Craft DNA is the fallback.
     */
    const nextDNA =
      draft?.craftDNA ??
      getStoredCraftDNA();

    setDNA(nextDNA);
    setDraftDNA(nextDNA);

    setImage(
      draft?.image?.enhancedImage ??
        draft?.image?.originalImage ??
        null,
    );
  };

  useEffect(() => {
    loadDNA();

    const handleDNAUpdate =
      () => {
        loadDNA();
      };

    const handleDraftUpdate =
      () => {
        loadDNA();
      };

    window.addEventListener(
      "navshakthi:craft-dna-updated",
      handleDNAUpdate,
    );

    window.addEventListener(
      "navshakthi:craft-draft-updated",
      handleDraftUpdate,
    );

    return () => {
      window.removeEventListener(
        "navshakthi:craft-dna-updated",
        handleDNAUpdate,
      );

      window.removeEventListener(
        "navshakthi:craft-draft-updated",
        handleDraftUpdate,
      );
    };
  }, []);

  const workingDNA =
    draftDNA ?? dna;

  const overallConfidence =
    useMemo(() => {
      if (!workingDNA) {
        return 0;
      }

      return confidencePercent(
        workingDNA.overallConfidence,
      );
    }, [workingDNA]);

  /* ---------------------------------------------------------------------- */
  /* Update text attribute                                                  */
  /* ---------------------------------------------------------------------- */

  const updateTextAttribute = (
    key: EditableTextKey,
    value: string,
  ) => {
    setDraftDNA((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: {
          ...current[key],
          value,
        },
      };
    });

    setSaved(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Update secondary colours                                               */
  /* ---------------------------------------------------------------------- */

  const updateSecondaryColours = (
    values: string[],
  ) => {
    setDraftDNA((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        secondaryColours: {
          ...current.secondaryColours,
          value: values,
        },
      };
    });

    setSaved(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Update visual characteristics                                          */
  /* ---------------------------------------------------------------------- */

  const updateVisualCharacteristics = (
    values: string[],
  ) => {
    setDraftDNA((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        visualCharacteristics:
          values,
      };
    });

    setSaved(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Update complexity                                                      */
  /* ---------------------------------------------------------------------- */

  const updateComplexity = (
    value: number,
  ) => {
    setDraftDNA((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        complexity: {
          ...current.complexity,
          value: Math.min(
            100,
            Math.max(0, value),
          ),
        },
      };
    });

    setSaved(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Save DNA                                                                */
  /* ---------------------------------------------------------------------- */

  const handleSave = () => {
    if (!draftDNA) {
      return;
    }

    const updatedDNA: CraftDNA = {
      ...draftDNA,
      updatedAt:
        new Date().toISOString(),
    };

    /*
     * Synchronize BOTH Craft DNA stores.
     */
    const storedDNA =
      saveStoredCraftDNA(
        updatedDNA,
      );

    saveDraftCraftDNA(
      storedDNA,
    );

    setDNA(storedDNA);
    setDraftDNA(storedDNA);

    setEditing(false);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* ---------------------------------------------------------------------- */
  /* Cancel editing                                                         */
  /* ---------------------------------------------------------------------- */

  const cancelEditing = () => {
    setDraftDNA(dna);
    setEditing(false);
    setSaved(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Empty state                                                             */
  /* ---------------------------------------------------------------------- */

  if (!workingDNA) {
    return (
      <PublicPage>
        <PageHero
          eyebrow="Craft Intelligence"
          title="Craft DNA Studio"
          subtitle="Build the structured identity of your craft from visual evidence, artisan knowledge and catalog intelligence."
        />

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
              <Database className="h-7 w-7 text-stone-500" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-stone-950">
              Your Craft DNA has not
              been created yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-500">
              Start with an enhanced craft
              image or use Smart Cataloger.
              NAVSHAKTHI will build a
              structured craft identity that
              can be reused across the
              platform.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/smart-cataloger"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Open Smart Cataloger
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/craft-lab"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
              >
                Open Craft Lab
              </Link>
            </div>
          </div>
        </section>
      </PublicPage>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Main UI                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <PublicPage>
      <PageHero
        eyebrow="Craft Intelligence"
        title="Craft DNA Studio"
        subtitle="A structured identity profile that keeps your craft attributes consistent across cataloging, pricing, planning, marketplace matching and design experimentation."
      />

      <main className="mx-auto max-w-7xl px-6 pb-20">
        {/* PROFILE HEADER */}
        <section className="mb-10">
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-7 lg:p-9">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      Craft Identity Profile
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-stone-950">
                      {workingDNA
                        .productType
                        .value !==
                      "Not provided"
                        ? workingDNA
                            .productType
                            .value
                        : "Your Craft DNA"}
                    </h2>

                    <p className="mt-2 text-sm text-stone-500">
                      {workingDNA
                        .craftCategory
                        .value !==
                      "Not provided"
                        ? workingDNA
                            .craftCategory
                            .value
                        : "Craft category not provided"}
                    </p>
                  </div>

                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftDNA(
                          workingDNA,
                        );
                        setEditing(true);
                        setSaved(false);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
                    >
                      <Edit3 className="h-4 w-4" />
                      Review & Edit
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={
                          cancelEditing
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleSave
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
                      >
                        <Save className="h-4 w-4" />
                        Save DNA
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      DNA Confidence
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-stone-950">
                      {overallConfidence}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Version
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-stone-950">
                      {workingDNA.version}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Updated
                    </p>

                    <p className="mt-2 text-sm font-semibold text-stone-950">
                      {new Date(
                        workingDNA.updatedAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {saved && (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Craft DNA saved and
                    shared across the
                    workflow.
                  </div>
                )}
              </div>

              <div className="relative min-h-[280px] bg-stone-100">
                {image ? (
                  <img
                    src={image}
                    alt="Craft reference used for Craft DNA"
                    className="h-full min-h-[280px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[280px] items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-10 w-10 text-stone-300" />

                      <p className="mt-3 text-sm font-medium text-stone-500">
                        No craft reference
                        image
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur">
                  <Eye className="h-3.5 w-3.5" />
                  Visual reference
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IDENTITY */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="01 · Identity"
            title="Current Craft Identity"
            description="The core identity signals extracted from your craft. These attributes become reusable context for downstream NAVSHAKTHI modules."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AttributeCard
              label="Craft Category"
              attribute={
                workingDNA.craftCategory
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "craftCategory",
                  value,
                )
              }
              icon={
                <Database className="h-4 w-4" />
              }
            />

            <AttributeCard
              label="Product Type"
              attribute={
                workingDNA.productType
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "productType",
                  value,
                )
              }
              icon={
                <Tag className="h-4 w-4" />
              }
            />

            <AttributeCard
              label="Material"
              attribute={
                workingDNA.material
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "material",
                  value,
                )
              }
              icon={
                <Sparkles className="h-4 w-4" />
              }
            />
          </div>
        </section>

        {/* VISUAL ATTRIBUTES */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="02 · Visual Attributes"
            title="What the craft looks like"
            description="Visual characteristics captured as structured attributes rather than free-form descriptions."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AttributeCard
              label="Primary Colour"
              attribute={
                workingDNA.primaryColour
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "primaryColour",
                  value,
                )
              }
              icon={
                <Palette className="h-4 w-4" />
              }
            />

            <ListAttributeCard
              label="Secondary Colours"
              values={
                workingDNA
                  .secondaryColours
                  .value
              }
              editing={editing}
              onChange={
                updateSecondaryColours
              }
              confidence={
                workingDNA
                  .secondaryColours
                  .confidence
              }
              source={
                workingDNA
                  .secondaryColours
                  .source
              }
            />

            <AttributeCard
              label="Shape"
              attribute={
                workingDNA.shape
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "shape",
                  value,
                )
              }
            />

            <AttributeCard
              label="Pattern"
              attribute={
                workingDNA.pattern
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "pattern",
                  value,
                )
              }
            />

            <AttributeCard
              label="Texture"
              attribute={
                workingDNA.texture
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "texture",
                  value,
                )
              }
            />

            <AttributeCard
              label="Finish"
              attribute={
                workingDNA.finish
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "finish",
                  value,
                )
              }
            />

            <AttributeCard
              label="Decoration"
              attribute={
                workingDNA.decoration
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "decoration",
                  value,
                )
              }
            />
          </div>
        </section>

        {/* PRODUCT PROFILE */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="03 · Product Profile"
            title="Production-ready context"
            description="Useful product-level information that can be carried into cataloging, pricing and planning."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AttributeCard
              label="Size"
              attribute={workingDNA.size}
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "size",
                  value,
                )
              }
            />

            <AttributeCard
              label="Dimensions"
              attribute={
                workingDNA.dimensions
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "dimensions",
                  value,
                )
              }
            />

            <AttributeCard
              label="Use Case"
              attribute={
                workingDNA.useCase
              }
              editing={editing}
              onChange={(value) =>
                updateTextAttribute(
                  "useCase",
                  value,
                )
              }
            />

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                  <Sparkles className="h-4 w-4" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  Complexity
                </p>
              </div>

              {editing ? (
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={
                    workingDNA
                      .complexity
                      .value
                  }
                  onChange={(event) =>
                    updateComplexity(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-900 outline-none focus:border-stone-500 focus:bg-white"
                />
              ) : (
                <p className="text-3xl font-semibold text-stone-950">
                  {
                    workingDNA
                      .complexity
                      .value
                  }
                  <span className="ml-1 text-sm font-normal text-stone-400">
                    / 100
                  </span>
                </p>
              )}

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-stone-800"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        workingDNA
                          .complexity
                          .value,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL SIGNATURE */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="04 · Visual Signature"
            title="Visual Characteristics"
            description="Distinctive characteristics that help preserve the visual identity of the craft across future workflows."
          />

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            {editing ? (
              <textarea
                value={workingDNA.visualCharacteristics.join(
                  ", ",
                )}
                onChange={(event) =>
                  updateVisualCharacteristics(
                    event.target.value
                      .split(",")
                      .map((item) =>
                        item.trim(),
                      )
                      .filter(Boolean),
                  )
                }
                rows={4}
                placeholder="Enter visual characteristics separated by commas"
                className="w-full resize-none rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-900 outline-none focus:border-stone-500 focus:bg-white"
              />
            ) : workingDNA
                .visualCharacteristics
                .length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {workingDNA.visualCharacteristics.map(
                  (characteristic) => (
                    <span
                      key={characteristic}
                      className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      {characteristic}
                    </span>
                  ),
                )}
              </div>
            ) : (
              <p className="text-sm italic text-stone-400">
                No visual characteristics
                provided.
              </p>
            )}
          </div>
        </section>

        {/* VERIFICATION */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="05 · Verification"
            title="Re-verify the craft with the artisan"
            description="Visual analysis creates the initial structured identity. Artisan voice can be used as a second evidence layer to confirm or correct those attributes."
          />

          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-950 text-white shadow-sm">
            <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="p-7 lg:p-9">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <Mic2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">
                      Voice Re-verification
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                      Ask the artisan to
                      describe the material,
                      technique, colours,
                      dimensions and other
                      important details. The
                      verification layer compares
                      that evidence against the
                      existing Craft DNA before
                      anything is changed.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Material",
                    "Technique",
                    "Colours",
                    "Dimensions",
                    "Craft details",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-7 lg:pr-9">
                <Link
                  to="/craft-dna-verification"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
                >
                  <Mic2 className="h-4 w-4" />
                  Start Voice Re-verification
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CONNECTED MODULES */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="06 · Connected Intelligence"
            title="One Craft DNA, multiple workflows"
            description="The same structured craft identity can travel through the NAVSHAKTHI ecosystem."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              to="/smart-cataloger"
              className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Database className="h-5 w-5 text-stone-500" />

              <h3 className="mt-4 font-semibold text-stone-950">
                Smart Cataloger
              </h3>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                Convert verified craft
                knowledge into structured
                catalog data.
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-stone-700">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              to="/smart-pricing"
              className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Tag className="h-5 w-5 text-stone-500" />

              <h3 className="mt-4 font-semibold text-stone-950">
                Smart Pricing
              </h3>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                Use consistent material and
                product attributes for pricing
                intelligence.
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-stone-700">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              to="/craft-lab"
              className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Sparkles className="h-5 w-5 text-stone-500" />

              <h3 className="mt-4 font-semibold text-stone-950">
                Craft Lab
              </h3>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                Experiment with new designs
                while retaining the craft
                identity.
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-stone-700">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              to="/reverse-marketplace"
              className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ShieldCheck className="h-5 w-5 text-stone-500" />

              <h3 className="mt-4 font-semibold text-stone-950">
                Reverse Marketplace
              </h3>

              <p className="mt-1 text-xs leading-5 text-stone-500">
                Match your craft
                capabilities against buyer
                requirements.
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-stone-700">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>

        {/* TRANSPARENCY */}
        <section>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />

              <div>
                <h3 className="text-sm font-semibold text-stone-800">
                  How to read Craft DNA
                </h3>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Craft DNA is a structured
                  working profile built from
                  available evidence. Confidence
                  indicates the strength of the
                  underlying attribute signal; it
                  is not a legal certification or
                  guarantee of authenticity.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                Object.entries(
                  SOURCE_LABELS,
                ) as Array<
                  [
                    CraftDNAValueSource,
                    string,
                  ]
                >
              ).map(
                ([source, label]) => (
                  <span
                    key={source}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${SOURCE_STYLES[source]}`}
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>
      </main>
    </PublicPage>
  );
}

/* -------------------------------------------------------------------------- */
/* TanStack Route                                                             */
/* -------------------------------------------------------------------------- */

export const Route = createFileRoute(
  "/craft-dna",
)({
  head: () => ({
    meta: [
      {
        title:
          "Craft DNA Studio — NAVSHAKTHI",
      },
      {
        name: "description",
        content:
          "NAVSHAKTHI Craft DNA Studio — structured craft identity, visual attributes and artisan verification.",
      },
    ],
  }),

  component: CraftDNA,
});
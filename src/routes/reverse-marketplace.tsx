import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  MapPin,
  MessageSquare,
  Package,
  PackagePlus,
  Send,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";

import {
  PublicPage,
  PageHero,
} from "@/components/public-page";
import { Reveal } from "@/components/section";

import {
  getCraftDraft,
} from "@/lib/craft-draft";

import type {
  CraftDNA,
} from "@/lib/craft-dna/types";

import {
  getCraftDNA,
} from "@/lib/craft-dna/storage";

import {
  getTopArtisanMatches,
  type ArtisanMatch,
} from "@/lib/reverse-marketplace/matching";

import {
  calculateCraftOpportunityFit,
  type CraftOpportunityFit,
} from "@/lib/reverse-marketplace/opportunity-fit";

import type {
  ReverseMarketplaceProposal,
  ReverseMarketplaceRequest,
} from "@/lib/reverse-marketplace/types";

import {
  getProposalsForRequest,
  getReverseMarketplaceRequests,
  saveReverseMarketplaceProposal,
  saveReverseMarketplaceRequest,
  UPDATE_EVENT,
} from "@/lib/reverse-marketplace/storage";

type MarketplaceMode =
  | "buyer"
  | "artisan";

type RequirementForm = {
  buyerName: string;
  requirement: string;
  quantity: string;
  budget: string;
  region: string;
  material: string;
  deliveryDate: string;
  notes: string;
};

type ProposalForm = {
  artisanName: string;
  craftName: string;
  proposedPrice: string;
  quantity: string;
  deliveryDate: string;
  message: string;
};

const emptyRequirementForm: RequirementForm =
  {
    buyerName: "",
    requirement: "",
    quantity: "",
    budget: "",
    region: "",
    material: "",
    deliveryDate: "",
    notes: "",
  };

const emptyProposalForm: ProposalForm =
  {
    artisanName: "",
    craftName: "",
    proposedPrice: "",
    quantity: "",
    deliveryDate: "",
    message: "",
  };

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function getStatusLabel(
  status: ReverseMarketplaceRequest["status"],
): string {
  switch (status) {
    case "proposal_received":
      return "Proposal received";

    case "closed":
      return "Closed";

    default:
      return "Open";
  }
}

function getMatchLevelLabel(
  level: ArtisanMatch["level"],
): string {
  switch (level) {
    case "strong":
      return "Strong match";

    case "good":
      return "Good match";

    default:
      return "Possible match";
  }
}

function getOpportunityLevelLabel(
  level: CraftOpportunityFit["level"],
): string {
  switch (level) {
    case "strong":
      return "Strong opportunity";

    case "good":
      return "Good opportunity";

    default:
      return "Possible opportunity";
  }
}

export const Route = createFileRoute(
  "/reverse-marketplace",
)({
  head: () => ({
    meta: [
      {
        title:
          "Reverse Marketplace — NAVSHAKTHI",
      },
      {
        name: "description",
        content:
          "A buyer-led marketplace where craft requirements become opportunities for artisan communities.",
      },
    ],
  }),
  component:
    ReverseMarketplace,
});

function ReverseMarketplace() {
  const [mode, setMode] =
    useState<MarketplaceMode>(
      "buyer",
    );

  const [requests, setRequests] =
    useState<
      ReverseMarketplaceRequest[]
    >([]);

  const [craftDNA, setCraftDNA] =
    useState<CraftDNA | null>(
      null,
    );

  const [
    selectedRequestId,
    setSelectedRequestId,
  ] = useState<string | null>(
    null,
  );

  const [
    showRequirementForm,
    setShowRequirementForm,
  ] = useState(false);

  const [
    proposalRequest,
    setProposalRequest,
  ] =
    useState<ReverseMarketplaceRequest | null>(
      null,
    );

  const [
    viewProposalsRequest,
    setViewProposalsRequest,
  ] =
    useState<ReverseMarketplaceRequest | null>(
      null,
    );

  const [
    requirementForm,
    setRequirementForm,
  ] =
    useState<RequirementForm>(
      emptyRequirementForm,
    );

  const [
    proposalForm,
    setProposalForm,
  ] =
    useState<ProposalForm>(
      emptyProposalForm,
    );

  const [
    isSubmittingRequirement,
    setIsSubmittingRequirement,
  ] = useState(false);

  const [
    isSubmittingProposal,
    setIsSubmittingProposal,
  ] = useState(false);

  const [notice, setNotice] =
    useState<string | null>(
      null,
    );

  const loadRequests = () => {
    setRequests(
      getReverseMarketplaceRequests(),
    );
  };

  /*
   * IMPORTANT:
   *
   * Craft DNA can exist in two places in NAVSHAKTHI:
   *
   * 1. Shared Craft Draft
   * 2. Craft DNA storage
   *
   * The shared draft is preferred because Craft Lab /
   * Smart Cataloger can update the active workflow there.
   */
  const loadCraftDNA = () => {
    const draft =
      getCraftDraft();

    setCraftDNA(
      draft?.craftDNA ??
        getCraftDNA(),
    );
  };

  useEffect(() => {
    loadRequests();
    loadCraftDNA();

    const handleMarketplaceUpdate =
      () => {
        loadRequests();
      };

    const handleCraftDNAUpdate =
      () => {
        loadCraftDNA();
        loadRequests();
      };

    window.addEventListener(
      UPDATE_EVENT,
      handleMarketplaceUpdate,
    );

    window.addEventListener(
      "navshakthi:craft-dna-updated",
      handleCraftDNAUpdate,
    );

    window.addEventListener(
      "navshakthi:craft-draft-updated",
      handleCraftDNAUpdate,
    );

    return () => {
      window.removeEventListener(
        UPDATE_EVENT,
        handleMarketplaceUpdate,
      );

      window.removeEventListener(
        "navshakthi:craft-dna-updated",
        handleCraftDNAUpdate,
      );

      window.removeEventListener(
        "navshakthi:craft-draft-updated",
        handleCraftDNAUpdate,
      );
    };
  }, []);

  const selectedRequest =
    useMemo(
      () =>
        requests.find(
          (request) =>
            request.id ===
            selectedRequestId,
        ) ?? null,
      [
        requests,
        selectedRequestId,
      ],
    );

  const openRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.status !==
            "closed",
        ),
      [requests],
    );

  const handleCreateRequirement =
    (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const quantity =
        Number(
          requirementForm.quantity,
        );

      const budget =
        Number(
          requirementForm.budget,
        );

      if (
        !requirementForm.buyerName.trim() ||
        !requirementForm.requirement.trim() ||
        !requirementForm.region.trim() ||
        !Number.isFinite(
          quantity,
        ) ||
        quantity <= 0 ||
        !Number.isFinite(
          budget,
        ) ||
        budget <= 0
      ) {
        setNotice(
          "Please complete the buyer, requirement, quantity, budget and region fields.",
        );

        return;
      }

      setIsSubmittingRequirement(
        true,
      );

      const now =
        new Date().toISOString();

      const request: ReverseMarketplaceRequest =
        {
          id: crypto.randomUUID(),
          buyerName:
            requirementForm.buyerName.trim(),
          requirement:
            requirementForm.requirement.trim(),
          quantity,
          budget,
          region:
            requirementForm.region.trim(),
          material:
            requirementForm.material.trim() ||
            undefined,
          deliveryDate:
            requirementForm.deliveryDate ||
            undefined,
          notes:
            requirementForm.notes.trim() ||
            undefined,
          status: "open",
          createdAt: now,
          updatedAt: now,
          proposalCount: 0,
          matchedClusterCount: 0,
        };

      saveReverseMarketplaceRequest(
        request,
      );

      setRequirementForm(
        emptyRequirementForm,
      );

      setShowRequirementForm(
        false,
      );

      setIsSubmittingRequirement(
        false,
      );

      setNotice(
        "Requirement posted successfully. It is now visible to artisans.",
      );
    };

  const handleSubmitProposal =
    (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!proposalRequest) {
        return;
      }

      const proposedPrice =
        Number(
          proposalForm.proposedPrice,
        );

      const quantity =
        Number(
          proposalForm.quantity,
        );

      if (
        !proposalForm.artisanName.trim() ||
        !proposalForm.craftName.trim() ||
        !Number.isFinite(
          proposedPrice,
        ) ||
        proposedPrice <= 0 ||
        !Number.isFinite(
          quantity,
        ) ||
        quantity <= 0 ||
        !proposalForm.message.trim()
      ) {
        setNotice(
          "Please complete your artisan, craft, price, quantity and proposal message.",
        );

        return;
      }

      setIsSubmittingProposal(
        true,
      );

      const now =
        new Date().toISOString();

      const proposal: ReverseMarketplaceProposal =
        {
          id: crypto.randomUUID(),
          requestId:
            proposalRequest.id,
          artisanName:
            proposalForm.artisanName.trim(),
          craftName:
            proposalForm.craftName.trim(),
          proposedPrice,
          quantity,
          deliveryDate:
            proposalForm.deliveryDate ||
            undefined,
          message:
            proposalForm.message.trim(),
          status: "submitted",
          createdAt: now,
          updatedAt: now,
        };

      saveReverseMarketplaceProposal(
        proposal,
      );

      setProposalForm(
        emptyProposalForm,
      );

      setProposalRequest(
        null,
      );

      setIsSubmittingProposal(
        false,
      );

      setNotice(
        "Proposal submitted successfully. The buyer can now review it.",
      );
    };

  return (
    <PublicPage>
      <PageHero
        eyebrow="Reverse marketplace"
        title="Buyers post. Villages respond."
        subtitle="Turn real buyer requirements into opportunities for artisan communities. Buyers publish what they need; artisans respond with proposals."
      />

      <section className="container-x pb-20">
        {/* MODE SWITCHER */}
        <div className="-mt-6 relative z-10 mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card p-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setMode(
                  "buyer",
                )
              }
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                mode === "buyer"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Buyer
            </button>

            <button
              type="button"
              onClick={() =>
                setMode(
                  "artisan",
                )
              }
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                mode === "artisan"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Users className="h-4 w-4" />
              Artisan
            </button>
          </div>
        </div>

        {/* NOTICE */}
        {notice && (
          <div className="mx-auto mt-6 flex max-w-4xl items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

            <div className="flex-1">
              {notice}
            </div>

            <button
              type="button"
              onClick={() =>
                setNotice(
                  null,
                )
              }
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =========================
            BUYER WORKSPACE
        ========================== */}
        {mode === "buyer" && (
          <div className="mt-12">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Buyer workspace
                </div>

                <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
                  Post what you need.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Publish a craft requirement and let artisan
                  communities respond with their own production
                  proposal.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRequirementForm(
                    true,
                  )
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <PackagePlus className="h-4 w-4" />
                Post requirement
              </button>
            </div>

            {showRequirementForm && (
              <RequirementFormModal
                form={
                  requirementForm
                }
                setForm={
                  setRequirementForm
                }
                onClose={() =>
                  setShowRequirementForm(
                    false,
                  )
                }
                onSubmit={
                  handleCreateRequirement
                }
                isSubmitting={
                  isSubmittingRequirement
                }
              />
            )}

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {requests.map(
                (
                  request,
                  index,
                ) => (
                  <RequirementCard
                    key={
                      request.id
                    }
                    request={
                      request
                    }
                    index={
                      index
                    }
                    buyerMode
                    craftDNA={
                      craftDNA
                    }
                    onSelect={() =>
                      setSelectedRequestId(
                        selectedRequestId ===
                          request.id
                          ? null
                          : request.id,
                      )
                    }
                    onViewProposals={() =>
                      setViewProposalsRequest(
                        request,
                      )
                    }
                  />
                ),
              )}
            </div>

            {requests.length ===
              0 && (
              <EmptyRequirements />
            )}

            {selectedRequest && (
              <RequirementDetails
                request={
                  selectedRequest
                }
                mode="buyer"
                craftDNA={
                  craftDNA
                }
                onClose={() =>
                  setSelectedRequestId(
                    null,
                  )
                }
                onViewProposals={() =>
                  setViewProposalsRequest(
                    selectedRequest,
                  )
                }
              />
            )}
          </div>
        )}

        {/* =========================
            ARTISAN WORKSPACE
        ========================== */}
        {mode === "artisan" && (
          <div className="mt-12">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Artisan workspace
              </div>

              <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
                Find buyer opportunities.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Review buyer requirements and see how well each
                opportunity fits your Craft DNA before submitting
                a proposal.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {openRequests.map(
                (
                  request,
                  index,
                ) => (
                  <RequirementCard
                    key={
                      request.id
                    }
                    request={
                      request
                    }
                    index={
                      index
                    }
                    buyerMode={false}
                    craftDNA={
                      craftDNA
                    }
                    onSelect={() =>
                      setSelectedRequestId(
                        selectedRequestId ===
                          request.id
                          ? null
                          : request.id,
                      )
                    }
                    onSubmitProposal={() => {
                      setProposalForm(
                        {
                          ...emptyProposalForm,
                          quantity:
                            String(
                              request.quantity,
                            ),
                        },
                      );

                      setProposalRequest(
                        request,
                      );
                    }}
                  />
                ),
              )}
            </div>

            {openRequests.length ===
              0 && (
              <div className="mt-10 rounded-3xl border border-dashed border-border p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 font-display text-2xl">
                  No open requirements
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  New buyer requirements will appear here.
                </p>
              </div>
            )}

            {selectedRequest && (
              <RequirementDetails
                request={
                  selectedRequest
                }
                mode="artisan"
                craftDNA={
                  craftDNA
                }
                onClose={() =>
                  setSelectedRequestId(
                    null,
                  )
                }
                onSubmitProposal={() => {
                  setProposalForm(
                    {
                      ...emptyProposalForm,
                      quantity:
                        String(
                          selectedRequest.quantity,
                        ),
                    },
                  );

                  setProposalRequest(
                    selectedRequest,
                  );
                }}
              />
            )}
          </div>
        )}
      </section>

      {proposalRequest && (
        <ProposalFormModal
          request={
            proposalRequest
          }
          form={
            proposalForm
          }
          setForm={
            setProposalForm
          }
          onClose={() =>
            setProposalRequest(
              null,
            )
          }
          onSubmit={
            handleSubmitProposal
          }
          isSubmitting={
            isSubmittingProposal
          }
        />
      )}

      {viewProposalsRequest && (
        <ProposalListModal
          request={
            viewProposalsRequest
          }
          onClose={() =>
            setViewProposalsRequest(
              null,
            )
          }
        />
      )}
    </PublicPage>
  );
}

/* =========================================================
   REQUIREMENT CARD
========================================================= */

type RequirementCardProps = {
  request: ReverseMarketplaceRequest;
  index: number;
  buyerMode: boolean;
  craftDNA: CraftDNA | null;
  onSelect: () => void;
  onViewProposals?: () => void;
  onSubmitProposal?: () => void;
};

function RequirementCard({
  request,
  index,
  buyerMode,
  craftDNA,
  onSelect,
  onViewProposals,
  onSubmitProposal,
}: RequirementCardProps) {
  /*
   * BUYER:
   * Requirement -> artisan cluster profiles
   *
   * ARTISAN:
   * Requirement -> current user's Craft DNA
   *
   * Personal Craft DNA is intentionally NOT used in
   * buyer-side cluster ranking.
   */

  const buyerMatches =
    useMemo(
      () =>
        buyerMode
          ? getTopArtisanMatches(
              request,
              null,
              3,
            )
          : [],
      [
        buyerMode,
        request,
      ],
    );

  const opportunityFit =
    useMemo(
      () =>
        !buyerMode
          ? calculateCraftOpportunityFit(
              request,
              craftDNA,
            )
          : null,
      [
        buyerMode,
        request,
        craftDNA,
      ],
    );

  return (
    <Reveal delay={index * 0.05}>
      <div className="group rounded-3xl border border-border/60 bg-card p-7 transition hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Buyer
            </div>

            <div className="mt-1 font-display text-2xl text-foreground">
              {request.buyerName}
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            {formatCurrency(
              request.budget,
            )}
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-foreground/90">
          {request.requirement}
        </p>

        <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <span className="inline-flex items-center gap-2">
            <Package className="h-4 w-4" />
            {request.quantity.toLocaleString(
              "en-IN",
            )}{" "}
            units
          </span>

          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {request.region}
          </span>

          {request.material && (
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {request.material}
            </span>
          )}

          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatDate(
              request.deliveryDate,
            )}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-5">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              request.status ===
              "proposal_received"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {getStatusLabel(
              request.status,
            )}
          </span>

          <span className="text-xs text-muted-foreground">
            {request.proposalCount} proposal
            {request.proposalCount ===
            1
              ? ""
              : "s"}
          </span>

          {buyerMode ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {buyerMatches.length} smart matches
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Craft fit
            </span>
          )}
        </div>

        {/* ROLE-SPECIFIC INTELLIGENCE */}
        {buyerMode ? (
          <SmartMatchPanel
            matches={
              buyerMatches
            }
          />
        ) : (
          <CraftOpportunityPanel
            fit={
              opportunityFit ?? {
                score: 0,
                level:
                  "possible",
                reasons: [],
              }
            }
            hasCraftDNA={
              Boolean(craftDNA)
            }
          />
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSelect}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            View details
            <ChevronDown className="h-4 w-4" />
          </button>

          {buyerMode &&
            onViewProposals && (
              <button
                type="button"
                onClick={
                  onViewProposals
                }
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <MessageSquare className="h-4 w-4" />
                View proposals
              </button>
            )}

          {!buyerMode &&
            onSubmitProposal && (
              <button
                type="button"
                onClick={
                  onSubmitProposal
                }
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                Submit proposal
              </button>
            )}
        </div>
      </div>
    </Reveal>
  );
}

/* =========================================================
   BUYER SMART MATCHING
========================================================= */

type SmartMatchPanelProps = {
  matches: ArtisanMatch[];
};

function SmartMatchPanel({
  matches,
}: SmartMatchPanelProps) {
  return (
    <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">
            Smart artisan matching
          </h4>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Ranked from the buyer requirement against artisan
            cluster craft, material, product, region, capacity
            and keyword signals.
          </p>
        </div>
      </div>

      {matches.length ===
      0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-card p-4 text-center text-xs text-muted-foreground">
          No matching artisan clusters found from the current
          prototype profiles.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {matches.map(
            (
              match,
              index,
            ) => (
              <div
                key={
                  match.cluster.id
                }
                className="rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {
                            match
                              .cluster
                              .name
                          }
                        </div>

                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {match.cluster.regions
                            .slice(
                              0,
                              2,
                            )
                            .join(
                              ", ",
                            )}{" "}
                          ·{" "}
                          {match.cluster.craftTypes
                            .slice(
                              0,
                              2,
                            )
                            .join(
                              ", ",
                            )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                          {Math.round(
                            match.score,
                          )}
                          %
                        </span>

                        <span className="hidden rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground sm:inline-flex">
                          {getMatchLevelLabel(
                            match.level,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              match.score,
                            ),
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {match.reasons
                        .filter(
                          (
                            reason,
                          ) =>
                            reason.matched,
                        )
                        .slice(
                          0,
                          4,
                        )
                        .map(
                          (
                            reason,
                          ) => (
                            <span
                              key={`${match.cluster.id}-${reason.signal}`}
                              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                            >
                              <CheckCircle2 className="h-3 w-3 text-primary" />

                              {
                                reason.label
                              }
                            </span>
                          ),
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Prototype matching uses local artisan-cluster profiles.
        It is decision support, not live marketplace allocation.
      </p>
    </div>
  );
}

/* =========================================================
   ARTISAN OPPORTUNITY FIT
========================================================= */

type CraftOpportunityPanelProps = {
  fit: CraftOpportunityFit;
  hasCraftDNA: boolean;
};

function CraftOpportunityPanel({
  fit,
  hasCraftDNA,
}: CraftOpportunityPanelProps) {
  const matchedReasons =
    fit.reasons.filter(
      (reason) =>
        reason.matched,
    );

  return (
    <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/[0.035] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">
              Craft Opportunity Fit
            </h4>

            {hasCraftDNA && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Your Craft DNA
              </span>
            )}
          </div>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            How well this buyer requirement fits your current
            craft profile.
          </p>
        </div>
      </div>

      {!hasCraftDNA ? (
        <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Create your Craft DNA first to calculate a
            personalised opportunity fit.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-semibold text-foreground">
                {Math.round(
                  fit.score,
                )}
                %
              </div>

              <div className="mt-1 text-xs font-semibold text-primary">
                {getOpportunityLevelLabel(
                  fit.level,
                )}
              </div>
            </div>

            <div className="text-right text-[10px] text-muted-foreground">
              Based on your current Craft DNA
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    fit.score,
                  ),
                )}%`,
              }}
            />
          </div>

          <div className="mt-4 space-y-2">
            {matchedReasons.map(
              (reason) => (
                <div
                  key={
                    reason.signal
                  }
                  className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-xs text-muted-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />

                  <span>
                    {reason.label}
                  </span>
                </div>
              ),
            )}
          </div>

          {matchedReasons.length ===
            0 && (
            <div className="mt-4 rounded-xl bg-card p-4 text-center text-xs text-muted-foreground">
              No strong Craft DNA signals were found for this
              requirement.
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Opportunity fit is prototype decision support based on
        available Craft DNA and buyer requirement signals.
      </p>
    </div>
  );
}

/* =========================================================
   REQUIREMENT DETAILS
========================================================= */

type RequirementDetailsProps = {
  request: ReverseMarketplaceRequest;
  mode: MarketplaceMode;
  craftDNA: CraftDNA | null;
  onClose: () => void;
  onViewProposals?: () => void;
  onSubmitProposal?: () => void;
};

function RequirementDetails({
  request,
  mode,
  craftDNA,
  onClose,
  onViewProposals,
  onSubmitProposal,
}: RequirementDetailsProps) {
  const buyerMode =
    mode === "buyer";

  const matches =
    useMemo(
      () =>
        buyerMode
          ? getTopArtisanMatches(
              request,
              null,
              3,
            )
          : [],
      [
        buyerMode,
        request,
      ],
    );

  const opportunityFit =
    useMemo(
      () =>
        !buyerMode
          ? calculateCraftOpportunityFit(
              request,
              craftDNA,
            )
          : null,
      [
        buyerMode,
        request,
        craftDNA,
      ],
    );

  return (
    <div className="mt-8 rounded-3xl border border-border/60 bg-paper p-7">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Requirement details
          </div>

          <h3 className="mt-2 font-display text-2xl text-foreground">
            {request.buyerName}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close requirement details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Requirement
          </div>

          <p className="mt-2 text-sm leading-relaxed">
            {request.requirement}
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Notes
          </div>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {request.notes ??
              "No additional notes provided."}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoBox
          icon={
            <Package className="h-4 w-4" />
          }
          label="Quantity"
          value={`${request.quantity.toLocaleString(
            "en-IN",
          )} units`}
        />

        <InfoBox
          icon={
            <Wallet className="h-4 w-4" />
          }
          label="Budget"
          value={formatCurrency(
            request.budget,
          )}
        />

        <InfoBox
          icon={
            <MapPin className="h-4 w-4" />
          }
          label="Region"
          value={request.region}
        />

        <InfoBox
          icon={
            <CalendarDays className="h-4 w-4" />
          }
          label="Delivery"
          value={formatDate(
            request.deliveryDate,
          )}
        />
      </div>

      <div className="mt-7">
        {buyerMode ? (
          <SmartMatchPanel
            matches={
              matches
            }
          />
        ) : (
          <CraftOpportunityPanel
            fit={
              opportunityFit ?? {
                score: 0,
                level:
                  "possible",
                reasons: [],
              }
            }
            hasCraftDNA={
              Boolean(craftDNA)
            }
          />
        )}
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        {onViewProposals && (
          <button
            type="button"
            onClick={
              onViewProposals
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            View proposals
          </button>
        )}

        {onSubmitProposal && (
          <button
            type="button"
            onClick={
              onSubmitProposal
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Send className="h-4 w-4" />
            Submit proposal
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyRequirements() {
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-border p-12 text-center">
      <Package className="mx-auto h-10 w-10 text-muted-foreground" />

      <h3 className="mt-4 font-display text-2xl">
        No buyer requirements yet
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        Post the first requirement to start the reverse
        marketplace workflow.
      </p>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

type InfoBoxProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function InfoBox({
  icon,
  label,
  value,
}: InfoBoxProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>

      <div className="mt-2 text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   BUYER REQUIREMENT FORM
========================================================= */

type RequirementFormModalProps = {
  form: RequirementForm;
  setForm: Dispatch<
    SetStateAction<RequirementForm>
  >;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
  isSubmitting: boolean;
};

function RequirementFormModal({
  form,
  setForm,
  onClose,
  onSubmit,
  isSubmitting,
}: RequirementFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/60 bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-5 border-b border-border/60 p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Buyer requirement
            </div>

            <h3 className="mt-2 font-display text-3xl">
              Post a craft requirement
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >
          <FormField
            label="Buyer / organisation"
            value={
              form.buyerName
            }
            onChange={(
              value,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  buyerName:
                    value,
                }),
              )
            }
            placeholder="e.g. Fabindia"
            required
          />

          <FormTextArea
            label="What do you need?"
            value={
              form.requirement
            }
            onChange={(
              value,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  requirement:
                    value,
                }),
              )
            }
            placeholder="Describe the craft product, style and requirement..."
            required
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Quantity"
              type="number"
              value={
                form.quantity
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    quantity:
                      value,
                  }),
                )
              }
              placeholder="500"
              required
            />

            <FormField
              label="Budget (₹)"
              type="number"
              value={
                form.budget
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    budget:
                      value,
                  }),
                )
              }
              placeholder="450000"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Region"
              value={
                form.region
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    region:
                      value,
                  }),
                )
              }
              placeholder="Tamil Nadu"
              required
            />

            <FormField
              label="Material"
              value={
                form.material
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    material:
                      value,
                  }),
                )
              }
              placeholder="Mulberry silk"
            />
          </div>

          <FormField
            label="Desired delivery date"
            type="date"
            value={
              form.deliveryDate
            }
            onChange={(
              value,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  deliveryDate:
                    value,
                }),
              )
            }
          />

          <FormTextArea
            label="Additional notes"
            value={
              form.notes
            }
            onChange={(
              value,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  notes:
                    value,
                }),
              )
            }
            placeholder="Quality, packaging, customisation or delivery requirements..."
          />

          <div className="flex justify-end gap-3 border-t border-border/60 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PackagePlus className="h-4 w-4" />

              {isSubmitting
                ? "Posting..."
                : "Post requirement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   ARTISAN PROPOSAL FORM
========================================================= */

type ProposalFormModalProps = {
  request: ReverseMarketplaceRequest;
  form: ProposalForm;
  setForm: Dispatch<
    SetStateAction<ProposalForm>
  >;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
  isSubmitting: boolean;
};

function ProposalFormModal({
  request,
  form,
  setForm,
  onClose,
  onSubmit,
  isSubmitting,
}: ProposalFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/60 bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-5 border-b border-border/60 p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Artisan proposal
            </div>

            <h3 className="mt-2 font-display text-3xl">
              Respond to{" "}
              {request.buyerName}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {request.requirement}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close proposal form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >
          <div className="rounded-2xl bg-muted/50 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoBox
                icon={
                  <Package className="h-4 w-4" />
                }
                label="Required"
                value={`${request.quantity.toLocaleString(
                  "en-IN",
                )} units`}
              />

              <InfoBox
                icon={
                  <Wallet className="h-4 w-4" />
                }
                label="Buyer budget"
                value={formatCurrency(
                  request.budget,
                )}
              />

              <InfoBox
                icon={
                  <MapPin className="h-4 w-4" />
                }
                label="Region"
                value={request.region}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Artisan / cluster name"
              value={
                form.artisanName
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    artisanName:
                      value,
                  }),
                )
              }
              placeholder="e.g. Kanchipuram Weaver Collective"
              required
            />

            <FormField
              label="Craft"
              value={
                form.craftName
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    craftName:
                      value,
                  }),
                )
              }
              placeholder="e.g. Kanchipuram silk weaving"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Your proposed price (₹)"
              type="number"
              value={
                form.proposedPrice
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    proposedPrice:
                      value,
                  }),
                )
              }
              placeholder="420000"
              required
            />

            <FormField
              label="Quantity you can fulfil"
              type="number"
              value={
                form.quantity
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    quantity:
                      value,
                  }),
                )
              }
              placeholder={String(
                request.quantity,
              )}
              required
            />
          </div>

          <FormField
            label="Expected delivery date"
            type="date"
            value={
              form.deliveryDate
            }
            onChange={(
              value,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  deliveryDate:
                    value,
                }),
              )
            }
          />

          <FormTextArea
            label="Proposal message"
            value={
              form.message
            }
            onChange={(
              value,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  message:
                    value,
                }),
              )
            }
            placeholder="Tell the buyer about your craft capability, quality, production capacity and why your proposal fits this requirement..."
            required
          />

          <div className="flex justify-end gap-3 border-t border-border/60 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />

              {isSubmitting
                ? "Submitting..."
                : "Submit proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   PROPOSAL LIST
========================================================= */

type ProposalListModalProps = {
  request: ReverseMarketplaceRequest;
  onClose: () => void;
};

function ProposalListModal({
  request,
  onClose,
}: ProposalListModalProps) {
  const proposals =
    getProposalsForRequest(
      request.id,
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border/60 bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-5 border-b border-border/60 p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Buyer review
            </div>

            <h3 className="mt-2 font-display text-3xl">
              Proposals for{" "}
              {request.buyerName}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {request.requirement}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close proposals"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {proposals.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <MessageSquare className="mx-auto h-9 w-9 text-muted-foreground" />

              <h4 className="mt-4 font-display text-xl">
                No proposals yet
              </h4>

              <p className="mt-2 text-sm text-muted-foreground">
                Artisan proposals will appear here after they
                respond to this requirement.
              </p>
            </div>
          ) : (
            proposals.map(
              (
                proposal,
              ) => (
                <div
                  key={
                    proposal.id
                  }
                  className="rounded-2xl border border-border/60 bg-paper p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="font-display text-xl">
                        {
                          proposal.artisanName
                        }
                      </div>

                      <div className="mt-1 text-sm text-muted-foreground">
                        {
                          proposal.craftName
                        }
                      </div>
                    </div>

                    <div className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                      {
                        proposal.status
                      }
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoBox
                      icon={
                        <Wallet className="h-4 w-4" />
                      }
                      label="Proposed price"
                      value={formatCurrency(
                        proposal.proposedPrice,
                      )}
                    />

                    <InfoBox
                      icon={
                        <Package className="h-4 w-4" />
                      }
                      label="Quantity"
                      value={`${proposal.quantity.toLocaleString(
                        "en-IN",
                      )} units`}
                    />

                    <InfoBox
                      icon={
                        <CalendarDays className="h-4 w-4" />
                      }
                      label="Delivery"
                      value={formatDate(
                        proposal.deliveryDate,
                      )}
                    />
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {
                      proposal.message
                    }
                  </p>
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  type?:
    | "text"
    | "number"
    | "date";
  required?: boolean;
};

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">
        {label}

        {required && (
          <span className="ml-1 text-primary">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        min={
          type === "number"
            ? "1"
            : undefined
        }
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}

/* =========================================================
   FORM TEXT AREA
========================================================= */

type FormTextAreaProps = {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  required?: boolean;
};

function FormTextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: FormTextAreaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">
        {label}

        {required && (
          <span className="ml-1 text-primary">
            *
          </span>
        )}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        rows={4}
        className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}
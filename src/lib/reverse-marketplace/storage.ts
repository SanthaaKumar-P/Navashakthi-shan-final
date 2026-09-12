import type {
  ReverseMarketplaceProposal,
  ReverseMarketplaceRequest,
} from "./types";

const REQUESTS_STORAGE_KEY =
  "navashakthi_reverse_marketplace_requests_v1";

const PROPOSALS_STORAGE_KEY =
  "navashakthi_reverse_marketplace_proposals_v1";

const UPDATE_EVENT =
  "navashakthi:reverse-marketplace-updated";

const DEMO_REQUESTS: ReverseMarketplaceRequest[] = [
  {
    id: "demo-oberoi-terracotta",
    buyerName: "The Oberoi Group",
    requirement:
      "500 hand-thrown terracotta amenity kits for spa suites",
    quantity: 500,
    budget: 450000,
    region: "Gujarat",
    material: "Terracotta",
    deliveryDate: "2026-11-30",
    notes:
      "Bulk hospitality order requiring consistent finishing and packaging.",
    status: "open",
    createdAt: "2026-08-15T09:00:00.000Z",
    updatedAt: "2026-08-15T09:00:00.000Z",
    proposalCount: 0,
    matchedClusterCount: 0,
  },
  {
    id: "demo-fabindia-silk",
    buyerName: "Fabindia",
    requirement:
      "Wholesale order — 1,200 Kanchipuram silk scarves",
    quantity: 1200,
    budget: 2200000,
    region: "Tamil Nadu",
    material: "Kanchipuram silk",
    deliveryDate: "2026-12-15",
    notes:
      "Wholesale requirement with emphasis on traditional weaving and consistent quality.",
    status: "open",
    createdAt: "2026-08-18T09:00:00.000Z",
    updatedAt: "2026-08-18T09:00:00.000Z",
    proposalCount: 0,
    matchedClusterCount: 0,
  },
  {
    id: "demo-google-diyas",
    buyerName: "Google India",
    requirement:
      "Diwali gift set — 800 brass diyas with brand engraving",
    quantity: 800,
    budget: 640000,
    region: "Tamil Nadu",
    material: "Brass",
    deliveryDate: "2026-10-20",
    notes:
      "Corporate gifting requirement with custom engraving.",
    status: "open",
    createdAt: "2026-08-20T09:00:00.000Z",
    updatedAt: "2026-08-20T09:00:00.000Z",
    proposalCount: 0,
    matchedClusterCount: 0,
  },
  {
    id: "demo-kama-jute",
    buyerName: "Kama Ayurveda",
    requirement:
      "3,000 handwoven jute pouches for gift packaging",
    quantity: 3000,
    budget: 270000,
    region: "Assam",
    material: "Jute",
    deliveryDate: "2026-11-10",
    notes:
      "Bulk packaging requirement with a natural handcrafted finish.",
    status: "open",
    createdAt: "2026-08-22T09:00:00.000Z",
    updatedAt: "2026-08-22T09:00:00.000Z",
    proposalCount: 0,
    matchedClusterCount: 0,
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function dispatchUpdate() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(UPDATE_EVENT));
}

function readRequests(): ReverseMarketplaceRequest[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      REQUESTS_STORAGE_KEY,
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as ReverseMarketplaceRequest[];
  } catch {
    return [];
  }
}

function readProposals(): ReverseMarketplaceProposal[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      PROPOSALS_STORAGE_KEY,
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as ReverseMarketplaceProposal[];
  } catch {
    return [];
  }
}

function writeRequests(
  requests: ReverseMarketplaceRequest[],
) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    REQUESTS_STORAGE_KEY,
    JSON.stringify(requests),
  );

  dispatchUpdate();
}

function writeProposals(
  proposals: ReverseMarketplaceProposal[],
) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    PROPOSALS_STORAGE_KEY,
    JSON.stringify(proposals),
  );

  dispatchUpdate();
}

export function getReverseMarketplaceRequests(): ReverseMarketplaceRequest[] {
  const savedRequests = readRequests();

  return [...DEMO_REQUESTS, ...savedRequests];
}

export function getReverseMarketplaceRequest(
  id: string,
): ReverseMarketplaceRequest | null {
  return (
    getReverseMarketplaceRequests().find(
      (request) => request.id === id,
    ) ?? null
  );
}

export function saveReverseMarketplaceRequest(
  request: ReverseMarketplaceRequest,
): ReverseMarketplaceRequest {
  const savedRequests = readRequests();

  const index = savedRequests.findIndex(
    (item) => item.id === request.id,
  );

  if (index >= 0) {
    savedRequests[index] = request;
  } else {
    savedRequests.unshift(request);
  }

  writeRequests(savedRequests);

  return request;
}

export function deleteReverseMarketplaceRequest(
  id: string,
): void {
  const savedRequests = readRequests().filter(
    (request) => request.id !== id,
  );

  writeRequests(savedRequests);

  const remainingProposals = readProposals().filter(
    (proposal) => proposal.requestId !== id,
  );

  writeProposals(remainingProposals);
}

export function getReverseMarketplaceProposals(): ReverseMarketplaceProposal[] {
  return readProposals();
}

export function getProposalsForRequest(
  requestId: string,
): ReverseMarketplaceProposal[] {
  return readProposals().filter(
    (proposal) => proposal.requestId === requestId,
  );
}

export function saveReverseMarketplaceProposal(
  proposal: ReverseMarketplaceProposal,
): ReverseMarketplaceProposal {
  const proposals = readProposals();

  const index = proposals.findIndex(
    (item) => item.id === proposal.id,
  );

  if (index >= 0) {
    proposals[index] = proposal;
  } else {
    proposals.unshift(proposal);
  }

  writeProposals(proposals);

  const request = getReverseMarketplaceRequest(
    proposal.requestId,
  );

  if (request) {
    const proposalCount = getProposalsForRequest(
      proposal.requestId,
    ).length;

    const updatedRequest: ReverseMarketplaceRequest = {
      ...request,
      proposalCount,
      status:
        request.status === "closed"
          ? "closed"
          : proposalCount > 0
            ? "proposal_received"
            : "open",
      updatedAt: new Date().toISOString(),
    };

    if (!request.id.startsWith("demo-")) {
      saveReverseMarketplaceRequest(updatedRequest);
    } else {
      dispatchUpdate();
    }
  }

  return proposal;
}

export function updateReverseMarketplaceProposalStatus(
  proposalId: string,
  status: ReverseMarketplaceProposal["status"],
): ReverseMarketplaceProposal | null {
  const proposals = readProposals();

  const index = proposals.findIndex(
    (proposal) => proposal.id === proposalId,
  );

  if (index < 0) {
    return null;
  }

  const updatedProposal: ReverseMarketplaceProposal = {
    ...proposals[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  proposals[index] = updatedProposal;

  writeProposals(proposals);

  return updatedProposal;
}

export function clearReverseMarketplaceData(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(
    REQUESTS_STORAGE_KEY,
  );

  window.localStorage.removeItem(
    PROPOSALS_STORAGE_KEY,
  );

  dispatchUpdate();
}

export {
  REQUESTS_STORAGE_KEY,
  PROPOSALS_STORAGE_KEY,
  UPDATE_EVENT,
};
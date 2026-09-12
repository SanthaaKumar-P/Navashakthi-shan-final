export type ReverseMarketplaceRequestStatus =
  | "open"
  | "proposal_received"
  | "closed";

export type ReverseMarketplaceProposalStatus =
  | "submitted"
  | "shortlisted"
  | "accepted"
  | "rejected";

export type ReverseMarketplaceRequest = {
  id: string;
  buyerName: string;
  requirement: string;
  quantity: number;
  budget: number;
  region: string;
  material?: string;
  deliveryDate?: string;
  notes?: string;
  status: ReverseMarketplaceRequestStatus;
  createdAt: string;
  updatedAt: string;
  proposalCount: number;
  matchedClusterCount: number;
};

export type ReverseMarketplaceProposal = {
  id: string;
  requestId: string;
  artisanName: string;
  craftName: string;
  proposedPrice: number;
  quantity: number;
  deliveryDate?: string;
  message: string;
  status: ReverseMarketplaceProposalStatus;
  createdAt: string;
  updatedAt: string;
};
export interface Tier {
  name: string;
  chance: number;
  min: number;
  max: number;
}

export interface Campaign {
  id: string;
  seed: string;
  authority: string;
  tokenMint: string;
  packPrice: string;
  totalPacks: number;
  merkleRoot: string;
  status: "PENDING" | "ACTIVE" | "CLOSED";
  publicKey: string | null;
}

export interface PrepareResponse {
  id: string;
  seed: string;
  merkleRoot: number[];
}

export interface ConfirmResponse {
  success: boolean;
  publicKey: string;
}

export interface RevealResponse {
  tokenAmount: string;
  salt: number[];
  proof: number[][];
}

export interface Pack {
  campaignId: string;
  campaignPublicKey: string;
  packIndex: number;
  buyer: string;
  isClaimed: boolean;
}

export interface PrepareRequest {
  authority: string;
  tokenMint: string;
  totalPacks: number;
  packPrice: number;
  tiers: Tier[];
  seed: string; // Required
}

// types/index.ts
export interface RevealResponse {
    tokenAmount: string;
    salt: number[];
    proof: number[][];
    tier: string; // Add tier
  }
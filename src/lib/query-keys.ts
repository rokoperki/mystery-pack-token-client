export const queryKeys = {
  campaigns: {
    all: ["campaigns"] as const,
    one: (id: string) => ["campaigns", id] as const,
  },
  packs: {
    user: (wallet: string) => ["packs", "user", wallet] as const,
    byCampaign: (wallet: string, campaignPda: string) =>
      ["packs", "user", wallet, campaignPda] as const,
  },
};

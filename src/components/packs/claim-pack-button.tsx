// components/packs/claim-pack-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useClaimPack } from "@/hooks/useClaimPack";

interface ClaimPackButtonProps {
  campaignId: string;
  campaignPda: string;
  tokenMint: string;
  packIndex: number;
  onSuccess?: (amount: string, tier?: string) => void;
}

export function ClaimPackButton({
  campaignId,
  campaignPda,
  tokenMint,
  packIndex,
  onSuccess,
}: ClaimPackButtonProps) {
  const { mutate: claimPack, isPending } = useClaimPack();

  const handleClaim = () => {
    claimPack(
      { campaignId, campaignPda, tokenMint, packIndex },
      {
        onSuccess: ({ tokenAmount, tier }) => {
          onSuccess?.(tokenAmount, tier);
        },
      }
    );
  };

  return (
    <Button className="w-full" onClick={handleClaim} loading={isPending}>
      Open Pack
    </Button>
  );
}
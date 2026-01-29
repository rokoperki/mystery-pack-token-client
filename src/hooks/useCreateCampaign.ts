import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { campaignApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { Tier } from "@/types";
import { useProgram } from "./useProgram";
import { getCampaignPda, getVaultPda } from "@/lib/program";

interface CreateCampaignParams {
  tokenMint: string;
  totalPacks: number;
  packPrice: number;
  tiers: Tier[];
}

// hooks/useCreateCampaign.ts
interface CreateCampaignParams {
  tokenMint: string;
  totalPacks: number;
  packPrice: number;
  tiers: Tier[];
  seed: string; // Required
}

export function useCreateCampaign() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tokenMint,
      totalPacks,
      packPrice,
      tiers,
      seed,
    }: CreateCampaignParams) => {
      if (!publicKey || !program) {
        throw new Error("Wallet not connected");
      }

      // 1. Prepare with the provided seed
      const { id, merkleRoot } = await campaignApi.prepare({
        authority: publicKey.toBase58(),
        tokenMint,
        totalPacks,
        packPrice,
        tiers,
        seed, // Pass the seed from frontend
      });

      // 2. Derive PDAs using same seed
      const seedBn = new BN(seed);
      const campaignPda = getCampaignPda(BigInt(seed));
      const vaultPda = getVaultPda(campaignPda);

      // 3. Send transaction
      const signature = await program.methods
        .initializeCampaign(seedBn, merkleRoot, new BN(packPrice), totalPacks)
        .accounts({
          authority: publicKey,
          campaign: campaignPda,
          tokenMint: new PublicKey(tokenMint),
          solVault: vaultPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // 4. Confirm
      await campaignApi.confirm(id, signature);

      return { id, campaignPda: campaignPda.toBase58(), signature };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
}

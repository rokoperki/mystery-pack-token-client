// hooks/useCreateCampaign.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { toast } from "sonner";
import { useProgram } from "./useProgram";
import { campaignApi } from "@/lib/api";
import { getCampaignPda, getVaultPda } from "@/lib/program";
import { queryKeys } from "@/lib/query-keys";
import type { Tier } from "@/types";

interface CreateCampaignParams {
  tokenMint: string;
  totalPacks: number;
  packPrice: number;
  tiers: Tier[];
  seed: string;
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

      const toastId = toast.loading("Creating campaign...");

      try {
        // 1. Prepare
        const { id, merkleRoot } = await campaignApi.prepare({
          authority: publicKey.toBase58(),
          tokenMint,
          totalPacks,
          packPrice,
          tiers,
          seed,
        });

        toast.loading("Waiting for transaction approval...", { id: toastId });

        // 2. Derive PDAs
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

        toast.loading("Confirming transaction...", { id: toastId });

        // 4. Confirm
        await campaignApi.confirm(id, signature);

        toast.success("Campaign created successfully!", { id: toastId });

        return { id, campaignPda: campaignPda.toBase58(), signature };
      } catch (error) {
        toast.error(getErrorMessage(error), { id: toastId });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // User rejected
    if (error.message.includes("User rejected")) {
      return "Transaction cancelled";
    }
    // Insufficient funds
    if (error.message.includes("insufficient")) {
      return "Insufficient SOL balance";
    }
    return error.message;
  }
  return "Something went wrong";
}
// hooks/useClaimPack.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { toast } from "sonner";
import { useProgram } from "./useProgram";
import { campaignApi } from "@/lib/api";
import { getReceiptPda } from "@/lib/program";
import { queryKeys } from "@/lib/query-keys";

interface ClaimPackParams {
  campaignId: string;
  campaignPda: string;
  tokenMint: string;
  packIndex: number;
}

export function useClaimPack() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      campaignPda,
      tokenMint,
      packIndex,
    }: ClaimPackParams) => {
      if (!publicKey || !program) {
        throw new Error("Wallet not connected");
      }

      const toastId = toast.loading("Opening pack...");

      try {
        // 1. Get reveal data
        toast.loading("Getting reveal data...", { id: toastId });

        const { tokenAmount, salt, proof, tier } = await campaignApi.reveal(
          campaignId,
          packIndex,
          publicKey.toBase58()
        );

        // 2. Derive accounts
        const campaign = new PublicKey(campaignPda);
        const mint = new PublicKey(tokenMint);
        const receiptPda = getReceiptPda(campaign, packIndex);
        const buyerAta = getAssociatedTokenAddressSync(mint, publicKey);

        toast.loading("Waiting for approval...", { id: toastId });

        // 3. Send claim transaction
        const signature = await program.methods
          .claimPack(new BN(tokenAmount), salt, proof)
          .accounts({
            campaign,
            receipt: receiptPda,
            buyer: publicKey,
            tokenMint: mint,
            buyerTokenAccount: buyerAta,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .rpc();

        toast.success(`Claimed ${tokenAmount} tokens! 🎉`, { id: toastId });

        return { signature, tokenAmount, tier };
      } catch (error) {
        toast.error(getErrorMessage(error), { id: toastId });
        throw error;
      }
    },
    onSuccess: () => {
      if (publicKey) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.packs.user(publicKey.toBase58()),
        });
      }
    },
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("User rejected")) {
      return "Transaction cancelled";
    }
    if (error.message.includes("insufficient")) {
      return "Insufficient SOL balance";
    }
    if (error.message.includes("AlreadyClaimed")) {
      return "Pack already claimed";
    }
    if (error.message.includes("NotPackOwner")) {
      return "You don't own this pack";
    }
    if (error.message.includes("InvalidProof")) {
      return "Invalid proof - please try again";
    }
    return error.message;
  }
  return "Failed to claim pack";
}
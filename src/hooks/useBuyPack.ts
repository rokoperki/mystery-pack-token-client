// hooks/useBuyPack.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { toast } from "sonner";
import { useProgram } from "./useProgram";
import { getReceiptPda, getVaultPda } from "@/lib/program";
import { queryKeys } from "@/lib/query-keys";

interface BuyPackParams {
  campaignPda: string;
  packsSold: number;
}

export function useBuyPack() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignPda, packsSold }: BuyPackParams) => {
      if (!publicKey || !program) {
        throw new Error("Wallet not connected");
      }

      const toastId = toast.loading("Buying pack...");

      try {
        const campaign = new PublicKey(campaignPda);
        const receiptPda = getReceiptPda(campaign, packsSold);
        const vaultPda = getVaultPda(campaign);

        toast.loading("Waiting for approval...", { id: toastId });

        const signature = await program.methods
          .purchasePack()
          .accounts({
            campaign,
            buyer: publicKey,
            receipt: receiptPda,
            solVault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        toast.success("Pack purchased! 🎁", { id: toastId });

        return { signature, packIndex: packsSold };
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
        queryClient.invalidateQueries({
          queryKey: queryKeys.campaigns.all,
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
    if (error.message.includes("SoldOut")) {
      return "Campaign is sold out";
    }
    if (error.message.includes("CampaignNotActive")) {
      return "Campaign is not active";
    }
    return error.message;
  }
  return "Failed to buy pack";
}
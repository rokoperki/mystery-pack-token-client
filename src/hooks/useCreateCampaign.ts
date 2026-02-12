// hooks/useCreateCampaign.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { toast } from "sonner";
import { campaignApi } from "@/lib/api";
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
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tokenMint,
      totalPacks,
      packPrice,
      tiers,
      seed,
    }: CreateCampaignParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const toastId = toast.loading("Creating campaign...");

      try {
        const { id, transaction: txBase64 } = await campaignApi.prepare({
          authority: publicKey.toBase58(),
          tokenMint,
          totalPacks,
          packPrice,
          tiers,
          seed,
        });

        toast.loading("Waiting for transaction approval...", { id: toastId });

        const tx = Transaction.from(Buffer.from(txBase64, "base64"));
        const signed = await signTransaction(tx);

        toast.loading("Confirming transaction...", { id: toastId });

        const signature = await connection.sendRawTransaction(
          signed.serialize()
        );
        await connection.confirmTransaction(signature, "confirmed");

        await campaignApi.confirm(id, signature);

        toast.success("Campaign created successfully!", { id: toastId });

        return { id, signature };
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
    if (error.message.includes("User rejected")) {
      return "Transaction cancelled";
    }
    if (error.message.includes("insufficient")) {
      return "Insufficient SOL balance";
    }
    return error.message;
  }
  return "Something went wrong";
}

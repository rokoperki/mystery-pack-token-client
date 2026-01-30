// hooks/useWithdrawAdmin.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { toast } from "sonner";
import { useProgram } from "./useProgram";
import { getVaultPda } from "@/lib/program";
import { getErrorMessage } from "@/lib/errors";

interface WithdrawAdminParams {
  campaignPda: string;
  amount: number | null;
}

export function useWithdrawAdmin() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignPda, amount }: WithdrawAdminParams) => {
      if (!publicKey || !program) {
        throw new Error("Wallet not connected");
      }

      const toastId = toast.loading("Withdrawing SOL...");

      try {
        const campaign = new PublicKey(campaignPda);
        const vaultPda = getVaultPda(campaign);

        toast.loading("Waiting for approval...", { id: toastId });

        const withdrawAmount = amount ? new BN(amount) : null;

        const signature = await program.methods
          .withdrawAdmin(withdrawAmount)
          .accounts({
            campaign,
            authority: publicKey,
            solVault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        const amountStr = amount 
          ? `${(amount / 1e9).toFixed(4)} SOL` 
          : "all SOL";
          
        toast.success(`Withdrawn ${amountStr}! 💰`, { id: toastId });

        return { signature };
      } catch (error) {
        toast.error(getErrorMessage(error), { id: toastId });
        throw error;
      }
    },
    onSuccess: (_, { campaignPda }) => {
      // Invalidate vault balance
      queryClient.invalidateQueries({
        queryKey: ["vault-balance", campaignPda],
      });
    },
  });
}
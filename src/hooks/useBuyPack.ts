import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { getReceiptPda, getVaultPda } from '@/lib/program';
import { queryKeys } from '@/lib/query-keys';

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
        throw new Error('Wallet not connected');
      }

      const campaign = new PublicKey(campaignPda);
      const receiptPda = getReceiptPda(campaign, packsSold);
      const vaultPda = getVaultPda(campaign);

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

      return { signature, packIndex: packsSold };
    },
    onSuccess: () => {
      if (publicKey) {
        queryClient.invalidateQueries({ queryKey: queryKeys.packs.user(publicKey.toBase58()) });
      }
    },
  });
}
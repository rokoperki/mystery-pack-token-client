import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from './useProgram';
import { campaignApi } from '@/lib/api';
import { getReceiptPda } from '@/lib/program';
import { queryKeys } from '@/lib/query-keys';

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
    mutationFn: async ({ campaignId, campaignPda, tokenMint, packIndex }: ClaimPackParams) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected');
      }

      // 1. Get reveal data
      const { tokenAmount, salt, proof } = await campaignApi.reveal(
        campaignId,
        packIndex,
        publicKey.toBase58()
      );



      // 2. Derive accounts
      const campaign = new PublicKey(campaignPda);
      const mint = new PublicKey(tokenMint);
      const receiptPda = getReceiptPda(campaign, packIndex);
      const buyerAta = getAssociatedTokenAddressSync(mint, publicKey);

      console.log(campaign.toBase58(), receiptPda.toBase58(), buyerAta.toBase58());

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

      return { signature, tokenAmount };
    },
    onSuccess: () => {
      if (publicKey) {
        queryClient.invalidateQueries({ queryKey: queryKeys.packs.user(publicKey.toBase58()) });
      }
    },
  });
}
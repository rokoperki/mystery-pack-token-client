// hooks/useVaultBalance.ts
import { useQuery } from "@tanstack/react-query";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "@/lib/contsants";

export function useVaultBalance(campaignPda?: string) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["vault-balance", campaignPda],
    queryFn: async (): Promise<number> => {
      if (!campaignPda) return 0;

      // Derive vault PDA: seeds = [b"vault", campaign.key()]
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new PublicKey(campaignPda).toBuffer()],
        PROGRAM_ID
      );

      const balance = await connection.getBalance(vaultPda);

      return balance;
    },
    enabled: !!campaignPda,
    refetchInterval: 10000,
  });
}
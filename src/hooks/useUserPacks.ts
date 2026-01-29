import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { queryKeys } from "@/lib/query-keys";
import type { Pack } from "@/types";
import { PROGRAM_ID } from "@/lib/contsants";

export function useUserPacks(campaignPublicKey?: string) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: campaignPublicKey
      ? queryKeys.packs.byCampaign(
          publicKey?.toBase58() || "",
          campaignPublicKey
        )
      : queryKeys.packs.user(publicKey?.toBase58() || ""),
    queryFn: async (): Promise<Pack[]> => {
      if (!publicKey) return [];

      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { dataSize: 77 },
          {
            memcmp: {
              offset: 33,
              bytes: publicKey.toBase58(),
            },
          },
        ],
      });

      console.log(accounts);

      return accounts.map((account) => {
        const data = account.account.data;
        const campaign = new PublicKey(data.slice(1, 33));
        const buyer = new PublicKey(data.slice(33, 65));
        const packIndex = data.readUInt32LE(65);
        const isClaimed = data[69] === 1;

        console.log({
          campaignId: campaign.toBase58(),
          campaignPublicKey: campaign.toBase58(),
          packIndex,
          buyer: buyer.toBase58(),
          isClaimed,
        });

        return {
          campaignId: campaign.toBase58(),
          campaignPublicKey: campaign.toBase58(),
          packIndex,
          buyer: buyer.toBase58(),
          isClaimed,
        };
      });
    },
    enabled: !!publicKey,
  });
}

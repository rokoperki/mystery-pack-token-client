"use client";

import { useParams } from "next/navigation";
import { useCampaign } from "@/hooks/useCampaign";
import { useUserPacks } from "@/hooks/useUserPacks";
import { PackCard } from "@/components/packs/pack-card";
import { Spinner } from "@/components/ui/spinner";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { CampaignDetails } from "@/components/campaigns/campaign-detauls";
import { BorshAccountsCoder, Idl } from "@coral-xyz/anchor";
import idl from '../../../lib/idl.json';


export default function CampaignPage() {
  const params = useParams();
  const id = params.id as string;
  const { connection } = useConnection();
  const coder = new BorshAccountsCoder(idl as Idl);


  const { data: campaign, isLoading, error } = useCampaign(id);
  const { data: userPacks } = useUserPacks(campaign?.publicKey || undefined);

  const [packsSold, setPacksSold] = useState(0);

  // Fetch on-chain packs sold
  useEffect(() => {
    if (!campaign?.publicKey) return;

    const fetchPacksSold = async () => {
      try {
        const accountInfo = await connection.getAccountInfo(
          new PublicKey(campaign.publicKey!)
        );
        if (accountInfo) {
            const decoded = coder.decode(
                "Campaign",
                accountInfo.data
              );
              
          setPacksSold(decoded.packs_sold);
        }
      } catch (err) {
        console.error("Failed to fetch packs sold:", err);
      }
    };

    fetchPacksSold();
  }, [campaign?.publicKey, connection]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-20 text-red-400">Campaign not found</div>
    );
  }

  const campaignUserPacks = userPacks?.filter(
    (p) => p.campaignPublicKey === campaign.publicKey
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <CampaignDetails campaign={campaign} packsSold={packsSold} />

      {campaignUserPacks && campaignUserPacks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your Packs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {campaignUserPacks.map((pack) => (
              <PackCard
                key={`${pack.campaignPublicKey}-${pack.packIndex}`}
                pack={pack}
                campaignId={campaign.id}
                tokenMint={campaign.tokenMint}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

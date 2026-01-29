'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useUserPacks } from '@/hooks/useUserPacks';
import { useCampaigns } from '@/hooks/useCampaigns';
import { PackCard } from '@/components/packs/pack-card';
import { Spinner } from '@/components/ui/spinner';

export default function MyPacksPage() {
  const { publicKey } = useWallet();
  const { data: packs, isLoading: packsLoading } = useUserPacks();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();


  if (!publicKey) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-zinc-500">
          Please connect your wallet to view your packs
        </p>
      </div>
    );
  }

  if (packsLoading || campaignsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!packs || packs.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">No Packs Yet</h1>
        <p className="text-zinc-500">
          Purchase packs from active campaigns to see them here
        </p>
      </div>
    );
  }

  // Map campaign publicKey to campaign data
  const campaignMap = new Map(
    campaigns?.map((c) => [c.publicKey, c]) || []
  );

  console.log(packs);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Packs</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {packs.map((pack) => {
          const campaign = campaignMap.get(pack.campaignPublicKey);
          if (!campaign) return null;

          return (
            <PackCard
              key={`${pack.campaignPublicKey}-${pack.packIndex}`}
              pack={pack}
              campaignId={campaign.id}
              tokenMint={campaign.tokenMint}
            />
          );
        })}
      </div>
    </div>
  );
}
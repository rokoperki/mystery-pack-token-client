"use client";

import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";

export default function MyCampaigns() {
  const { data: campaigns, isLoading, error } = useCampaigns();
  const { publicKey: loggedWallet } = useWallet();


  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        Failed to load campaigns
      </div>
    );
  }

  const activeCampaigns = campaigns?.filter((c) => c.status === "ACTIVE") || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Active Campaigns</h1>
        <Link href="/campaigns/create">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {activeCampaigns.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No active campaigns yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCampaigns
            .filter((campaign) => campaign.authority === loggedWallet?.toBase58())
            .map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        </div>
      )}
    </div>
  );
}

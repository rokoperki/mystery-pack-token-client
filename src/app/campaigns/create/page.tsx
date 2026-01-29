'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { CreateCampaignForm } from '@/components/campaigns/create-campaign-form';

export default function CreateCampaignPage() {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-zinc-500">
          Please connect your wallet to create a campaign
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CreateCampaignForm />
    </div>
  );
}
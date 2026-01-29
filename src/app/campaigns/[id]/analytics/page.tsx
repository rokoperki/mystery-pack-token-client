// app/campaigns/[id]/analytics/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { campaignApi } from '@/lib/api';
import { useCampaign } from '@/hooks/useCampaign';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { TierBadge } from '@/components/ui/tier-badge';
import { formatSol, formatTokens } from '@/lib/utils';

interface Analytics {
  campaignId: string;
  overview: {
    totalPacks: number;
    packsSold: number;
    packsClaimed: number;
    packsRemaining: number;
    solCollected: string;
    claimRate: string;
  };
  tierBreakdown: Array<{
    tier: string;
    totalPacks: number;
    claimedPacks: number;
    tokensDistributed: string;
  }>;
}

export default function AnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const { publicKey } = useWallet();
  const { data: campaign } = useCampaign(id);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['campaign-analytics', id],
    queryFn: () => campaignApi.getAnalytics(id),
    enabled: !!campaign,
  });

  // Check if user is campaign authority
  const isAuthority = publicKey?.toBase58() === campaign?.authority;

  if (!isAuthority) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-zinc-500">Only the campaign creator can view analytics</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const data = analytics as Analytics;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Campaign Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-zinc-500 text-sm">SOL Collected</p>
            <p className="text-2xl font-bold text-green-400">
              {formatSol(data.overview.solCollected)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-zinc-500 text-sm">Packs Sold</p>
            <p className="text-2xl font-bold">
              {data.overview.packsSold} / {data.overview.totalPacks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-zinc-500 text-sm">Packs Claimed</p>
            <p className="text-2xl font-bold">
              {data.overview.packsClaimed}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-zinc-500 text-sm">Claim Rate</p>
            <p className="text-2xl font-bold">
              {data.overview.claimRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Sales Progress</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">
              {data.overview.packsSold} sold
            </span>
            <span className="text-zinc-400">
              {data.overview.packsRemaining} remaining
            </span>
          </div>
          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{
                width: `${(data.overview.packsSold / data.overview.totalPacks) * 100}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tier Breakdown */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Tier Distribution</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.tierBreakdown.map((tier) => (
              <div
                key={tier.tier}
                className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <TierBadge tier={tier.tier} />
                  <div className="text-sm">
                    <p className="text-white">{tier.totalPacks} packs</p>
                    <p className="text-zinc-500">{tier.claimedPacks} claimed</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-medium">
                    {formatTokens(tier.tokensDistributed)}
                  </p>
                  <p className="text-zinc-500 text-sm">tokens distributed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
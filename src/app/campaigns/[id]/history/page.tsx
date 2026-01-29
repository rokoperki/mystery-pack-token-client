// app/campaigns/[id]/history/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formatAddress, formatTokens } from '@/lib/utils';

interface PackHistory {
  index: number;
  tier: string;
  tokenAmount: string | null;
  buyer: string | null;
  isClaimed: boolean;
  isPurchased: boolean;
}

interface HistoryResponse {
  campaignId: string;
  totalPacks: number;
  packs: PackHistory[];
}

export default function HistoryPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['campaign-history', id],
    queryFn: () => campaignApi.getHistory(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const history = data as HistoryResponse;

  const tierColors: Record<string, string> = {
    common: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    uncommon: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    rare: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    legendary: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pack History</h1>
        <p className="text-zinc-500">
          {history.packs.filter((p) => p.isPurchased).length} / {history.totalPacks} sold
        </p>
      </div>

      <div className="grid gap-2">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm text-zinc-500">
          <span>Pack #</span>
          <span>Tier</span>
          <span>Buyer</span>
          <span>Amount</span>
          <span>Status</span>
        </div>

        {/* Rows */}
        {history.packs.filter(
            (pack) => pack.isPurchased || pack.isClaimed
        ).map((pack) => (
          <Card key={pack.index} className="hover:border-zinc-700 transition-colors">
            <CardContent className="grid grid-cols-5 gap-4 p-4 items-center">
              <span className="font-mono">#{pack.index}</span>
              
              <span className={`px-2 py-1 text-xs rounded-full border w-fit ${tierColors[pack.tier.toLowerCase()] || tierColors.common}`}>
                {pack.tier}
              </span>
              
              <span className="text-sm font-mono">
                {pack.buyer ? formatAddress(pack.buyer) : '-'}
              </span>
              
              <span className="text-sm">
                {pack.isClaimed && pack.tokenAmount
                  ? formatTokens(pack.tokenAmount)
                  : pack.isPurchased
                    ? '🔒 Hidden'
                    : '-'}
              </span>
              
              <span className={`text-xs ${
                pack.isClaimed
                  ? 'text-green-400'
                  : pack.isPurchased
                    ? 'text-yellow-400'
                    : 'text-zinc-500'
              }`}>
                {pack.isClaimed
                  ? 'Claimed'
                  : pack.isPurchased
                    ? 'Purchased'
                    : 'Available'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
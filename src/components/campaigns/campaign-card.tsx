import Link from 'next/link';
import { formatSol, formatAddress } from '@/lib/utils';
import type { Campaign } from '@/types';
import { Card, CardContent } from '../ui/card';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Campaign</h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                campaign.status === 'ACTIVE'
                  ? 'bg-green-500/20 text-green-400'
                  : campaign.status === 'PENDING'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-zinc-500/20 text-zinc-400'
              }`}
            >
              {campaign.status}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Price</span>
              <span className="text-white">{formatSol(campaign.packPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Total Packs</span>
              <span className="text-white">{campaign.totalPacks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Token</span>
              <span className="text-white">{formatAddress(campaign.tokenMint)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
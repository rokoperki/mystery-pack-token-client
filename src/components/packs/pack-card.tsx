'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClaimPackButton } from './claim-pack-button';
import { formatAddress, formatTokens } from '@/lib/utils';
import type { Pack } from '@/types';

interface PackCardProps {
  pack: Pack;
  campaignId: string;
  tokenMint: string;
}

export function PackCard({ pack, campaignId, tokenMint }: PackCardProps) {
  const [claimedAmount, setClaimedAmount] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-sm">Pack #{pack.packIndex}</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              pack.isClaimed || claimedAmount
                ? 'bg-green-500/20 text-green-400'
                : 'bg-purple-500/20 text-purple-400'
            }`}
          >
            {pack.isClaimed || claimedAmount ? 'Claimed' : 'Unopened'}
          </span>
        </div>

        <div className="text-center py-4">
          {pack.isClaimed || claimedAmount ? (
            <div className="space-y-2">
              <span className="text-4xl">🎉</span>
              {claimedAmount && (
                <p className="text-lg font-bold text-green-400">
                  {formatTokens(claimedAmount)} tokens
                </p>
              )}
            </div>
          ) : (
            <span className="text-4xl">🎁</span>
          )}
        </div>

        <div className="text-xs text-zinc-500">
          Campaign: {formatAddress(pack.campaignPublicKey)}
        </div>

        {!pack.isClaimed && !claimedAmount && (
          <ClaimPackButton
            campaignId={campaignId}
            campaignPda={pack.campaignPublicKey}
            tokenMint={tokenMint}
            packIndex={pack.packIndex}
            onSuccess={(amount) => setClaimedAmount(amount)}
          />
        )}
      </CardContent>
    </Card>
  );
}
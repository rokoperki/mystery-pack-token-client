// components/campaigns/tier-distribution.tsx
'use client';

import { TierBadge } from '@/components/ui/tier-badge';

interface Tier {
  name: string;
  chance: number;
  min: number;
  max: number;
}

interface TierDistributionProps {
  tiers: Tier[];
}

export function TierDistribution({ tiers }: TierDistributionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-white">Reward Tiers</h3>
      
      <div className="space-y-2">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <TierBadge tier={tier.name} />
              <span className="text-zinc-400 text-sm">
                {tier.min} - {tier.max} tokens
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${tier.chance * 100}%` }}
                />
              </div>
              <span className="text-sm text-zinc-400 w-12 text-right">
                {(tier.chance * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
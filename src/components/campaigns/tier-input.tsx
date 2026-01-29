'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Tier } from '@/types';

interface TierInputProps {
  tier: Tier;
  onChange: (tier: Tier) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function TierInput({ tier, onChange, onRemove, canRemove }: TierInputProps) {
  return (
    <div className="p-4 bg-zinc-800/50 rounded-lg space-y-3">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Tier name"
          value={tier.name}
          onChange={(e) => onChange({ ...tier, name: e.target.value })}
          className="flex-1"
        />
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            ✕
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Chance (%)"
          type="number"
          min="0"
          max="100"
          step="1"
          value={tier.chance * 100}
          onChange={(e) =>
            onChange({ ...tier, chance: parseFloat(e.target.value) / 100 || 0 })
          }
        />
        <Input
          label="Min Tokens"
          type="number"
          min="0"
          value={tier.min}
          onChange={(e) =>
            onChange({ ...tier, min: parseInt(e.target.value) || 0 })
          }
        />
        <Input
          label="Max Tokens"
          type="number"
          min="0"
          value={tier.max}
          onChange={(e) =>
            onChange({ ...tier, max: parseInt(e.target.value) || 0 })
          }
        />
      </div>
    </div>
  );
}
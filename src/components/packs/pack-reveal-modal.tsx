// components/packs/pack-reveal-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { TierBadge } from '@/components/ui/tier-badge';
import { formatTokens } from '@/lib/utils';

interface PackRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAmount: string;
  tier: string;
}

export function PackRevealModal({ isOpen, onClose, tokenAmount, tier }: PackRevealModalProps) {
  const [stage, setStage] = useState<'opening' | 'revealed'>('opening');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage('opening');
      const timer = setTimeout(() => setStage('revealed'), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full mx-4">
        {stage === 'opening' ? (
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">🎁</div>
            <p className="text-zinc-400">Opening pack...</p>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="text-6xl animate-pulse">🎉</div>
            
            <div className="space-y-2">
              <TierBadge tier={tier} size="lg" />
              <p className="text-3xl font-bold text-white">
                {formatTokens(tokenAmount)}
              </p>
              <p className="text-zinc-400">tokens</p>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Awesome!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { useBuyPack } from '@/hooks/useBuyPack';
import { formatSol } from '@/lib/utils';

interface BuyPackButtonProps {
  campaignPda: string;
  campaignId: string;
  price: string;
}

export function BuyPackButton({ campaignPda, campaignId, price }: BuyPackButtonProps) {
  const { publicKey } = useWallet();
  const { mutate: buyPack, isPending } = useBuyPack();

  const handleBuy = () => {
    buyPack({ campaignPda, campaignId });
  };

  if (!publicKey) {
    return (
      <Button className="w-full" size="lg" disabled>
        Connect Wallet to Buy
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleBuy}
      loading={isPending}
    >
      Buy Pack • {formatSol(price)}
    </Button>
  );
}
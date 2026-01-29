'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/wallet/wallet-button';

export function Header() {
  const { publicKey } = useWallet();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white">
            Mystery Pack
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Campaigns
            </Link>
            {publicKey && (
              <>
                <Link
                  href="/campaigns/create"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Create
                </Link>
                <Link
                  href="/my-packs"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  My Packs
                </Link>
              </>
            )}
          </nav>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
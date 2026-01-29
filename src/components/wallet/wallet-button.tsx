'use client';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export function WalletButton() {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect, connecting } = useWallet();

  const handleClick = () => {
    if (publicKey) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors"
    >
      {connecting
        ? 'Connecting...'
        : publicKey
          ? formatAddress(publicKey.toBase58())
          : 'Connect Wallet'}
    </button>
  );
}
import { useMemo } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '@/lib/program';
import { Wallet } from '@coral-xyz/anchor';

export function useProgram() {
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;
    return getProgram(wallet as Wallet);
  }, [wallet]);

  return program;
}
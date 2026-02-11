import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || 'AM6pwecsQXLf7UViTd6jHxAYDwSXSTNfqcZ5aSjXoKEn'
);

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

export const FEE_RECIPIENT = new PublicKey(
  process.env.NEXT_PUBLIC_FEE_RECIPIENT || '11111111111111111111111111111111'
);
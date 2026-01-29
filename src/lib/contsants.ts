import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || 'FqrPSmUCFpsdERKhasDTAePN4pTsoo5wrJwzdJZiVQpD'
);

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from './idl.json';
import { PROGRAM_ID, RPC_URL } from './contsants';

import { Wallet } from '@coral-xyz/anchor';

export function getProgram(wallet: Wallet) {
  const connection = new Connection(RPC_URL, 'confirmed');

  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  return new Program(idl as Idl, provider as AnchorProvider);
}

export function getCampaignPda(seed: bigint): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('campaign'), bigintToLeBytes(seed)],
    PROGRAM_ID
  );
  return pda;
}

export function getVaultPda(campaignPda: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), campaignPda.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

export function getReceiptPda(campaignPda: PublicKey, packIndex: number): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('receipt'),
      campaignPda.toBuffer(),
      new Uint8Array(new Uint32Array([packIndex]).buffer),
    ],
    PROGRAM_ID
  );
  return pda;
}

function bigintToLeBytes(value: bigint): Buffer {
    const buffer = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
      buffer[i] = Number(value & BigInt(0xff));
      value >>= BigInt(8);
    }
    return buffer;
  }
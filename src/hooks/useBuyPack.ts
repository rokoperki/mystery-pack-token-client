// hooks/useBuyPack.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program, Idl } from "@coral-xyz/anchor";
import {
  Randomness,
  AnchorUtils,
  ON_DEMAND_DEVNET_QUEUE,
  ON_DEMAND_DEVNET_PID,
  asV0Tx,
} from "@switchboard-xyz/on-demand";
import { toast } from "sonner";
import {
  getVaultPda,
  getPurchaseRequestPda,
  getReceiptPda,
} from "@/lib/program";
import { queryKeys } from "@/lib/query-keys";
import { campaignApi } from "@/lib/api";
import { FEE_RECIPIENT } from "@/lib/contsants";
import idl from "@/lib/idl.json";

interface BuyPackParams {
  campaignPda: string;
  campaignId: string;
}

export function useBuyPack() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignPda, campaignId }: BuyPackParams) => {
      if (!publicKey || !signTransaction || !sendTransaction || !anchorWallet) {
        throw new Error("Wallet not connected");
      }

      const toastId = toast.loading("Preparing purchase...");

      try {
        const campaign = new PublicKey(campaignPda);
        const nonce = BigInt(Date.now());
        const rngKp = Keypair.generate();

        const provider = new AnchorProvider(connection, anchorWallet, {
          commitment: "confirmed",
        });

        const switchboardProgram = await AnchorUtils.loadProgramFromProvider(
          provider,
          ON_DEMAND_DEVNET_PID
        );

        const program = new Program(idl as Idl, provider);

        toast.loading("Creating randomness account...", { id: toastId });

        const [randomness, createIx] = await Randomness.create(
          switchboardProgram,
          rngKp,
          ON_DEMAND_DEVNET_QUEUE,
          publicKey
        );

        const createTx = new Transaction().add(createIx);
        const createSig = await sendTransaction(createTx, connection, {
          signers: [rngKp],
        });
        await connection.confirmTransaction(createSig, "confirmed");

        toast.loading("Approve commit transaction...", { id: toastId });

        const commitIx = await randomness.commitIx(ON_DEMAND_DEVNET_QUEUE);

        const purchaseRequestPda = getPurchaseRequestPda(
          campaign,
          publicKey,
          nonce
        );
        const vaultPda = getVaultPda(campaign);

        const commitPurchaseIx = await program.methods
          .commitPurchase(new BN(nonce.toString()))
          .accounts({
            campaign,
            buyer: publicKey,
            purchaseRequest: purchaseRequestPda,
            randomnessAccount: rngKp.publicKey,
            solVault: vaultPda,
            feeRecipient: FEE_RECIPIENT,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        const commitTx = await asV0Tx({
          connection,
          ixs: [commitIx, commitPurchaseIx],
          payer: publicKey,
          signers: [],
          computeUnitPrice: 75_000,
          computeUnitLimitMultiple: 1.3,
        });

        const signedCommitTx = await signTransaction(commitTx);
        const commitSig = await connection.sendRawTransaction(
          signedCommitTx.serialize()
        );
        await connection.confirmTransaction(commitSig, "confirmed");

        toast.loading("Waiting for oracle...", { id: toastId });
        await new Promise((resolve) => setTimeout(resolve, 5000));

        toast.loading("Approve settle transaction...", { id: toastId });

        const revealIx = await randomness.revealIx();
        const receiptPda = getReceiptPda(campaign, publicKey, nonce);

        const settleIx = await program.methods
          .settleRandomness()
          .accounts({
            campaign,
            purchaseRequest: purchaseRequestPda,
            randomnessAccount: rngKp.publicKey,
            buyer: publicKey,
            receipt: receiptPda,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        const settleTx = await asV0Tx({
          connection,
          ixs: [revealIx, settleIx],
          payer: publicKey,
          signers: [],
          computeUnitPrice: 75_000,
          computeUnitLimitMultiple: 1.3,
        });

        const signedSettleTx = await signTransaction(settleTx);
        const settleSig = await connection.sendRawTransaction(
          signedSettleTx.serialize()
        );
        const settleResult = await connection.confirmTransaction(
          settleSig,
          "confirmed"
        );
        if (settleResult.value.err) {
          throw new Error(
            `Settle transaction failed: ${JSON.stringify(
              settleResult.value.err
            )}`
          );
        }

        toast.loading("Recording purchase...", { id: toastId });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const receiptAccount = await connection.getAccountInfo(receiptPda);
        if (!receiptAccount) {
          throw new Error("Receipt account not found after settlement");
        }
        const packIndex = receiptAccount.data.readUInt32LE(65);

        let lastError: unknown;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await campaignApi.purchase(campaignId, {
              buyer: publicKey.toBase58(),
              nonce: nonce.toString(),
              packIndex,
              signature: settleSig,
            });
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            if (attempt < 2) {
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
          }
        }
        if (lastError) throw lastError;

        toast.success("Pack purchased!", { id: toastId });

        return { signature: settleSig, packIndex };
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error), { id: toastId });
        throw error;
      }
    },
    onSuccess: () => {
      if (publicKey) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.packs.user(publicKey.toBase58()),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.campaigns.all,
        });
      }
    },
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("User rejected")) {
      return "Transaction cancelled";
    }
    if (error.message.includes("insufficient")) {
      return "Insufficient SOL balance";
    }
    if (
      error.message.includes("SoldOut") ||
      error.message.includes("NoPacksAvailable")
    ) {
      return "Campaign is sold out";
    }
    if (error.message.includes("CampaignNotActive")) {
      return "Campaign is not active";
    }
    if (error.message.includes("RandomnessNotReady")) {
      return "Randomness not ready yet — please try again";
    }
    return error.message;
  }
  return "Failed to buy pack";
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "../ui/card";
import { TierInput } from "./tier-input";
import { useCreateCampaign } from "@/hooks/useCreateCampaign";
import { getCampaignPda } from "@/lib/program";
import type { Tier } from "@/types";

const DEFAULT_TIERS: Tier[] = [
  { name: "Common", chance: 0.7, min: 50, max: 150 },
  { name: "Uncommon", chance: 0.25, min: 151, max: 400 },
  { name: "Rare", chance: 0.05, min: 401, max: 1000 },
];

export function CreateCampaignForm() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { mutate: createCampaign, isPending } = useCreateCampaign();

  const [tokenName, setTokenName] = useState("Mystery Token");
  const [tokenDecimals, setTokenDecimals] = useState("9");
  const [totalPacks, setTotalPacks] = useState("100");
  const [packPrice, setPackPrice] = useState("0.1");
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "creating">("form");

  const handleAddTier = () => {
    setTiers([...tiers, { name: "", chance: 0, min: 0, max: 0 }]);
  };

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, tier: Tier) => {
    const newTiers = [...tiers];
    newTiers[index] = tier;
    setTiers(newTiers);
  };

  const validateTiers = () => {
    const totalChance = tiers.reduce((sum, t) => sum + t.chance, 0);
    if (Math.abs(totalChance - 1) > 0.001) {
      return "Tier chances must sum to 100%";
    }
    for (const tier of tiers) {
      if (!tier.name) return "All tiers must have a name";
      if (tier.min > tier.max) return "Min must be less than max";
    }
    return null;
  };

  // In CreateCampaignForm - handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    const tierError = validateTiers();
    if (tierError) {
      setError(tierError);
      return;
    }

    setStep("creating");

    try {
      // Generate seed ONCE
      const seed = BigInt(Date.now());
      const campaignPda = getCampaignPda(seed);

      // Create mint keypair
      const mintKeypair = Keypair.generate();
      const decimals = parseInt(tokenDecimals);

      // Get rent exemption
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // Build transaction to create mint with campaign PDA as authority
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          publicKey,
          null,
          TOKEN_PROGRAM_ID
        ),
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          publicKey,
          AuthorityType.MintTokens,
          campaignPda, // This must match the campaign PDA
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      await connection.confirmTransaction(signature, "confirmed");

      const priceInLamports = Math.floor(parseFloat(packPrice) * 1e9);

      // Pass the SAME seed to createCampaign
      createCampaign(
        {
          tokenMint: mintKeypair.publicKey.toBase58(),
          totalPacks: parseInt(totalPacks),
          packPrice: priceInLamports,
          tiers,
          seed: seed.toString(), // IMPORTANT: same seed!
        },
        {
          onSuccess: ({ id }) => {
            router.push(`/campaigns/${id}`);
          },
          onError: (err) => {
            setError(err.message);
            setStep("form");
          },
        }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to create token");
      setStep("form");
    }
  };

  const totalChance = tiers.reduce((sum, t) => sum + t.chance, 0);

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-white">Create Campaign</h1>
        <p className="text-zinc-500 text-sm">
          A new token will be created automatically for your campaign
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-white">Token Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Token Name (for reference)"
                placeholder="Mystery Token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
              />
              <Input
                label="Decimals"
                type="number"
                min="0"
                max="9"
                value={tokenDecimals}
                onChange={(e) => setTokenDecimals(e.target.value)}
              />
            </div>
          </div>

          {/* Pack Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-white">Pack Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Packs"
                type="number"
                min="1"
                value={totalPacks}
                onChange={(e) => setTotalPacks(e.target.value)}
                required
              />
              <Input
                label="Price (SOL)"
                type="number"
                min="0.001"
                step="0.001"
                value={packPrice}
                onChange={(e) => setPackPrice(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Tiers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Reward Tiers</h3>
              <span
                className={`text-sm ${
                  Math.abs(totalChance - 1) < 0.001
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                Total: {(totalChance * 100).toFixed(0)}%
              </span>
            </div>

            {tiers.map((tier, index) => (
              <TierInput
                key={index}
                tier={tier}
                onChange={(t) => handleTierChange(index, t)}
                onRemove={() => handleRemoveTier(index)}
                canRemove={tiers.length > 1}
              />
            ))}

            <Button type="button" variant="outline" onClick={handleAddTier}>
              + Add Tier
            </Button>
          </div>

          {/* Summary */}
          <div className="p-4 bg-zinc-800/50 rounded-lg space-y-2 text-sm">
            <h4 className="font-medium text-white">Summary</h4>
            <div className="flex justify-between text-zinc-400">
              <span>Total Packs</span>
              <span className="text-white">{totalPacks}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Price per Pack</span>
              <span className="text-white">{packPrice} SOL</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Max Revenue</span>
              <span className="text-white">
                {(
                  parseFloat(packPrice || "0") * parseInt(totalPacks || "0")
                ).toFixed(2)}{" "}
                SOL
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isPending || step === "creating"}
            disabled={!publicKey}
          >
            {!publicKey
              ? "Connect Wallet"
              : step === "creating"
              ? "Creating Token & Campaign..."
              : "Create Campaign"}
          </Button>

          {step === "creating" && (
            <p className="text-center text-zinc-500 text-sm">
              Please approve the transactions in your wallet
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { formatSol, formatAddress } from "@/lib/utils";
import type { Campaign } from "@/types";
import { Card, CardHeader, CardContent } from "../ui/card";
import { BuyPackButton } from "../packs/buy-pack-button";
import Link from "next/link";

interface CampaignDetailsProps {
  campaign: Campaign;
  packsSold: number;
}

export function CampaignDetails({ campaign, packsSold }: CampaignDetailsProps) {
  const { publicKey } = useWallet();
  const packsRemaining = campaign.totalPacks - packsSold;
  const isAuthority = publicKey?.toBase58() === campaign.authority;

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-white">Campaign Details</h1>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Price per Pack</p>
            <p className="text-xl font-semibold text-white">
              {formatSol(campaign.packPrice)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Packs Remaining</p>
            <p className="text-xl font-semibold text-white">
              {packsRemaining} / {campaign.totalPacks}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Token Mint</span>
            <span className="text-white font-mono">
              {formatAddress(campaign.tokenMint, 8)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Authority</span>
            <span className="text-white font-mono">
              {formatAddress(campaign.authority, 8)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Status</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                campaign.status === "ACTIVE"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-zinc-500/20 text-zinc-400"
              }`}
            >
              {campaign.status}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Sold</span>
            <span className="text-white">
              {Math.round((packsSold / campaign.totalPacks) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${(packsSold / campaign.totalPacks) * 100}%` }}
            />
          </div>
        </div>

        {/* Links */}
        {campaign.status === "ACTIVE" && (
          <div className="flex gap-4 pt-4 border-t border-zinc-800">
            <Link
              href={`/campaigns/${campaign.id}/history`}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              📋 Pack History
            </Link>

            {isAuthority && (
              <Link
                href={`/campaigns/${campaign.id}/analytics`}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                📊 Analytics
              </Link>
            )}
          </div>
        )}

        {/* Buy Button */}
        {campaign.status === "ACTIVE" &&
          campaign.publicKey &&
          packsRemaining > 0 && (
            <BuyPackButton
              campaignPda={campaign.publicKey}
              packsSold={packsSold}
              price={campaign.packPrice}
            />
          )}

        {packsRemaining === 0 && (
          <div className="text-center py-4 text-zinc-500">Sold Out</div>
        )}
      </CardContent>
    </Card>
  );
}
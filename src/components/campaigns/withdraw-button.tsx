// components/campaigns/withdraw-button.tsx
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWithdrawAdmin } from "@/hooks/useWithdrawAdmin";
import { formatSol } from "@/lib/utils";
import { useVaultBalance } from "@/hooks/useVault";

interface WithdrawButtonProps {
  campaignPda: string;
  authority: string;
}

export function WithdrawButton({ campaignPda, authority }: WithdrawButtonProps) {
  const { publicKey } = useWallet();
  const { mutate: withdraw, isPending } = useWithdrawAdmin();
  const { data: vaultBalance } = useVaultBalance(campaignPda);

  const [amount, setAmount] = useState("");
  const [showInput, setShowInput] = useState(false);

  const isAuthority = publicKey?.toBase58() === authority;

  if (!isAuthority) return null;

  const handleWithdrawAll = () => {
    withdraw({ campaignPda, amount: null });
  };

  const handleWithdrawAmount = () => {
    const lamports = Math.floor(parseFloat(amount) * 1e9);
    withdraw({ campaignPda, amount: lamports });
    setAmount("");
    setShowInput(false);
  };

  return (
    <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Vault Balance</p>
          <p className="text-xl font-bold text-white">
            {formatSol(vaultBalance || 0)}
          </p>
        </div>
      </div>

      {showInput ? (
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Amount in SOL"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleWithdrawAmount}
              loading={isPending}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              Withdraw {amount || "0"} SOL
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowInput(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            onClick={handleWithdrawAll}
            loading={isPending}
            disabled={!vaultBalance || vaultBalance === 0}
            className="flex-1"
          >
            Withdraw All
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowInput(true)}
            disabled={!vaultBalance || vaultBalance === 0}
          >
            Custom Amount
          </Button>
        </div>
      )}
    </div>
  );
}
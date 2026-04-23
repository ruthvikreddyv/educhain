"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    connect({ connector: injected() }); // 👈 pass connector here
  };

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-400/10"
      >
        Connected: {address?.slice(0, 6)}…{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="rounded-full border border-indigo-400/60 px-3 py-1 text-xs text-indigo-200 hover:bg-indigo-400/10 disabled:opacity-60"
    >
      {isPending ? "Connecting..." : "Connect wallet"}
    </button>
  );
}

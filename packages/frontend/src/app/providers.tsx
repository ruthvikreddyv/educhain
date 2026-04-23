"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { localhost } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "@wagmi/connectors";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

export const config = createConfig({  chains: [localhost],
  connectors: [injected()], 
  transports: {
    [localhost.id]: http(rpcUrl),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

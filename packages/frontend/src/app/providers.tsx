"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "@wagmi/connectors";
export const config=createConfig({chains:[sepolia],connectors:[injected()],transports:{[sepolia.id]:http(process.env.NEXT_PUBLIC_RPC_URL||undefined)},ssr:true});
const queryClient=new QueryClient();
export function Providers({children}:{children:React.ReactNode}) {return <WagmiProvider config={config}><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></WagmiProvider>;}

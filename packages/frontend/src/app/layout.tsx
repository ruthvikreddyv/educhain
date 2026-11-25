import type {Metadata} from "next";
import "./globals.css";
import {Providers} from "./providers";
import {WalletButton} from "./WalletButton";
import Link from "next/link";
export const metadata:Metadata={title:"EduChain | Academic credential verification",description:"Document fingerprinting and blockchain registry checks"};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body><Providers><div className="min-h-screen bg-slate-950 text-slate-100"><header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4"><Link href="/" className="text-lg font-bold">EduChain</Link><nav className="flex flex-wrap gap-4 text-sm text-slate-300"><Link href="/upload">Process PDF</Link><Link href="/verify">Verify</Link><Link href="/dashboard">Issuer workspace</Link></nav><WalletButton/></header>{children}</div></Providers></body></html>;}

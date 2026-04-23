import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { WalletButton } from "./WalletButton"; // 👈 add this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduChain",
  description: "Blockchain + AI certificate verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-slate-950 text-slate-100">
            <header className="flex items-center justify-between px-8 py-4">
              <div className="text-sm font-semibold">EduChain</div>
              <WalletButton /> {/* 👈 connect wallet button */}
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

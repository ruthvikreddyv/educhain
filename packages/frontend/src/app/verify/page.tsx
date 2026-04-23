"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReadContract } from "wagmi";
import { certificateRegistryAbi } from "@/lib/CertificateRegistryAbi";
import {
  Shield,
  Search,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Hash,
} from "lucide-react";
import Link from "next/link";

function inputToBytes32(input: string): `0x${string}` {
  const trimmed = input.trim();
  console.log("TRIMMED input:", trimmed, "len:", trimmed.length);

  if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    throw new Error("Expected 64 hex characters for docHash");
  }

  const hex = `0x${trimmed}`;
  console.log("Treating as hex hash:", hex);
  return hex as `0x${string}`;
}

type Status = "idle" | "loading" | "valid" | "revoked" | "not_found";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CERT_REGISTRY_ADDRESS || "";

export default function VerifyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [query, setQuery] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  const { refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: certificateRegistryAbi,
    functionName: "verifyCertificate",
    // args will be provided at refetch time
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    if (!CONTRACT_ADDRESS) {
      alert("Contract address not set in .env.local");
      return;
    }

    try {
      const hash = inputToBytes32(query);

      setStatus("loading");
      setTxHash(null);

      // IMPORTANT: pass args here, not in the hook
const result = await refetch();
      const value = result.data as
        | [boolean, string, string, `0x${string}`]
        | undefined;

      console.log("verifyCertificate result:", value);

      if (!value) {
        setStatus("not_found");
        return;
      }

      const [valid, , , issuer] = value;

      if (issuer === "0x0000000000000000000000000000000000000000") {
        setStatus("not_found");
      } else if (!valid) {
        setStatus("revoked");
      } else {
        setStatus("valid");
      }

      setTxHash("0xLOCALDEMO"); // placeholder
    } catch (err) {
      console.error(err);
      alert(`Error: ${(err as Error).message}`);
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-200 hover:text-white"
        >
          ← Back to home
        </Link>
        <div className="text-sm text-slate-400">EduChain · Verify</div>
      </header>

      {/* Content */}
      <section className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[minmax(0,1.3fr),minmax(0,1fr)]">
          {/* Left: form */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <h1 className="mb-2 text-2xl font-semibold md:text-3xl">
              Verify a credential
            </h1>
            <p className="mb-6 text-sm text-slate-300 md:text-base">
              Enter the credential ID, document hash, or on-chain reference
              provided by the student or issuing institution.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-xs font-medium text-slate-200">
                Credential ID / Document hash
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. 54a19a9... or EDCHN-2025-0001"
                    className="w-full rounded-full border border-white/15 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-indigo-500/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={status === "loading"}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {status === "loading" ? "Checking..." : "Verify"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                In the full system, this will hash the uploaded document and
                compare it against EduChain&apos;s on-chain registry of
                credentials.
              </p>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-300">
              <p className="mb-2 font-semibold text-slate-100">
                How this works
              </p>
              <ul className="list-disc space-y-1 pl-4">
                <li>Compute the document hash or use the issued credential ID.</li>
                <li>Read the credential record from EduChain smart contract.</li>
                <li>Confirm IPFS CID, issuer, and revocation status.</li>
              </ul>
            </div>
          </div>

          {/* Right: status card */}
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl md:p-7">
            <h2 className="mb-4 text-base font-semibold text-slate-100">
              Verification result
            </h2>

            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-2xl border border-dashed border-white/15 bg-black/40 p-4 text-xs text-slate-300"
                >
                  <p className="mb-1 font-semibold text-slate-100">
                    Waiting for a credential to verify
                  </p>
                  <p>
                    Paste a credential ID or hash on the left and click{" "}
                    <span className="font-semibold">Verify</span> to check the
                    on-chain status.
                  </p>
                </motion.div>
              )}

              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex items-center gap-3 rounded-2xl border border-indigo-400/40 bg-indigo-500/10 p-4 text-xs text-indigo-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-300/60">
                    <Shield className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold">
                      Checking credential on-chain...
                    </p>
                    <p>
                      EduChain is querying the registry and validating IPFS and
                      revocation status.
                    </p>
                  </div>
                </motion.div>
              )}

              {status === "valid" && (
                <motion.div
                  key="valid"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-2xl border border-emerald-400/50 bg-emerald-500/10 p-4 text-xs text-emerald-100"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Credential is valid
                      </p>
                      <p className="text-[11px] text-emerald-100/80">
                        Signature, issuer, and on-chain record all match.
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-3 text-[11px]">
                    <div>
                      <p className="text-emerald-200/80">Status</p>
                      <p className="font-semibold text-emerald-100">
                        Active · Not revoked
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200/80">Network</p>
                      <p className="font-semibold text-emerald-100">
                        EduChain Testnet
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200/80">Issuer</p>
                      <p className="font-semibold text-emerald-100">
                        Demo University
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200/80">Holder</p>
                      <p className="font-semibold text-emerald-100">
                        Provided credential owner
                      </p>
                    </div>
                  </div>

                  {txHash && (
                    <div className="mt-2 rounded-xl bg-black/30 p-3 text-[11px]">
                      <p className="mb-1 text-emerald-200/80">
                        Transaction hash
                      </p>
                      <p className="truncate font-mono text-[10px]">
                        {txHash}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-[10px] font-medium underline underline-offset-2 hover:text-emerald-200"
                      >
                        View on block explorer (demo)
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {status === "revoked" && (
                <motion.div
                  key="revoked"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-2xl border border-amber-400/60 bg-amber-500/10 p-4 text-xs text-amber-100"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Credential has been revoked
                      </p>
                      <p className="text-[11px] text-amber-100/80">
                        The issuer marked this credential as revoked on-chain.
                        Do not accept it as valid evidence.
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl border border-amber-400/40 bg-amber-500/5 p-3 text-[11px]">
                    <div>
                      <p className="text-amber-100/80">Status</p>
                      <p className="font-semibold text-amber-50">Revoked</p>
                    </div>
                    <div>
                      <p className="text-amber-100/80">Revoked by</p>
                      <p className="font-semibold text-amber-50">
                        Issuing institution
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-amber-100/80">Reason (example)</p>
                      <p className="font-semibold text-amber-50">
                        Administrative revocation · Demo data
                      </p>
                    </div>
                  </div>

                  {txHash && (
                    <div className="mt-2 rounded-xl bg-black/30 p-3 text-[11px]">
                      <p className="mb-1 text-amber-100/80">
                        Revocation transaction
                      </p>
                      <p className="truncate font-mono text-[10px]">
                        {txHash}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-[10px] font-medium underline underline-offset-2 hover:text-amber-50"
                      >
                        View on block explorer (demo)
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {status === "not_found" && (
                <motion.div
                  key="not_found"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-3xl border border-red-400/60 bg-red-500/10 p-4 text-xs text-red-100"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Credential not found
                      </p>
                      <p className="text-[11px] text-red-100/80">
                        No record matching this ID or hash exists in the EduChain
                        registry.
                      </p>
                    </div>
                  </div>

                  <ul className="list-disc space-y-1 pl-4 text-[11px] text-red-50/90">
                    <li>Check for typos in the credential ID or hash.</li>
                    <li>Confirm that the credential was issued on EduChain.</li>
                    <li>
                      Ask the student or issuer to resend the original verification
                      link.
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}

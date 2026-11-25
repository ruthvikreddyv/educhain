"use client";

import { useState, type FormEvent } from "react";
import { usePublicClient } from "wagmi";
import { certificateRegistryAbi } from "@/lib/CertificateRegistryAbi";
import Link from "next/link";

type Result = { state: "active" | "revoked" | "not_found"; issuer?: string; chainId: number };
const ADDRESS = process.env.NEXT_PUBLIC_CERT_REGISTRY_ADDRESS ?? "";
const CHAIN = process.env.NEXT_PUBLIC_CERT_REGISTRY_CHAIN_ID ?? "";

export default function VerifyPage() {
  const client = usePublicClient();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    setError("");
    const hash = query.trim().replace(/^0x/i, "");
    if (!/^[0-9a-fA-F]{64}$/.test(hash)) {
      setError("Enter the complete 64-character SHA-256 document hash.");
      return;
    }
    if (!client || !/^0x[0-9a-fA-F]{40}$/.test(ADDRESS) || !/^\d+$/.test(CHAIN)) {
      setError("Registry or network configuration is missing. Verification is unavailable.");
      return;
    }
    setLoading(true);
    try {
      const chainId = await client.getChainId();
      if (String(chainId) !== CHAIN) throw new Error("Unexpected registry network.");
      const address = ADDRESS as `0x${string}`;
      const code = await client.getBytecode({ address });
      if (!code || code === "0x") throw new Error("Registry contract is unavailable.");
      const value = await client.readContract({
        address,
        abi: certificateRegistryAbi,
        functionName: "verifyCertificate",
        args: [`0x${hash}` as `0x${string}`],
      }) as readonly [boolean, string, string, `0x${string}`];
      const [active, cid, , issuer] = value;
      if (!cid || /^0x0{40}$/i.test(issuer)) {
        setResult({ state: "not_found", chainId });
      } else {
        setResult({ state: active ? "active" : "revoked", issuer, chainId });
      }
    } catch {
      setError("Registry lookup failed. No verification decision can be made.");
    } finally {
      setLoading(false);
    }
  }

  async function hashFile(file?: File) {
    setResult(null);
    setError("");
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setError("Choose a file smaller than 25 MB.");
      return;
    }
    try {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      setQuery(Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join(""));
    } catch {
      setError("Unable to calculate the document hash.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-5xl justify-between px-6 py-6">
        <Link href="/" className="text-sm text-slate-300 hover:text-white">Back to home</Link>
        <span className="text-sm font-semibold">EduChain</span>
      </header>
      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-12 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-semibold">Check credential registration</h1>
          <p className="mt-3 text-sm text-slate-400">Check an exact document hash against the configured blockchain registry. Registration alone does not prove academic authenticity.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm" htmlFor="hash">SHA-256 document hash</label>
            <input id="hash" value={query} onChange={e => {setQuery(e.target.value);setResult(null);setError("");}} disabled={loading} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 font-mono text-xs" placeholder="64 hexadecimal characters" />
            <label className="block text-sm" htmlFor="file">Or calculate a hash locally from a document</label>
            <input id="file" type="file" disabled={loading} onChange={e => void hashFile(e.target.files?.[0])} className="w-full text-sm text-slate-400" />
            <p className="text-xs text-slate-400">The selected file is not uploaded by this page.</p>
            <button disabled={loading || !query.trim()} className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold disabled:opacity-50" type="submit">{loading ? "Checking registry..." : "Check registry"}</button>
          </form>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6" aria-live="polite">
          <h2 className="text-lg font-semibold">Registry result</h2>
          {error && <p role="alert" className="mt-4 rounded-lg border border-amber-700 p-4 text-sm text-amber-200">{error}</p>}
          {!result && !error && <p className="mt-4 text-sm text-slate-400">{loading ? "Waiting for the blockchain response." : "No registry lookup completed."}</p>}
          {result && <div className="mt-4 space-y-3">
            <p className="text-lg font-semibold">{result.state === "active" ? "Registered and not revoked" : result.state === "revoked" ? "Registered but revoked" : "No matching registration"}</p>
            <p className="text-sm text-slate-400">Chain ID: {result.chainId}</p>
            {result.issuer && <p className="break-all font-mono text-xs text-slate-300">Issuer wallet: {result.issuer}</p>}
            <p className="text-sm text-slate-400">This result does not independently validate the holder, issuer identity, signature, or academic claims.</p>
          </div>}
        </div>
      </section>
    </main>
  );
}

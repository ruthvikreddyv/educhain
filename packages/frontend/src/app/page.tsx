"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, FileText, Brain, Link2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-indigo-900 text-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-purple-600 blur-3xl" />
        <div className="absolute -bottom-40 -right-10 h-96 w-96 rounded-full bg-indigo-600 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="text-2xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            EduChain
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-slate-300">
          <Link href="/upload" className="hover:text-white">
            Upload
          </Link>
          <Link href="/verify" className="hover:text-white">
            Verify
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-24 pt-10 md:flex-row md:items-start md:px-12 md:pt-16">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 text-center md:text-left"
        >
          <p className="mb-4 inline-flex items-center rounded-full bg-white/5 px-4 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/15 backdrop-blur">
            Blockchain · IPFS · NLP
          </p>
          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Academic credentials,
            <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-sky-300 bg-clip-text text-transparent">
              verified on-chain.
            </span>
          </h1>
          <p className="mb-8 max-w-xl text-base text-slate-300 md:text-lg">
            EduChain turns PDFs into tamper-proof, instantly verifiable credentials
            using Ethereum, IPFS, and AI document analysis.
          </p>

          <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
            <Link href="/upload">
              <button className="group inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/40 transition hover:from-indigo-400 hover:to-purple-500 sm:w-auto">
                <FileText className="mr-2 h-5 w-5" />
                Upload certificate
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/verify">
              <button className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-slate-100 backdrop-blur hover:bg-white/10 sm:w-auto">
                <Shield className="mr-2 h-5 w-5" />
                Verify credential
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live Sepolia testnet ready
            </div>
            <div>AI-powered forgery detection</div>
            <div>IPFS decentralized storage</div>
          </div>
        </motion.div>

        {/* Right: feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex-1 grid w-full max-w-md grid-cols-1 gap-4 md:max-w-none md:grid-cols-2"
        >
          {[
            {
              icon: Shield,
              title: "Tamper-proof",
              desc: "Each credential is anchored on Ethereum so any modification is instantly detectable.",
            },
            {
              icon: Brain,
              title: "AI document check",
              desc: "NLP models parse transcripts and flag suspicious layouts or text edits.",
            },
            {
              icon: FileText,
              title: "IPFS storage",
              desc: "Certificates are stored on IPFS with content-addressed CIDs, not centralized servers.",
            },
            {
              icon: Link2,
              title: "One-click verify",
              desc: "Employers and universities can verify authenticity from any device in seconds.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 * i }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm"
            >
              <item.icon className="mb-3 h-6 w-6 text-indigo-300" />
              <h3 className="mb-1 text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-slate-300">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}

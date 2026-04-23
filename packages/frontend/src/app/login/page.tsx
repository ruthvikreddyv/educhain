"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [issuer, setIssuer] = useState("");

  function handleLogin() {
    if (!issuer) return alert("Enter organization name");

    localStorage.setItem("issuer", issuer);
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/40 to-indigo-900 text-white">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <h1 className="text-2xl font-semibold mb-2">
          Issuer Login
        </h1>

        <p className="text-sm text-slate-400 mb-6">
          Login as University / Organization
        </p>

        <input
          type="text"
          placeholder="Enter institution name"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white mb-4 focus:outline-none focus:border-indigo-400"
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 transition"
        >
          Login as Issuer
        </button>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Demo login (no password required)
        </p>
      </motion.div>
    </div>
  );
}
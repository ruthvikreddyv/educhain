"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, FileText, Users } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const issuer =
    typeof window !== "undefined" ? localStorage.getItem("issuer") : null;

  useEffect(() => {
    if (!issuer) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_BASE}/issuer/${issuer}`)
      .then((res) => res.json())
      .then(setData);
  }, [issuer]);

  const filtered = data.filter((item) =>
    item.entities?.student_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-indigo-900 text-white p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
          <p className="text-sm text-slate-400">{issuer}</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("issuer");
            window.location.href = "/";
          }}
          className="bg-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/40 text-sm"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        <StatCard
          icon={FileText}
          label="Certificates Issued"
          value={data.length}
        />

        <StatCard
          icon={ShieldCheck}
          label="Verified On-chain"
          value={data.length}
        />

        <StatCard
          icon={Users}
          label="Students"
          value={new Set(data.map(d => d.entities?.student_name)).size}
        />
      </div>

      {/* SEARCH */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 p-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-400 outline-none"
        />
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="text-center text-slate-400 mt-20">
          No certificates found.
        </div>
      )}

      {/* CARDS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 backdrop-blur-xl hover:border-indigo-400/40 transition"
          >
            {/* NAME */}
            <h2 className="text-lg font-semibold mb-1">
              {item.entities?.student_name}
            </h2>

            {/* DEGREE */}
            <p className="text-sm text-slate-400 mb-3">
              {item.entities?.degree}
            </p>

            {/* HASH */}
            <p className="text-[10px] text-indigo-300 break-all mb-3">
              {item.hash}
            </p>

            {/* META */}
            <div className="flex justify-between items-center text-xs">
              <span className="bg-emerald-500/20 px-2 py-1 rounded text-emerald-300">
                Verified
              </span>

              <span className="text-slate-400">
                {item.entities?.year}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}

/* ---------------- STAT CARD ---------------- */
function StatCard({ icon: Icon, label, value }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-5 w-5 text-indigo-300" />
        <span className="text-sm text-slate-400">{label}</span>
      </div>

      <div className="text-2xl font-bold">{value}</div>
    </motion.div>
  );
}
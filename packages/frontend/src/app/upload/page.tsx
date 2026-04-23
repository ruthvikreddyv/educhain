"use client";

const API_BASE = "http://127.0.0.1:8000";

import { useWriteContract } from "wagmi";
import { certificateRegistryAbi } from "@/lib/CertificateRegistryAbi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Brain, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Step = "idle" | "uploading" | "nlp" | "ready";

/* ---------------- UTILS ---------------- */
function hexToBytes32(hex: string): `0x${string}` {
  if (!hex.startsWith("0x")) hex = "0x" + hex;
  if (hex.length !== 66) throw new Error("docHash must be 32-byte (64 hex chars)");
  return hex as `0x${string}`;
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [docHash, setDocHash] = useState<string | null>(null);

  const [entities, setEntities] = useState<null | {
    student_name: string;
    institution: string;
    degree: string;
    gpa: string;
    year: string;
  }>(null);

  const { writeContractAsync } = useWriteContract();

  /* ---------------- ISSUE FUNCTION ---------------- */
  async function handleIssue() {
    const issuer = localStorage.getItem("issuer");

    if (!issuer || !docHash) {
      alert("Login as issuer first");
      window.location.href = "/login";
      return;
    }

    try {
      await fetch(`${API_BASE}/store-issued`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash: docHash,
          issuer: issuer,
          entities: entities,
        }),
      });

      alert("Certificate Issed Successfully!");
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      alert("Issue failed");
    }
  }

  /* ---------------- UPLOAD ---------------- */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setFileName(file.name);
    setStep("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.ok) {
        alert(data.error || "Upload failed");
        setStep("idle");
        return;
      }

      setDocHash(data.docHashHex || null);
      setEntities(data.entities || null);

      /* -------- ON-CHAIN REGISTER -------- */
      try {
        const address = process.env.NEXT_PUBLIC_CERT_REGISTRY_ADDRESS;
        if (!address || !data.docHashHex) return;

        const bytes32Hash = hexToBytes32(data.docHashHex);
        const ipfsCid = "ipfs://placeholder";
        const studentId = data.credentialId || "unknown";

        await writeContractAsync({
          address: address as `0x${string}`,
          abi: certificateRegistryAbi,
          functionName: "registerCertificate",
          args: [bytes32Hash, ipfsCid, studentId],
        });
      } catch (err: any) {
        if (err?.name === "ConnectorNotConnectedError") {
          console.warn("Wallet not connected — skipping on-chain step.");
        } else {
          console.error("On-chain register failed:", err);
        }
      }

      /* -------- REALISTIC PIPELINE FLOW -------- */
      await new Promise((r) => setTimeout(r, 500));
      setStep("nlp");

      await new Promise((r) => setTimeout(r, 800));
      setStep("ready");

    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
      setStep("idle");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-indigo-900 text-white flex flex-col">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="text-sm font-semibold text-slate-200 hover:text-white">
          ← Back to home
        </Link>
        <div className="text-sm text-slate-400">EduChain · Upload</div>
      </header>

      {/* CONTENT */}
      <section className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">

          {/* UPLOAD BOX */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <h1 className="mb-2 text-2xl font-semibold md:text-3xl">
              Upload academic certificate
            </h1>

            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-center">
              <UploadCloud className="mb-3 h-10 w-10 text-indigo-300" />
              <p className="mb-1 text-sm font-medium">
                Click to choose a PDF or drop it here
              </p>

              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <AnimatePresence>
              {fileName && (
                <motion.div className="mt-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-300" />
                  <div>
                    <div className="font-medium">{fileName}</div>
                    {docHash && (
                      <div className="text-[11px] text-indigo-300 break-all">
                        Hash: {docHash}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🔥 PROCESSING STATUS (FIXED) */}
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-100">
              Processing status
            </h2>

            <ul className="space-y-4">

              <StatusItem
                done={step !== "idle"}
                icon={FileText}
                title="PDF uploaded"
                body="File received and queued for processing."
              />

              <StatusItem
                done={step === "nlp" || step === "ready"}
                icon={FileText}
                title="Content extracted"
                body="Text successfully extracted from PDF."
              />

              <StatusItem
                done={step === "nlp" || step === "ready"}
                icon={Brain}
                title="Document parsed"
                body="Key academic fields identified and structured."
              />

              <StatusItem
                done={step === "ready"}
                icon={ShieldCheck}
                title="Fingerprint generated"
                body="SHA-256 hash created for integrity verification."
              />

              <StatusItem
                done={step === "ready"}
                icon={CheckCircle2}
                title="Ready for issuance/verification"
                body="Document is ready to be issued/verified₹ on blockchain."
              />

            </ul>
          </div>

          {/* NLP DATA */}
          {entities && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5 text-sm">
              <h3 className="mb-3 text-base font-semibold text-slate-100">
                Extracted data (NLP)
              </h3>

              <p>Name: {entities.student_name}</p>
              <p>Institution: {entities.institution}</p>
              <p>Degree: {entities.degree}</p>
              <p>GPA: {entities.gpa}</p>
              <p>Year: {entities.year}</p>

              {step === "ready" && docHash && (
                <button
                  onClick={handleIssue}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold hover:bg-indigo-500"
                >
                  Issue Certificate
                </button>
              )}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}

/* ---------------- STATUS ITEM ---------------- */
function StatusItem({
  done,
  icon: Icon,
  title,
  body,
}: {
  done: boolean;
  icon: any;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <div
        className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full border 
        ${
          done
            ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
            : "border-white/15 bg-black/40 text-slate-400"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-100">
          {title}
        </div>
        <div className="text-[11px] text-slate-400">
          {body}
        </div>
      </div>
    </li>
  );
}
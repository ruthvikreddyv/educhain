"use client"

import { useState } from "react"

export default function OrgIssuePage() {

  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)

  const issueCertificate = async () => {

    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData
    })

    const data = await res.json()
    setResult(data)
  }

  return (
    <div style={{padding:40}}>

      <h1>Institution Certificate Issuer</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e)=>setFile(e.target.files?.[0] || null)}
      />

      <br/><br/>

      <button onClick={issueCertificate}>
        Issue Certificate
      </button>

      {result && (
        <div style={{marginTop:30}}>

          <h3>Credential Issued</h3>

          <p><b>ID:</b> {result.credentialId}</p>
          <p><b>Hash:</b> {result.docHashHex}</p>
          <p><b>IPFS CID:</b> {result.ipfsCid}</p>
          <p><b>Blockchain TX:</b> {result.blockchainTx}</p>

        </div>
      )}

    </div>
  )
}
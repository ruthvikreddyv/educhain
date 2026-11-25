"use client";
import {useState} from "react";
import Link from "next/link";
import {createPublicClient, createWalletClient, custom, http, isAddress, type Address, type Hex, type EIP1193Provider} from "viem";
import {sepolia} from "viem/chains";
import {certificateRegistryAbi} from "@/lib/CertificateRegistryAbi";
type Result={docHashHex:string;credentialId:string;entities:Record<string,string|null>;textExtracted:boolean};
export default function UploadPage(){
 const [data,setData]=useState<Result|null>(null),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[cid,setCid]=useState(""),[reference,setReference]=useState(""),[tx,setTx]=useState(""),[consent,setConsent]=useState(false);
 const address=process.env.NEXT_PUBLIC_CERT_REGISTRY_ADDRESS||"";
 async function process(){
  if(!file||!consent)return;
  setBusy(true);setError("");setData(null);setTx("");
  try{const form=new FormData();form.append("file",file);const res=await fetch("/api/process",{method:"POST",body:form});const body=await res.json();if(!res.ok||!body.ok)throw new Error(typeof body.detail==="string"?body.detail:"Document processing failed.");setData(body);}
  catch(e){setError(e instanceof Error?e.message:"Processing failed.");}finally{setBusy(false);}
 }
 async function issue(){
  if(!data||!isAddress(address)||!cid.trim()||!reference.trim())return;
  setBusy(true);setError("");setTx("");
  try{
   const provider=(window as unknown as {ethereum?:EIP1193Provider}).ethereum;
   if(!provider)throw new Error("Connect an Ethereum wallet.");
   const wallet=createWalletClient({chain:sepolia,transport:custom(provider)});
   const client=createPublicClient({chain:sepolia,transport:http(process.env.NEXT_PUBLIC_RPC_URL||undefined)});
   const [account]=await wallet.requestAddresses();
   if(await wallet.getChainId()!==sepolia.id)throw new Error("Switch the wallet to Sepolia.");
   const code=await client.getBytecode({address:address as Address});
   if(!code||code==="0x")throw new Error("Configured contract is unavailable.");
   const {request}=await client.simulateContract({address:address as Address,abi:certificateRegistryAbi,functionName:"registerCertificate",args:[("0x"+data.docHashHex) as Hex,cid.trim(),reference.trim()],account});
   const hash=await wallet.writeContract(request);
   const receipt=await client.waitForTransactionReceipt({hash});
   if(receipt.status!=="success")throw new Error("Transaction reverted.");
   setTx(hash);
  }catch(e){setError(e instanceof Error?e.message.slice(0,350):"Registration failed.");}finally{setBusy(false);}
 }
 return <main className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">Process academic certificate</h1><p className="mt-2 text-sm text-slate-400">Extract labelled text fields and compute a SHA-256 document fingerprint. Processing does not issue or authenticate the credential.</p><div className="mt-8 grid gap-6 md:grid-cols-2"><section className="rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4"><label className="block text-sm font-medium">Select PDF (up to 4 MB, 30 pages)</label><input type="file" accept="application/pdf" disabled={busy} onChange={e=>{setFile(e.target.files?.[0]||null);setData(null);setTx("");}} className="w-full text-sm"/><label className="flex items-start gap-2 text-xs text-slate-300"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>I have permission to send this document for transient server-side processing. No automatic IPFS publication.</label><button disabled={!file||!consent||busy} onClick={process} className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold disabled:opacity-40">{busy?"Working…":"Process PDF"}</button>{error&&<p role="alert" className="break-words text-sm text-amber-300">{error}</p>}{data&&<div className="space-y-2 text-sm"><p className="font-semibold">Document fingerprint</p><p className="break-all font-mono text-xs">{data.docHashHex}</p><p>{data.textExtracted?"Text layer extracted":"No text layer found; OCR is not available in hosted mode."}</p>{Object.entries(data.entities).map(([k,v])=><p key={k}><span className="text-slate-400">{k.replaceAll("_"," ")}: </span>{v||"Not extracted"}</p>)}</div>}</section><section className="rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4"><h2 className="text-xl font-semibold">Authorized issuer registration</h2><p className="text-sm text-slate-400">Only a wallet with the registry issuer role can register. Use an already secured, encrypted IPFS CID and a non-identifying reference. Never put student names or raw personal documents on a public chain.</p>{!isAddress(address)&&<p className="rounded-lg border border-amber-700 p-3 text-sm text-amber-200">Registry address is not configured. PDF processing remains available.</p>}<input value={cid} onChange={e=>setCid(e.target.value)} placeholder="Encrypted document CID" className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"/><input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Non-identifying reference" className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"/><button disabled={!data||!isAddress(address)||!cid.trim()||!reference.trim()||busy} onClick={issue} className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold disabled:opacity-40">Register with wallet</button>{tx&&<p className="text-sm text-emerald-300">Transaction confirmed: <a className="break-all underline" href={"https://sepolia.etherscan.io/tx/"+tx} target="_blank" rel="noreferrer">{tx}</a></p>}<Link href="/verify" className="block text-sm text-indigo-300">Check registry status</Link></section></div></main>;
}

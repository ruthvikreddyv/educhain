"use client";
import {useState} from "react";
export function WalletButton(){
 const [address,setAddress]=useState("");
 const [error,setError]=useState("");
 async function connect(){
  try{
   const provider=(window as unknown as {ethereum?:{request:(args:{method:string})=>Promise<unknown>}}).ethereum;
   if(!provider)throw new Error("Install a compatible Ethereum wallet.");
   const accounts=await provider.request({method:"eth_requestAccounts"}) as string[];
   setAddress(accounts[0]||"");setError("");
  }catch(e){setError(e instanceof Error?e.message:"Wallet connection failed.");}
 }
 return <div className="text-right"><button onClick={connect} className="rounded-lg border border-indigo-400/50 px-4 py-2 text-xs text-indigo-200">{address?address.slice(0,6)+"…"+address.slice(-4):"Connect wallet"}</button>{error&&<p className="mt-1 text-xs text-amber-300">{error}</p>}</div>;
}

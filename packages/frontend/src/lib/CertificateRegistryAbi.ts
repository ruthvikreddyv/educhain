export const certificateRegistryAbi = [
  {
    inputs: [
      { internalType: "bytes32", name: "docHash", type: "bytes32" },
      { internalType: "string", name: "ipfsCid", type: "string" },
      { internalType: "string", name: "studentId", type: "string" },
    ],
    name: "registerCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "docHash", type: "bytes32" }],
    name: "revokeCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "docHash", type: "bytes32" }],
    name: "verifyCertificate",
    outputs: [
      { internalType: "bool", name: "valid", type: "bool" },
      { internalType: "string", name: "ipfsCid", type: "string" },
      { internalType: "string", name: "studentId", type: "string" },
      { internalType: "address", name: "issuer", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

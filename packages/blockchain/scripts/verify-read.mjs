import { JsonRpcProvider, Contract, isAddress } from "ethers";
const [hash] = process.argv.slice(2);
const rpc = process.env.EDUCHAIN_RPC_URL;
const address = process.env.EDUCHAIN_REGISTRY_ADDRESS;
if (!rpc || !address || !isAddress(address) || !/^0x[0-9a-fA-F]{64}$/.test(hash ?? "")) {
  process.stderr.write("Invalid registry configuration or hash\n");
  process.exit(1);
}
try {
  const provider = new JsonRpcProvider(rpc);
  const network = await provider.getNetwork();
  const expected = process.env.EDUCHAIN_CHAIN_ID;
  if (!expected || network.chainId.toString() !== expected) throw new Error("Chain mismatch");
  if (await provider.getCode(address) === "0x") throw new Error("Missing contract");
  const registry = new Contract(address, ["function verifyCertificate(bytes32) view returns (bool,string,string,address)"], provider);
  const [valid,cid,,issuer] = await registry.verifyCertificate(hash);
  const found = issuer !== "0x0000000000000000000000000000000000000000" && cid.length > 0;
  console.log(JSON.stringify({found,active:found && valid,issuer:found ? issuer : null,chainId:network.chainId.toString()}));
} catch {
  process.stderr.write("Registry query unavailable\n");
  process.exit(1);
}

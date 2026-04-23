// scripts/deployCertificateRegistry.ts
import { network } from "hardhat";

async function main() {
  // Get connection + ethers for the selected network
  const { ethers, networkName } = await network.connect();

  console.log(`Deploying CertificateRegistry to ${networkName}...`);

  // Deploy by contract name (from artifacts)
  let registry = await ethers.deployContract("CertificateRegistry");
  registry = await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("CertificateRegistry deployed at:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

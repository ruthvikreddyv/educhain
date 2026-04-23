const { ethers } = require("hardhat");

async function main() {
  const hash = process.argv[2];

  if (!hash) {
    console.error("Hash required");
    process.exit(1);
  }

  const contractAddress = process.env.CONTRACT_ADDRESS;

  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const contract = CertificateRegistry.attach(contractAddress);

  try {
    const result = await contract.getCertificate(hash);

    if (result && result[0]) {
      console.log("FOUND");
      console.log(JSON.stringify({
        hash: result[0],
        ipfs: result[1],
        studentId: result[2]
      }));
    } else {
      console.log("NOT_FOUND");
    }

  } catch (err) {
    console.error("ERROR", err);
  }
}

main();
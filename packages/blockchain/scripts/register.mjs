import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

const { ethers } = hre;

async function main() {
    const args = process.argv.slice(2);

    const docHash = args[0];
    const ipfsCid = args[1];

    if (!docHash || !ipfsCid) {
        console.error("Missing arguments");
        process.exit(1);
    }

    const contractAddress = process.env.CONTRACT_ADDRESS;

    const Certificate = await ethers.getContractFactory("Certificate");
    const contract = Certificate.attach(contractAddress);

    const tx = await contract.registerCertificate(docHash, ipfsCid);
    await tx.wait();

    console.log("TX_HASH:", tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
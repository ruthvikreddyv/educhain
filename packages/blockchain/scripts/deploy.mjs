import hre from "hardhat";

const { ethers } = hre;

async function main() {
    const Certificate = await ethers.getContractFactory("Certificate");
    const contract = await Certificate.deploy();

    await contract.waitForDeployment();

    console.log("Contract deployed to:", contract.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
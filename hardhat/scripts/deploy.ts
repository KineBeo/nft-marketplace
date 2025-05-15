import { ethers } from "hardhat";

async function main() {
  // Get contract factories
  const Marketplace = await ethers.getContractFactory("Marketplace");
  
  // Deploy Marketplace contract
  console.log("Deploying Marketplace contract...");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);

  // Deploy NFT contract with the marketplace address
  const NFT = await ethers.getContractFactory("NFT");
  console.log("Deploying NFT contract...");
  
  const nft = await NFT.deploy(marketplaceAddress);
  await nft.waitForDeployment();
  
  const nftAddress = await nft.getAddress();
  console.log("NFT deployed to:", nftAddress);

  console.log("Deployment completed!");
}

// Run the deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./useWeb3";
import { toast } from "sonner";

// ABI của NFT Contract
const NFT_ABI = [
  "function mint(string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function approve(address to, uint256 tokenId) public",
  "function setApprovalForAll(address operator, bool approved) public",
  "function getApproved(uint256 tokenId) public view returns (address)",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
];

// ABI của Marketplace Contract
const MARKETPLACE_ABI = [
  "function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public payable",
  "function createMarketSale(address nftContract, uint256 tokenId) public payable",
  "function fetchMarketItems() public view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address payable seller, address payable owner, uint256 price, bool sold)[])",
  "function fetchMyNFTs() public view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address payable seller, address payable owner, uint256 price, bool sold)[])",
  "function fetchItemsCreated() public view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address payable seller, address payable owner, uint256 price, bool sold)[])",
];

interface ContractState {
  nftContract: ethers.Contract | null;
  marketplaceContract: ethers.Contract | null;
  isLoading: boolean;
  error: string | null;
}

export function useContract() {
  const { provider, signer, isConnected } = useWeb3();
  const [state, setState] = useState<ContractState>({
    nftContract: null,
    marketplaceContract: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initContracts = async () => {
      if (!provider || !signer || !isConnected) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Địa chỉ của NFT Contract
        const nftAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
        // Địa chỉ của Marketplace Contract
        const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;

        if (!nftAddress || !marketplaceAddress) {
          throw new Error("Contract addresses not configured");
        }

        const nftContract = new ethers.Contract(nftAddress, NFT_ABI, signer);
        const marketplaceContract = new ethers.Contract(
          marketplaceAddress,
          MARKETPLACE_ABI,
          signer
        );

        setState({
          nftContract,
          marketplaceContract,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error initializing contracts:", error);
        setState({
          nftContract: null,
          marketplaceContract: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to initialize contracts",
        });
        toast.error("Failed to initialize contracts");
      }
    };

    initContracts();
  }, [provider, signer, isConnected]);

  return state;
} 
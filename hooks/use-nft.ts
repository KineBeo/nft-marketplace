import { useState, useCallback } from "react";
import { useContract } from "./use-contract";
import { useWeb3 } from "./use-web3";
import { NFT, NFTMetadata } from "@/types/nft";
import { toast } from "@/components/ui/use-toast";

export function useNFT() {
  const { account } = useWeb3();
  const { nftContract, marketplaceContract } = useContract();
  const [isLoading, setIsLoading] = useState(false);

  const loadNFTs = useCallback(async (): Promise<NFT[]> => {
    if (!nftContract || !marketplaceContract) return [];

    try {
      setIsLoading(true);
      const items: NFT[] = [];
      const itemCount = await nftContract.balanceOf(account);
      
      for (let i = 0; i < itemCount; i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(account, i);
        const tokenURI = await nftContract.tokenURI(tokenId);
        const metadata: NFTMetadata = await fetch(tokenURI).then(res => res.json());
        
        const item = {
          tokenId: tokenId.toString(),
          price: "0",
          seller: account,
          owner: account,
          image: metadata.image,
          name: metadata.name,
          description: metadata.description,
          isListed: false
        };
        
        items.push(item);
      }
      
      return items;
    } catch (error) {
      console.error("Error loading NFTs:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [nftContract, marketplaceContract, account]);

  const loadMarketplaceItems = useCallback(async (): Promise<NFT[]> => {
    if (!nftContract || !marketplaceContract) return [];

    try {
      setIsLoading(true);
      const items: NFT[] = [];
      const itemCount = await marketplaceContract.itemCount();
      
      for (let i = 1; i <= itemCount; i++) {
        const item = await marketplaceContract.items(i);
        if (!item.isListed) continue;

        const tokenURI = await nftContract.tokenURI(item.tokenId);
        const metadata: NFTMetadata = await fetch(tokenURI).then(res => res.json());
        
        items.push({
          tokenId: item.tokenId.toString(),
          price: item.price.toString(),
          seller: item.seller,
          owner: item.owner,
          image: metadata.image,
          name: metadata.name,
          description: metadata.description,
          isListed: true
        });
      }
      
      return items;
    } catch (error) {
      console.error("Error loading marketplace items:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [nftContract, marketplaceContract]);

  const createNFT = useCallback(async (file: File, name: string, description: string) => {
    if (!nftContract) return;

    try {
      setIsLoading(true);
      // Upload to IPFS
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      });
      const resJson = await res.json();
      const imageHash = resJson.IpfsHash;

      // Upload metadata to IPFS
      const metadata = {
        name,
        description,
        image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
      };

      const metadataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      });
      const metadataJson = await metadataRes.json();
      const metadataHash = metadataJson.IpfsHash;

      // Mint NFT
      const tx = await nftContract.mint(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
      await tx.wait();

      toast({
        title: "Success",
        description: "NFT created successfully!",
      });
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast({
        title: "Error",
        description: "Failed to create NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [nftContract]);

  const buyNFT = useCallback(async (tokenId: string, price: string) => {
    if (!marketplaceContract) return;

    try {
      setIsLoading(true);
      const tx = await marketplaceContract.buyItem(tokenId, { value: price });
      await tx.wait();

      toast({
        title: "Success",
        description: "NFT purchased successfully!",
      });
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast({
        title: "Error",
        description: "Failed to buy NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [marketplaceContract]);

  const listNFT = useCallback(async (tokenId: string, price: string) => {
    if (!nftContract || !marketplaceContract) return;

    try {
      setIsLoading(true);
      const tx = await nftContract.approve(marketplaceContract.address, tokenId);
      await tx.wait();

      const listTx = await marketplaceContract.listItem(tokenId, price);
      await listTx.wait();

      toast({
        title: "Success",
        description: "NFT listed successfully!",
      });
    } catch (error) {
      console.error("Error listing NFT:", error);
      toast({
        title: "Error",
        description: "Failed to list NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [nftContract, marketplaceContract]);

  const unlistNFT = useCallback(async (tokenId: string) => {
    if (!marketplaceContract) return;

    try {
      setIsLoading(true);
      const tx = await marketplaceContract.unlistItem(tokenId);
      await tx.wait();

      toast({
        title: "Success",
        description: "NFT unlisted successfully!",
      });
    } catch (error) {
      console.error("Error unlisting NFT:", error);
      toast({
        title: "Error",
        description: "Failed to unlist NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [marketplaceContract]);

  return {
    isLoading,
    loadNFTs,
    loadMarketplaceItems,
    createNFT,
    buyNFT,
    listNFT,
    unlistNFT,
  };
} 
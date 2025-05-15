import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";
import { useWeb3 } from "@/components/providers/web3-provider";
import { ethers } from "ethers";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface NFTCardProps {
  nft: {
    tokenId: string;
    price: string;
    seller: string;
    owner: string;
    image: string;
    name: string;
    description: string;
    isListed: boolean;
  };
  onBuy?: (tokenId: string, price: string) => Promise<void>;
  onList?: (tokenId: string, price: string) => Promise<void>;
  onUnlist?: (tokenId: string) => Promise<void>;
}

export function NFTCard({ nft, onBuy, onList, onUnlist }: NFTCardProps) {
  const { account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState(nft.price || "0");

  const isOwner = account?.toLowerCase() === nft.owner.toLowerCase();
  const isSeller = account?.toLowerCase() === nft.seller.toLowerCase();

  // Format price for display
  const displayPrice = nft.price ? parseFloat(nft.price).toString() : "0";

  // Shorten address for display
  const shortenAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  };

  const handleBuy = async () => {
    if (!onBuy) return;
    try {
      setIsLoading(true);
      await onBuy(nft.tokenId, nft.price);
    } catch (error) {
      console.error("Error buying NFT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleList = async () => {
    if (!onList) return;
    try {
      setIsLoading(true);
      // Make sure price is a valid number and remove trailing zeros
      // This prevents "1.0" format which causes BigNumber conversion errors
      const cleanPrice = parseFloat(price).toString();
      await onList(nft.tokenId, cleanPrice);
    } catch (error) {
      console.error("Error listing NFT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlist = async () => {
    if (!onUnlist) return;
    try {
      setIsLoading(true);
      await onUnlist(nft.tokenId);
    } catch (error) {
      console.error("Error unlisting NFT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden border-2 hover:shadow-md transition-all duration-200">
      <CardHeader className="p-0">
        <div className="relative w-full aspect-square">
          <Image
            src={nft.image}
            alt={nft.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="font-semibold bg-black/60 text-white">
              #{nft.tokenId}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold">{nft.name || `NFT #${nft.tokenId}`}</h3>
          {nft.isListed && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary font-bold">
              {displayPrice} ETH
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{nft.description || "No description provided"}</p>
        
        <Separator className="my-3" />
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium">
              {nft.isListed ? (
                <Badge variant="outline" className="bg-green-100 text-green-700 mt-1">Listed</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-700 mt-1">Not Listed</Badge>
              )}
            </p>
          </div>
          
          <div>
            <p className="text-gray-500">Token ID</p>
            <p className="font-medium mt-1">#{nft.tokenId}</p>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <p className="text-gray-500">Owner</p>
                  <p className="font-medium mt-1">{shortenAddress(nft.owner)}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs break-all">{nft.owner}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {nft.seller && nft.seller !== ethers.ZeroAddress && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <p className="text-gray-500">Seller</p>
                    <p className="font-medium mt-1">{shortenAddress(nft.seller)}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs break-all">{nft.seller}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {nft.isListed ? (
          isOwner ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleUnlist}
              disabled={isLoading}
            >
              {isLoading ? "Unlisting..." : "Unlist"}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleBuy}
              disabled={isLoading}
            >
              {isLoading ? "Buying..." : "Buy"}
            </Button>
          )
        ) : isOwner ? (
          <div className="flex gap-2 w-full">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
              placeholder="Price in ETH"
              min="0"
              step="0.01"
            />
            <Button
              onClick={handleList}
              disabled={isLoading}
            >
              {isLoading ? "Listing..." : "List"}
            </Button>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
} 
"use client";

import { useEffect, useState, useCallback } from "react";
import { NFTList } from "@/components/nft/nft-list";
import { useNFT } from "@/hooks/useNFT";
import { useWeb3 } from "@/components/providers/web3-provider";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { NFT } from "@/types/nft";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, RefreshCw } from "lucide-react";

export default function Home() {
  const { connect, isConnected } = useWeb3();
  const { loadMarketplaceItems, buyNFT, isLoading } = useNFT();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadNFTs();
    } else {
      setNfts([]);
      setLoadingState("idle");
    }
  }, [isConnected]);

  const loadNFTs = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoadingState("loading");
      }
      
      setError(null);
      console.log("Loading marketplace NFTs...");
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<NFT[]>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Loading marketplace items timed out. Please try again."));
        }, 15000); // 15 seconds timeout
      });
      
      // Race the loadMarketplaceItems against the timeout
      const items = await Promise.race([
        loadMarketplaceItems(),
        timeoutPromise
      ]);
      
      setNfts(items);
      
      console.log(`Loaded ${items.length} marketplace NFTs`);
      setLoadingState("success");
    } catch (err) {
      console.error("Error loading marketplace NFTs:", err);
      setLoadingState("error");
      
      // Better error messages for users
      const errorMessage = err instanceof Error 
        ? err.message
        : "Failed to load marketplace NFTs";
        
      // Check for specific error messages
      if (errorMessage.includes('BAD_DATA') && errorMessage.includes('fetchAvailableMarketItems')) {
        setError("No marketplace items available. The marketplace might be empty.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [loadMarketplaceItems]);

  const handleBuy = async (tokenId: string, price: string) => {
    try {
      await buyNFT(tokenId, price);
      // Just update the NFT status locally to remove it from the list
      setNfts(prev => prev.filter(nft => nft.tokenId !== tokenId));
    } catch (err) {
      console.error("Error buying NFT:", err);
      setError(err instanceof Error ? err.message : "Failed to buy NFT");
    }
  };

  return (
    <MainLayout>
      {!isConnected ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to NFT Marketplace
          </h2>
          <p className="text-gray-500 mb-8">
            Connect your wallet to start buying and selling NFTs
          </p>
          <Button onClick={connect}>Connect Wallet</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Available NFTs</h2>
            <Button 
              onClick={() => loadNFTs(true)} 
              disabled={isRefreshing || loadingState === "loading"}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loadingState === "success" && nfts.length === 0 && (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No NFTs Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are no NFTs available for sale at the moment. Create and list your own NFTs to get started.
              </p>
            </div>
          )}

          <NFTList
            nfts={nfts}
            isLoading={loadingState === "loading" || isLoading}
            onBuy={handleBuy}
          />
        </div>
      )}
    </MainLayout>
  );
}

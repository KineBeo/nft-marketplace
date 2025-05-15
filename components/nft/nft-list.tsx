import { ExpandableNFTCard } from "./expandable-nft-card";
import { Skeleton } from "@/components/ui/skeleton";
import { NFT } from "@/types/nft";

interface NFTListProps {
  nfts: NFT[];
  isLoading?: boolean;
  onBuy?: (tokenId: string, price: string) => Promise<void>;
  onList?: (tokenId: string, price: string) => Promise<void>;
  onUnlist?: (tokenId: string) => Promise<void>;
}

export function NFTList({ nfts, isLoading, onBuy, onList, onUnlist }: NFTListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full border rounded-xl p-4">
            <div className="flex gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!nfts.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No NFTs found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new NFT.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {nfts.map((nft) => (
        <ExpandableNFTCard
          key={nft.tokenId}
          nft={nft}
          onBuy={onBuy}
          onList={onList}
          onUnlist={onUnlist}
        />
      ))}
    </div>
  );
} 
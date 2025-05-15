export interface NFT {
  tokenId: string;
  price: string;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
  isListed: boolean;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
} 
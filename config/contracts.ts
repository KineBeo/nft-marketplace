export const NFT_MARKETPLACE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const NFT_COLLECTION_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const NFT_MARKETPLACE_ABI = [
  "function createMarketItem(address nftContractAddress, uint256 tokenId, uint256 price) public payable returns (uint256)",
  "function createMarketSale(address nftContractAddress, uint256 marketItemId) public payable",
  "function cancelMarketItem(address nftContractAddress, uint256 marketItemId) public",
  "function getLatestMarketItemByTokenId(uint256 tokenId) public view returns (tuple(uint256 marketItemId, address nftContractAddress, uint256 tokenId, address creator, address seller, address owner, uint256 price, bool sold, bool canceled), bool)",
  "function fetchAvailableMarketItems() public view returns (tuple(uint256 marketItemId, address nftContractAddress, uint256 tokenId, address creator, address seller, address owner, uint256 price, bool sold, bool canceled)[])",
  "function fetchSellingMarketItems() public view returns (tuple(uint256 marketItemId, address nftContractAddress, uint256 tokenId, address creator, address seller, address owner, uint256 price, bool sold, bool canceled)[])",
  "function fetchOwnedMarketItems() public view returns (tuple(uint256 marketItemId, address nftContractAddress, uint256 tokenId, address creator, address seller, address owner, uint256 price, bool sold, bool canceled)[])",
  "function getListingFee() public view returns (uint256)"
];

export const NFT_COLLECTION_ABI = [
  "function mintToken(string memory tokenURI) external returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function approve(address to, uint256 tokenId) external",
  "function getTokenCreatorById(uint256 tokenId) public view returns (address)",
  "function getTokensOwnedByMe() public view returns (uint256[] memory)"
]; 
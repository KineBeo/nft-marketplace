import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("NFT Marketplace", function () {
  // Fixture to deploy contracts before each test
  async function deployMarketplaceFixture() {
    const [owner, seller, buyer] = await ethers.getSigners();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();
    
    // Deploy NFT with the marketplace address
    const NFT = await ethers.getContractFactory("NFT");
    const marketplaceAddress = await marketplace.getAddress();
    const nft = await NFT.deploy(marketplaceAddress);

    const listingFee = await marketplace.getListingFee();

    return { marketplace, nft, owner, seller, buyer, listingFee };
  }

  describe("NFT Contract", function () {
    it("Should mint a token and set correct ownership", async function () {
      const { nft, seller } = await loadFixture(deployMarketplaceFixture);
      
      // Connect as seller and mint a token
      const tokenURI = "https://example.com/token/1";
      await nft.connect(seller).mintToken(tokenURI);
      
      // Check token ownership
      const tokenId = 1;
      expect(await nft.ownerOf(tokenId)).to.equal(seller.address);
      
      // Check token creator
      expect(await nft.getTokenCreatorById(tokenId)).to.equal(seller.address);
      
      // Check tokens created by seller
      const tokensCreated = await nft.connect(seller).getTokensCreatedByMe();
      expect(tokensCreated.length).to.equal(1);
      expect(tokensCreated[0]).to.equal(tokenId);
      
      // Check tokens owned by seller
      const tokensOwned = await nft.connect(seller).getTokensOwnedByMe();
      expect(tokensOwned.length).to.equal(1);
      expect(tokensOwned[0]).to.equal(tokenId);
    });
  });

  describe("Marketplace", function () {
    it("Should create a market item and fetch it", async function () {
      const { marketplace, nft, seller, listingFee } = await loadFixture(deployMarketplaceFixture);
      
      // Mint a token as seller
      const tokenURI = "https://example.com/token/1";
      await nft.connect(seller).mintToken(tokenURI);
      const tokenId = 1;
      
      // Create market item
      const price = ethers.parseEther("1");
      const nftAddress = await nft.getAddress();
      
      await marketplace.connect(seller).createMarketItem(
        nftAddress,
        tokenId,
        price,
        { value: listingFee }
      );
      
      // Check available market items
      const marketItems = await marketplace.fetchAvailableMarketItems();
      expect(marketItems.length).to.equal(1);
      expect(marketItems[0].tokenId).to.equal(tokenId);
      expect(marketItems[0].price).to.equal(price);
      expect(marketItems[0].seller).to.equal(seller.address);
      
      // Check seller's items
      const sellerItems = await marketplace.connect(seller).fetchSellingMarketItems();
      expect(sellerItems.length).to.equal(1);
      expect(sellerItems[0].marketItemId).to.equal(1);
    });

    it("Should execute a market sale", async function () {
      const { marketplace, nft, seller, buyer, listingFee } = await loadFixture(deployMarketplaceFixture);
      
      // Mint and list a token
      const tokenURI = "https://example.com/token/1";
      await nft.connect(seller).mintToken(tokenURI);
      const tokenId = 1;
      
      const price = ethers.parseEther("1");
      const nftAddress = await nft.getAddress();
      
      await marketplace.connect(seller).createMarketItem(
        nftAddress,
        tokenId,
        price,
        { value: listingFee }
      );
      
      // Execute sale
      await marketplace.connect(buyer).createMarketSale(
        nftAddress,
        1, // marketItemId
        { value: price }
      );
      
      // Check token ownership transferred to buyer
      expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);
      
      // Check marketplace state updated
      const marketItems = await marketplace.fetchAvailableMarketItems();
      expect(marketItems.length).to.equal(0);
      
      // Check buyer's owned items
      const buyerItems = await marketplace.connect(buyer).fetchOwnedMarketItems();
      expect(buyerItems.length).to.equal(1);
      expect(buyerItems[0].owner).to.equal(buyer.address);
      expect(buyerItems[0].sold).to.equal(true);
    });

    it("Should allow item cancellation", async function () {
      const { marketplace, nft, seller, listingFee } = await loadFixture(deployMarketplaceFixture);
      
      // Mint and list a token
      const tokenURI = "https://example.com/token/1";
      await nft.connect(seller).mintToken(tokenURI);
      const tokenId = 1;
      
      const price = ethers.parseEther("1");
      const nftAddress = await nft.getAddress();
      
      await marketplace.connect(seller).createMarketItem(
        nftAddress,
        tokenId,
        price,
        { value: listingFee }
      );
      
      // Cancel listing
      await marketplace.connect(seller).cancelMarketItem(nftAddress, 1);
      
      // Check token returned to seller
      expect(await nft.ownerOf(tokenId)).to.equal(seller.address);
      
      // Check marketplace state updated - item no longer available
      const marketItems = await marketplace.fetchAvailableMarketItems();
      expect(marketItems.length).to.equal(0);
    });
  });
}); 
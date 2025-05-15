# NFT Marketplace Smart Contracts

This project contains smart contracts for an NFT marketplace built with Hardhat and OpenZeppelin contracts v5.

## Project Structure

- `contracts/NFT.sol`: ERC721 implementation for NFT creation and management
- `contracts/Marketplace.sol`: Marketplace contract for listing, buying, and selling NFTs
- `scripts/deploy.ts`: Deployment script for the contracts
- `test/NFTMarketplace.ts`: Test suite for the marketplace functionality

## Key Features

- Mint NFTs with custom URIs
- List NFTs for sale with a price
- Buy NFTs from the marketplace
- Cancel NFT listings
- Track NFT creators, owners, and marketplace items

## Getting Started

### Prerequisites

- Node.js and npm installed

### Installation

```bash
# Install dependencies
npm install
```

### Compiling Contracts

```bash
npx hardhat compile
```

### Running Tests

```bash
npx hardhat test
```

### Deployment

```bash
npx hardhat run scripts/deploy.ts
```

For deployment to a specific network:

```bash
npx hardhat run scripts/deploy.ts --network <network-name>
```

## Contract Interactions

### NFT Contract

The NFT contract allows users to:
- Mint new NFTs with custom URIs
- Track NFT ownership and creation
- View NFTs created or owned by a particular address

### Marketplace Contract

The Marketplace contract allows users to:
- List NFTs for sale with a set price
- Purchase NFTs by paying the listed price
- Cancel NFT listings
- View available NFTs, owned NFTs, and selling NFTs

## License

This project is licensed under the MIT License.

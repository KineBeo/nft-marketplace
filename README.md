# NFT Marketplace

A modern, responsive NFT marketplace built with Next.js, TypeScript, shadcn UI components, and Ethereum blockchain integration.

## Features

- 🖼️ Browse, create, buy, and sell NFTs
- 👛 Connect your Ethereum wallet (MetaMask, etc.)
- 💸 List your NFTs for sale with custom pricing
- 🔍 View detailed NFT information with expandable cards
- 👤 Interactive user profile menu with account statistics

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **UI Components**: shadcn UI (Radix UI), Motion library for animations
- **Blockchain**: Ethereum (via ethers.js v6)
- **Smart Contracts**: Solidity 0.8.28, Hardhat, OpenZeppelin

## Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask or other Ethereum wallet browser extension

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd my-nft-marketplace
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up the smart contracts (optional if deploying new contracts)

```bash
cd hardhat
npm install
npx hardhat compile
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Smart Contract Deployment

The application requires NFT and Marketplace contracts to be deployed. To deploy new contracts:

```bash
cd hardhat
npx hardhat run scripts/deploy.ts --network localhost
```

For testing purposes, you can run a local Ethereum node:

```bash
npx hardhat node
```

## Usage Guide

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top right corner
2. Approve the connection in your wallet extension (MetaMask)
3. Once connected, you'll see your account information, balance, and NFT statistics

### Browsing NFTs

1. The home page displays all available NFTs
2. Click on any NFT card to view detailed information
3. NFTs can be filtered and sorted (if implemented)

### Creating an NFT

1. Navigate to the "Create NFT" page
2. Upload an image for your NFT
3. Fill in the name and description
4. Click "Create" and approve the transaction in your wallet

### Buying an NFT

1. Click on a listed NFT to view details
2. Click the "Buy" button
3. Approve the transaction in your wallet
4. Once confirmed, the NFT will be transferred to your wallet

### Selling an NFT

1. Navigate to "My NFTs" page
2. Click on an NFT you own
3. Enter a price and click "List"
4. Approve the transaction in your wallet
5. Your NFT will now be listed for sale

### Managing Your NFTs

1. Navigate to "My NFTs" page to see all NFTs you own
2. You can list, unlist, or view your NFTs from this page

## Components

### ExpandableNFTCard

Interactive card component that displays NFT information and expands to show detailed view with purchase/listing options.

### UserProfileMenu

User account interface showing wallet address, ETH balance, and NFT statistics. Provides quick access to functions like copying wallet address and viewing on Etherscan.

## Development

### Project Structure

- `/app`: Page components and routes
- `/components`: Reusable React components
- `/hooks`: Custom React hooks for blockchain interaction
- `/hardhat`: Smart contracts and deployment scripts
- `/public`: Static assets
- `/types`: TypeScript type definitions

## License

[MIT License](LICENSE)

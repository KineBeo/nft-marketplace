/**
 * NFT Storage with Pinata IPFS
 * Mô-đun này cung cấp các công cụ để lưu trữ và quản lý NFT trên IPFS thông qua Pinata
 */

// Re-export từ các modules
export * from './config';
export * from './pinataClient';
export * from './nftStorage';

// Export instance mặc định của NFTStorage
import { NFTStorage } from './nftStorage';
export const nftStorage = new NFTStorage(); 
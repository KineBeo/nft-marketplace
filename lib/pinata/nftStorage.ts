import { PinataClient, PinataResult } from './pinataClient';
import { getPinataConfig, PinataMetadata, PinataOptions } from './config';

/**
 * Định dạng metadata của NFT theo chuẩn
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI hoặc URL
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  // Các trường bổ sung theo tiêu chuẩn ERC-721 Metadata
  external_url?: string;
  background_color?: string;
  animation_url?: string;
}

/**
 * Class để quản lý việc lưu trữ NFT trên IPFS thông qua Pinata
 */
export class NFTStorage {
  private pinataClient: PinataClient;

  constructor() {
    // Sử dụng cấu hình từ biến môi trường
    const config = getPinataConfig();
    console.log("config", config);
    this.pinataClient = new PinataClient(config);
  }

  /**
   * Kiểm tra xem Pinata đã được cấu hình đúng chưa
   */
  public isConfigured(): boolean {
    return this.pinataClient.isConfigured();
  }

  /**
   * Upload ảnh NFT lên IPFS
   * @param file File ảnh
   * @param name Tên ảnh
   * @returns IPFS URI của ảnh
   */
  public async uploadImage(file: File, name: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Pinata chưa được cấu hình. Vui lòng kiểm tra API keys.');
    }

    // Tạo metadata cho Pinata
    const options: PinataOptions = {
      pinataMetadata: {
        name: `nft-image-${name}`,
        keyvalues: {
          type: 'image',
          name
        }
      }
    };

    try {
      // Upload ảnh lên IPFS
      const result = await this.pinataClient.pinFile(file, file.name, options);
      
      // Trả về URI theo định dạng ipfs://CID
      return `ipfs://${result.IpfsHash}`;
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      throw new Error(`Không thể upload ảnh NFT: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  }

  /**
   * Upload metadata của NFT lên IPFS
   * @param metadata Metadata của NFT
   * @returns IPFS URI của metadata
   */
  public async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Pinata chưa được cấu hình. Vui lòng kiểm tra API keys.');
    }

    // Tạo options cho Pinata
    const options: PinataOptions = {
      pinataMetadata: {
        name: `nft-metadata-${metadata.name}`,
        keyvalues: {
          type: 'metadata',
          name: metadata.name
        }
      }
    };

    try {
      // Upload metadata lên IPFS
      const result = await this.pinataClient.pinJSON<NFTMetadata>(metadata, options);
      
      // Trả về URI theo định dạng ipfs://CID
      return `ipfs://${result.IpfsHash}`;
    } catch (error) {
      console.error('Lỗi khi upload metadata:', error);
      throw new Error(`Không thể upload metadata NFT: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  }

  /**
   * Tạo đầy đủ NFT từ ảnh và metadata
   * @param imageFile File ảnh NFT
   * @param name Tên NFT
   * @param description Mô tả NFT
   * @param attributes Các thuộc tính của NFT
   * @returns URI của metadata NFT trên IPFS
   */
  public async createNFT(
    imageFile: File,
    name: string,
    description: string,
    attributes?: Array<{ trait_type: string; value: string | number }>
  ): Promise<string> {
    // Upload ảnh và lấy URI
    const imageURI = await this.uploadImage(imageFile, name);
    
    // Tạo metadata
    const metadata: NFTMetadata = {
      name,
      description,
      image: imageURI,
      attributes
    };
    
    // Upload metadata và trả về URI
    return await this.uploadMetadata(metadata);
  }

  /**
   * Lấy URL gateway cho một IPFS URI
   * @param ipfsURI URI theo định dạng ipfs://CID
   * @returns URL đầy đủ qua gateway
   */
  public getGatewayURL(ipfsURI: string): string {
    return this.pinataClient.getIPFSGatewayURL(ipfsURI);
  }

  /**
   * Nạp metadata của NFT từ IPFS URI
   * @param uri URI của metadata (ipfs://... hoặc URL)
   * @returns Metadata của NFT
   */
  public async loadNFTMetadata(uri: string): Promise<NFTMetadata> {
    try {
      let url = uri;
      
      // Chuyển đổi ipfs:// URI sang URL gateway nếu cần
      if (uri.startsWith('ipfs://')) {
        url = this.getGatewayURL(uri);
      }
      
      // Fetch metadata
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      
      return await response.json() as NFTMetadata;
    } catch (error) {
      console.error('Lỗi khi load metadata từ IPFS:', error);
      throw new Error(`Không thể load metadata NFT: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  }
} 
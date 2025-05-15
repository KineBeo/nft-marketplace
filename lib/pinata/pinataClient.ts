import { PinataConfig, PinataOptions, isPinataConfigured } from './config';

/**
 * Kết quả trả về từ việc ghim một file lên IPFS qua Pinata
 */
export interface PinataResult {
  IpfsHash: string; // CID của nội dung đã ghim
  PinSize: number; // Kích thước của nội dung
  Timestamp: string; // Thời gian đã ghim
  isDuplicate?: boolean; // Có phải là bản sao không
}

/**
 * Lỗi từ Pinata API
 */
export interface PinataError {
  error: string;
  reason: string;
  statusCode: number;
}

/**
 * Client cho Pinata API
 */
export class PinataClient {
  private config: PinataConfig;

  constructor(config: PinataConfig) {
    this.config = config;
  }

  /**
   * Kiểm tra nếu client đã được cấu hình đúng
   */
  public isConfigured(): boolean {
    console.log("config", this.config);
    return isPinataConfigured(this.config);
  }

  /**
   * Tạo headers cho các request
   */
  private getHeaders(): HeadersInit {
    if (this.config.jwt) {
      return {
        Authorization: `Bearer ${this.config.jwt}`
      };
    }
    
    return {
      pinata_api_key: this.config.apiKey,
      pinata_secret_api_key: this.config.apiSecret
    };
  }

  /**
   * Pin JSON lên IPFS
   */
  public async pinJSON<T>(
    content: T,
    options?: PinataOptions
  ): Promise<PinataResult> {
    if (!this.isConfigured()) {
      throw new Error('Pinata không được cấu hình đúng. Vui lòng kiểm tra API key và secret.');
    }

    const endpoint = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const body = JSON.stringify({
      pinataContent: content,
      ...options
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getHeaders()
        },
        body
      });

      if (!response.ok) {
        const error = await response.json() as PinataError;
        throw new Error(`Lỗi Pinata: ${error.reason || response.statusText}`);
      }

      return await response.json() as PinataResult;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Không thể pin JSON lên IPFS: ${error.message}`);
      }
      throw new Error('Không thể pin JSON lên IPFS: Lỗi không xác định');
    }
  }

  /**
   * Pin tệp lên IPFS
   * Lưu ý: Trong môi trường browser, bạn cần sử dụng FormData để gửi file
   */
  public async pinFile(
    file: File | Blob,
    fileName: string,
    options?: PinataOptions
  ): Promise<PinataResult> {
    if (!this.isConfigured()) {
      throw new Error('Pinata không được cấu hình đúng. Vui lòng kiểm tra API key và secret.');
    }

    const endpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();

    // Thêm file vào FormData
    formData.append('file', file, fileName);

    // Thêm metadata và options nếu có
    if (options) {
      formData.append('pinataOptions', JSON.stringify(options.pinataOptions || {}));
      formData.append('pinataMetadata', JSON.stringify(options.pinataMetadata || {}));
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData
      });

      if (!response.ok) {
        const error = await response.json() as PinataError;
        throw new Error(`Lỗi Pinata: ${error.reason || response.statusText}`);
      }

      return await response.json() as PinataResult;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Không thể pin file lên IPFS: ${error.message}`);
      }
      throw new Error('Không thể pin file lên IPFS: Lỗi không xác định');
    }
  }

  /**
   * Pin tệp từ Buffer (chỉ hoạt động trên Node.js)
   */
  public async pinBuffer(
    buffer: Buffer,
    fileName: string,
    options?: PinataOptions
  ): Promise<PinataResult> {
    if (!this.isConfigured()) {
      throw new Error('Pinata không được cấu hình đúng. Vui lòng kiểm tra API key và secret.');
    }

    // Phương thức này chỉ nên được sử dụng trong môi trường Node.js với FormData từ 'form-data'
    throw new Error('Phương thức pinBuffer chỉ có thể được sử dụng trong môi trường Node.js với thư viện form-data');
  }

  /**
   * Lấy URL của nội dung từ IPFS hash
   */
  public getIPFSGatewayURL(ipfsHash: string): string {
    // Xóa tiền tố ipfs:// nếu có
    const hash = ipfsHash.replace('ipfs://', '');
    // Đảm bảo gateway không có dấu / ở cuối
    const gateway = this.config.gateway.endsWith('/')
      ? this.config.gateway.slice(0, -1)
      : this.config.gateway;
    return `${gateway}/ipfs/${hash}`;
  }

  /**
   * Kiểm tra trạng thái ghim của một CID
   */
  public async checkPinStatus(ipfsHash: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Pinata không được cấu hình đúng. Vui lòng kiểm tra API key và secret.');
    }

    try {
      const endpoint = `https://api.pinata.cloud/pinning/pinJobs?ipfs_pin_hash=${ipfsHash}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.count > 0;
    } catch (error) {
      return false;
    }
  }
} 
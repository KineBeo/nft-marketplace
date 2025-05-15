/**
 * Cấu hình cho dịch vụ Pinata IPFS
 */
export interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  jwt?: string;
  gateway: string;
}

/**
 * Cấu hình từ biến môi trường
 * Sử dụng các biến từ .env.local
 */
export const getPinataConfig = (): PinataConfig => {
  return {
    apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
    apiSecret: process.env.NEXT_PUBLIC_PINATA_API_SECRET || '',
    jwt: process.env.NEXT_PUBLIC_PINATA_JWT,
    gateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
  };
};

/**
 * Mẫu metadata cho các file được tải lên Pinata
 */
export interface PinataMetadata {
  name: string;
  description?: string;
  keyvalues?: Record<string, string | number | boolean>;
}

/**
 * Tùy chọn pinning cho Pinata
 */
export interface PinataOptions {
  pinataMetadata?: PinataMetadata;
  pinataOptions?: {
    cidVersion?: 0 | 1;
    customPinPolicy?: {
      regions?: {
        id: string;
        desiredReplicationCount: number;
      }[];
    };
  };
}

/**
 * Kiểm tra xem cấu hình Pinata có đầy đủ không
 */
export const isPinataConfigured = (config: PinataConfig): boolean => {
  console.log("config", config);
  return !!(config.apiKey && config.apiSecret) || !!config.jwt;
}; 
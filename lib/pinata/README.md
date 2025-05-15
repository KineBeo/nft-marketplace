# Pinata IPFS Storage cho NFT Marketplace

Module này cung cấp tích hợp với Pinata IPFS cho việc lưu trữ hình ảnh và metadata của NFT.

## Cài đặt

Không cần cài đặt thêm các gói ngoài. Module đã được tích hợp sẵn trong dự án.

## Cấu hình

Tạo file `.env.local` trong thư mục gốc dự án và thêm các biến môi trường sau:

```
# Các biến Pinata cho IPFS
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_API_SECRET=your_pinata_api_secret_here
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

Bạn có thể cung cấp `NEXT_PUBLIC_PINATA_API_KEY` và `NEXT_PUBLIC_PINATA_API_SECRET` hoặc `NEXT_PUBLIC_PINATA_JWT`. Nếu cả hai được cung cấp, JWT sẽ được ưu tiên sử dụng.

## Cách sử dụng

### Trong React Component

```typescript
import { usePinata } from '@/hooks/usePinata';

function MyComponent() {
  const { 
    uploadImage, 
    uploadMetadata, 
    createNFT, 
    getGatewayURL,
    isUploading,
    error,
    uploadedURI,
    uploadedURL
  } = usePinata();

  const handleCreateNFT = async (file, name, description, attributes) => {
    try {
      // Tải lên ảnh và metadata, trả về IPFS URI
      const tokenURI = await createNFT(file, name, description, attributes);
      console.log('Token URI:', tokenURI);
      
      // Sử dụng tokenURI để mint NFT với smart contract
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };

  return (
    <div>
      {/* Component UI */}
    </div>
  );
}
```

### Sử dụng Component NFTUploader

```tsx
import NFTUploader from '@/components/NFTUploader';

function MyPage() {
  const handleComplete = (tokenURI) => {
    console.log('NFT đã được tạo với URI:', tokenURI);
    // Mint NFT với tokenURI
  };

  const handleError = (error) => {
    console.error('Lỗi:', error);
  };

  return (
    <div>
      <NFTUploader 
        onComplete={handleComplete} 
        onError={handleError} 
      />
    </div>
  );
}
```

### API Upload

Bạn cũng có thể sử dụng API endpoint để tải lên tệp:

```typescript
// Tải lên ảnh và metadata
const formData = new FormData();
formData.append('file', imageFile);
formData.append('name', 'Tên NFT');
formData.append('description', 'Mô tả NFT');
formData.append('createMetadata', 'true');
formData.append('attributes', JSON.stringify([
  { trait_type: 'Màu sắc', value: 'Xanh' }
]));

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('Image URI:', data.image.uri);
console.log('Metadata URI:', data.metadata.uri);
```

## Lấy API Keys từ Pinata

1. Đăng ký tài khoản tại [Pinata](https://app.pinata.cloud/register)
2. Sau khi đăng nhập, truy cập [API Keys](https://app.pinata.cloud/developers/api-keys)
3. Tạo một API key mới với các quyền đầy đủ
4. Sao chép `API Key` và `API Secret` vào file `.env.local` 
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { usePinata } from '@/hooks/usePinata';
import Image from 'next/image';

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface NFTUploaderProps {
  onComplete?: (tokenURI: string) => void;
  onError?: (error: string) => void;
}

export default function NFTUploader({ onComplete, onError }: NFTUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<NFTAttribute[]>([
    { trait_type: '', value: '' }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    isUploading, 
    error, 
    uploadedURI, 
    uploadedURL,
    createNFT, 
    isConfigured 
  } = usePinata();

  // Xử lý khi chọn file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Chỉ chấp nhận file hình ảnh
      if (!selectedFile.type.startsWith('image/')) {
        if (onError) onError('Vui lòng chọn file hình ảnh');
        return;
      }
      
      setFile(selectedFile);
      
      // Tạo preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Xử lý cập nhật thuộc tính
  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { 
      ...newAttributes[index], 
      [field]: value 
    };
    setAttributes(newAttributes);
  };

  // Thêm một thuộc tính mới
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  // Xóa một thuộc tính
  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  // Xử lý khi submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      if (onError) onError('Vui lòng chọn một file hình ảnh');
      return;
    }
    
    if (!name.trim()) {
      if (onError) onError('Vui lòng nhập tên cho NFT');
      return;
    }

    // Lọc các thuộc tính hợp lệ (có cả trait_type và value)
    const validAttributes = attributes.filter(
      attr => attr.trait_type.trim() && (attr.value.toString().trim())
    );
    
    try {
      // Tạo NFT với Pinata
      const tokenURI = await createNFT(file, name, description, validAttributes);
      
      // Gọi callback khi hoàn thành
      if (onComplete) onComplete(tokenURI);
    } catch (error) {
      console.error('Lỗi khi tạo NFT:', error);
      
      if (error instanceof Error && onError) {
        onError(error.message);
      }
    }
  };

  if (!isConfigured) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
        <p>Pinata chưa được cấu hình. Vui lòng kiểm tra API keys.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Tạo NFT mới</h2>

      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          <p>{error}</p>
        </div>
      )}

      {uploadedURI && uploadedURL && (
        <div className="bg-green-50 p-4 rounded-md text-green-800 mb-4">
          <p>NFT đã được tạo thành công!</p>
          <p className="truncate">URI: <span className="font-mono text-sm">{uploadedURI}</span></p>
          <div className="mt-2">
            <a 
              href={uploadedURL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Xem Metadata
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Phần upload hình ảnh */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Hình ảnh NFT</label>
          <div 
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative w-full h-48">
                <Image 
                  src={preview} 
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="py-8">
                <p>Nhấp để chọn hình ảnh</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF (tối đa 5MB)</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>

        {/* Tên NFT */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Tên NFT <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="NFT của tôi"
            required
          />
        </div>

        {/* Mô tả */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md resize-none h-24"
            placeholder="Mô tả về NFT..."
          />
        </div>

        {/* Thuộc tính */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Thuộc tính</label>
          
          {attributes.map((attr, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={attr.trait_type}
                onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Loại thuộc tính (vd: Màu sắc)"
              />
              <input
                type="text"
                value={attr.value}
                onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Giá trị (vd: Xanh)"
              />
              {attributes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="px-3 py-2 bg-red-100 text-red-800 rounded-md"
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addAttribute}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md mt-2"
          >
            + Thêm thuộc tính
          </button>
        </div>

        {/* Nút tạo NFT */}
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-3 rounded-md font-medium text-white ${
            isUploading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Đang tạo...' : 'Tạo NFT'}
        </button>
      </form>
    </div>
  );
} 
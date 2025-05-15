import { useState, useCallback } from 'react';
import { nftStorage, NFTMetadata } from '../lib/pinata';

export interface PinataHookState {
  isUploading: boolean;
  error: string | null;
  uploadedURI: string | null;
  uploadedURL: string | null;
}

export interface PinataHookResult extends PinataHookState {
  uploadImage: (file: File, name: string) => Promise<string>;
  uploadMetadata: (metadata: NFTMetadata) => Promise<string>;
  createNFT: (file: File, name: string, description: string, attributes?: Array<{ trait_type: string; value: string | number }>) => Promise<string>;
  getGatewayURL: (uri: string) => string;
  loadNFTMetadata: (uri: string) => Promise<NFTMetadata>;
  resetState: () => void;
  isConfigured: boolean;
}

/**
 * Hook React tùy chỉnh để tương tác với Pinata IPFS
 * @returns Các phương thức và trạng thái để làm việc với Pinata
 */
export function usePinata(): PinataHookResult {
  const [state, setState] = useState<PinataHookState>({
    isUploading: false,
    error: null,
    uploadedURI: null,
    uploadedURL: null,
  });

  const isConfigured = nftStorage.isConfigured();

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      error: null,
      uploadedURI: null,
      uploadedURL: null,
    });
  }, []);

  const setUploading = useCallback((isUploading: boolean) => {
    setState(prev => ({ ...prev, isUploading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isUploading: false }));
  }, []);

  const setUploadedURI = useCallback((uri: string) => {
    const url = nftStorage.getGatewayURL(uri);
    setState(prev => ({ 
      ...prev, 
      uploadedURI: uri, 
      uploadedURL: url,
      isUploading: false, 
      error: null 
    }));
    return uri;
  }, []);

  const uploadImage = useCallback(async (file: File, name: string): Promise<string> => {
    if (!isConfigured) {
      const error = 'Pinata chưa được cấu hình. Vui lòng kiểm tra API keys.';
      setError(error);
      throw new Error(error);
    }

    setUploading(true);
    setError(null);

    try {
      const uri = await nftStorage.uploadImage(file, name);
      setUploadedURI(uri);
      return uri;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định khi upload ảnh';
      setError(errorMessage);
      throw error;
    }
  }, [isConfigured, setUploading, setError, setUploadedURI]);

  const uploadMetadata = useCallback(async (metadata: NFTMetadata): Promise<string> => {
    if (!isConfigured) {
      const error = 'Pinata chưa được cấu hình. Vui lòng kiểm tra API keys.';
      setError(error);
      throw new Error(error);
    }

    setUploading(true);
    setError(null);

    try {
      const uri = await nftStorage.uploadMetadata(metadata);
      setUploadedURI(uri);
      return uri;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định khi upload metadata';
      setError(errorMessage);
      throw error;
    }
  }, [isConfigured, setUploading, setError, setUploadedURI]);

  const createNFT = useCallback(async (
    file: File,
    name: string,
    description: string,
    attributes?: Array<{ trait_type: string; value: string | number }>
  ): Promise<string> => {
    if (!isConfigured) {
      const error = 'Pinata chưa được cấu hình. Vui lòng kiểm tra API keys.';
      setError(error);
      throw new Error(error);
    }

    setUploading(true);
    setError(null);

    try {
      const uri = await nftStorage.createNFT(file, name, description, attributes);
      setUploadedURI(uri);
      return uri;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định khi tạo NFT';
      setError(errorMessage);
      throw error;
    }
  }, [isConfigured, setUploading, setError, setUploadedURI]);

  const getGatewayURL = useCallback((uri: string): string => {
    return nftStorage.getGatewayURL(uri);
  }, []);

  const loadNFTMetadata = useCallback(async (uri: string): Promise<NFTMetadata> => {
    try {
      return await nftStorage.loadNFTMetadata(uri);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định khi load metadata';
      setError(errorMessage);
      throw error;
    }
  }, [setError]);

  return {
    ...state,
    uploadImage,
    uploadMetadata,
    createNFT,
    getGatewayURL,
    loadNFTMetadata,
    resetState,
    isConfigured,
  };
} 
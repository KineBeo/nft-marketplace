import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint để xử lý tải lên ảnh
 */
export async function POST(request: NextRequest) {
  try {
    // Kiểm tra API key và log để debug
    console.log("PINATA_JWT environment variable check:", {
      exists: process.env.NEXT_PUBLIC_PINATA_JWT,
    });
    
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      console.error("PINATA_JWT không được cấu hình");
      return NextResponse.json(
        { error: "IPFS service not configured" },
        { status: 500 }
      );
    }

    // Xác định loại request (file hoặc JSON)
    const contentType = request.headers.get('content-type') || '';
    
    // Xử lý JSON metadata
    if (contentType.includes('application/json')) {
      const metadata = await request.json();
      console.log("Uploading JSON metadata to IPFS");
      
      try {
        console.log("Making Pinata JSON request with JWT:", {
          jwtExists: !!process.env.PINATA_JWT,
          jwtFirstChars: process.env.PINATA_JWT?.substring(0, 5),
        });
        
        const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: JSON.stringify(metadata),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Pinata JSON upload error:", errorData);
          throw new Error(`Failed to upload metadata: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Pinata JSON upload success:", data.IpfsHash);
        return NextResponse.json({ ipfsHash: data.IpfsHash });
      } catch (error) {
        console.error("JSON upload error:", error);
        throw error;
      }
    } 
    // Xử lý file upload
    else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return NextResponse.json(
          { error: "No file found in request" },
          { status: 400 }
        );
      }
      
      console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      
      // Tạo form data cho Pinata
      const pinataFormData = new FormData();
      pinataFormData.append('file', file);
      
      try {
        console.log("Making Pinata file upload request with JWT:", {
          jwtExists: !!process.env.NEXT_PUBLIC_PINATA_JWT,
          jwtFirstChars: process.env.NEXT_PUBLIC_PINATA_JWT?.substring(0, 5),
        });
        
        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: pinataFormData,
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Pinata file upload error:", errorData);
          throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Pinata file upload success:", data.IpfsHash);
        return NextResponse.json({ ipfsHash: data.IpfsHash });
      } catch (error) {
        console.error("File upload error:", error);
        throw error;
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload to IPFS" },
      { status: 500 }
    );
  }
}

/**
 * Cấu hình cho API route
 */
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
}; 
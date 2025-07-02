import { type NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-middleware";
import sharp from "sharp";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

// Disable body parsing, we'll handle it ourselves
export const config = {
  api: {
    bodyParser: false,
  },
};

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated via session
    const session = await getServerSession(authOptions);
    let apiKey = req.headers.get("x-api-key") || new URL(req.url).searchParams.get("api_key");

    // If no API key provided and no session, return error
    if (!apiKey && !session) {
      return NextResponse.json({ error: "API key is required or you must be logged in" }, { status: 401 });
    }

    // If API key is provided, validate it
    if (apiKey) {
      const validationError = await validateApiKey(req, apiKey);
      if (validationError) {
        return validationError;
      }
    }

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Check file type
    const fileType = file.type;
    if (!fileType.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = fileType.split("/")[1];
    const fileName = `image_${timestamp}.${fileExtension}`;

    // Convert the file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the image with sharp (resize if needed, optimize, etc.)
    let processedImage: Buffer;
    try {
      processedImage = await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
    } catch (error) {
      console.error("Error processing image with sharp:", error);
      processedImage = buffer; // Fallback to original buffer
    }

    // Upload to Cloudinary
    let uploadResult: UploadApiResponse;
    try {
      uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "image-data",
            public_id: fileName.replace(`.${fileExtension}`, ""),
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              return reject(error);
            }
            if (!result) {
              return reject(new Error("No result returned from Cloudinary"));
            }
            resolve(result);
          }
        );
        stream.end(processedImage);
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return NextResponse.json(
        { error: "Failed to upload image to Cloudinary", details: (error as Error).message },
        { status: 500 }
      );
    }

    // Dapatkan URL gambar dari Cloudinary
    const imageUrl = uploadResult.secure_url;

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image", details: (error as Error).message },
      { status: 500 }
    );
  }
}
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log Cloudinary configuration (tanpa secret untuk keamanan)
    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      has_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    // Ambil daftar gambar dari Cloudinary
    let imageUrls: any[] = [];
    try {
      const result = await cloudinary.api.resources({
        resource_type: "image",
        type: "upload", // Tambahkan parameter type: "upload"
        prefix: "image-data",
        max_results: 100,
      });

      console.log("Cloudinary response:", {
        total_count: result.total_count,
        resources: result.resources.length,
      });

      imageUrls = result.resources.map((resource: UploadApiResponse) => ({
        id: resource.public_id,
        url: resource.secure_url,
        originalFilename: resource.public_id.split("/").pop() + "." + resource.format,
        createdAt: new Date(resource.created_at).getTime(),
        fromCloudinary: true,
      }));
    } catch (cloudinaryError: any) {
      console.error("Cloudinary error details:", {
        message: cloudinaryError.message,
        name: cloudinaryError.name,
        http_code: cloudinaryError.http_code,
        details: cloudinaryError,
      });
      return NextResponse.json(
        {
          error: "Failed to fetch images from Cloudinary",
          details: cloudinaryError.message || "Unknown Cloudinary error",
        },
        { status: 500 }
      );
    }

    // Sortir berdasarkan createdAt secara descending (terbaru dulu)
    imageUrls.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(imageUrls);
  } catch (error: any) {
    console.error("General error fetching images:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Gagal memuat gambar", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Path to the image-data directory
    const imageDir = path.join(process.cwd(), "public", "image-data");

    // Check if directory exists
    try {
      await fs.access(imageDir);
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(imageDir, { recursive: true });
      return NextResponse.json({ images: [] });
    }

    // Read all files in the directory
    const files = await fs.readdir(imageDir);

    // Filter for image files
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"].includes(ext);
    });

    return NextResponse.json({
      success: true,
      scanned: imageFiles.length,
      images: imageFiles.map((file) => ({
        url: `/image-data/${file}`,
        originalFilename: file,
      })),
    });
  } catch (error) {
    console.error("Error scanning images:", error);
    return NextResponse.json({ error: "Failed to scan images" }, { status: 500 });
  }
}
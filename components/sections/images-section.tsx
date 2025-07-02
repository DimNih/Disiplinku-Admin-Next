"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/translations";
import { ImageIcon, Calendar, Info, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/contexts/toast-context";

interface ImageData {
  id: string;
  url: string;
  originalFilename?: string;
  createdAt: number;
  fromCloudinary?: boolean;
}

interface ImagesSectionProps {
  language: string;
  setImagePopupSrc: (src: string) => void;
}

export default function ImagesSection({ language, setImagePopupSrc }: ImagesSectionProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadInfo, setUploadInfo] = useState({ visible: false });
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  const t = translations[language as keyof typeof translations] || translations.id;
  const { showToast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/images", {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t["system-error"] || "Failed to fetch images");
      }

      const data = await response.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error loading images:", error);
      setError(error.message || t["system-error"] || "Failed to load image list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await fetch(`/api/images/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete image");
      }

      setImages((prev) => prev.filter((image) => image.id !== id));
      showToast(t["success"], t["image-deleted"] || "Image successfully deleted", "success");
      console.log(`Image deleted: ${id}`);
    } catch (error: any) {
      console.error("Error deleting image:", error);
      setError(error.message || t["error-deleting-image"] || "Failed to delete image");
      showToast(t["error"], error.message || t["error-deleting-image"] || "Failed to delete image", "error");
    }
  };

  const toggleUploadInfo = () => {
    setUploadInfo((prev) => ({ ...prev, visible: !prev.visible }));
  };

  return (
    <div id="images" className="section">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <i className="material-icons mr-2 text-orange-400">image</i>
        {t["image-post"]}
      </h2>

      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <h3 className="text-lg font-medium">{t["image-list"]}</h3>
        <div className="flex gap-2">
          <Button onClick={loadImages} className="flex items-center gap-2">
            <i className="material-icons mr-2 text-orange-400">refresh</i>
            {t["refresh"] || "Refresh"}
          </Button>
          <Button onClick={toggleUploadInfo} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t["api-upload-info"]}
          </Button>
        </div>
      </div>

      {uploadInfo.visible && (
        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-medium mb-4">{t["api-upload-info"]}</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">{t["endpoint"]}</h4>
              <code className="bg-muted p-2 rounded block mt-1">{window.location.origin}/api/uploadImage</code>
            </div>
            <div>
              <h4 className="font-medium">{t["method"]}</h4>
              <code className="bg-muted p-2 rounded block mt-1">POST</code>
            </div>
            <div>
              <h4 className="font-medium">{t["headers"]}</h4>
              <code className="bg-muted p-2 rounded block mt-1">x-api-key: YOUR_API_KEY</code>
            </div>
            <div>
              <h4 className="font-medium">{t["body"]}</h4>
              <code className="bg-muted p-2 rounded block mt-1">image: [file]</code>
            </div>
            <div>
              <h4 className="font-medium">{t["example-curl"]}</h4>
              <code className="bg-muted p-2 rounded block mt-1 text-xs overflow-x-auto whitespace-pre">
                {`curl -X POST \\
  ${window.location.origin}/api/uploadImage \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/your/image.jpg"`}
              </code>
            </div>
            <div>
              <h4 className="font-medium">{t["alternative"]}</h4>
              <code className="bg-muted p-2 rounded block mt-1 text-xs overflow-x-auto whitespace-pre">
                {`curl -X POST \\
  "${window.location.origin}/api/uploadImage?api_key=YOUR_API_KEY" \\
  -F "image=@/path/to/your/image.jpg"`}
              </code>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 flex items-center justify-center">
          <i className="material-icons mr-2 text-sm">error</i>
          {error}
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.originalFilename || `${t["image"]} ${index + 1}`}
                  onClick={() => setImagePopupSrc(image.url)}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3
                    className="font-medium text-foreground flex items-center truncate"
                    title={image.originalFilename || `${t["image"]} ${index + 1}`}
                  >
                    <ImageIcon className="h-4 w-4 mr-2 text-orange-400 flex-shrink-0" />
                    {image.originalFilename || `${t["image"]} ${index + 1}`}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteImageId(image.id)}
                    title={t["delete-image"] || "Delete Image"}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-orange-400 flex-shrink-0" />
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
                {image.fromCloudinary && (
                  <p className="text-xs text-blue-500 mt-1">
                    <i className="material-icons text-xs mr-1 align-text-bottom">cloud</i>
                    {t["from-cloudinary"] || "From Cloudinary"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center p-8 bg-card rounded-lg">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">{t["no-images"]}</p>
        </div>
      )}

      <AlertDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t["confirm-delete-image"] || "Confirm Delete Image"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t["confirm-delete-description"] ||
                "Are you sure you want to delete this image? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t["batal"]}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteImageId) handleDeleteImage(deleteImageId);
                setDeleteImageId(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t["delete"] || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
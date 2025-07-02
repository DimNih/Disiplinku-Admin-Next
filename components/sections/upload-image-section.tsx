"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Check, AlertCircle, Key } from "lucide-react"

interface UploadImageSectionProps {
  language: string
}

export default function UploadImageSection({ language }: UploadImageSectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [apiKeys, setApiKeys] = useState<{ key: string; createdAt: number }[]>([])
  const [selectedApiKey, setSelectedApiKey] = useState<string>("")
  const [isLoadingKeys, setIsLoadingKeys] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    message: string
    imageUrl?: string
    firebaseUrl?: string
  } | null>(null)

  const t = translations[language as keyof typeof translations] || translations.id

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    setIsLoadingKeys(true)
    try {
      const response = await fetch("/api/apikeys")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.apikeys && data.apikeys.length > 0) {
          setApiKeys(data.apikeys)
          setSelectedApiKey(data.apikeys[0].key)
        }
      }
    } catch (error) {
      console.error("Error loading API keys:", error)
    } finally {
      setIsLoadingKeys(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)

      // Reset upload result
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append("image", file)

      // Add API key to the URL if selected
      let url = "/api/uploadImage"
      if (selectedApiKey) {
        url += `?api_key=${selectedApiKey}`
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: t["peringatan-berhasil"],
          imageUrl: result.imageUrl,
          firebaseUrl: result.firebaseUrl,
        })
        // Reset file and preview
        setFile(null)
        setPreview(null)
        // Reset file input
        const fileInput = document.getElementById("image-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setUploadResult({
          success: false,
          message: result.error || t["peringatan-gagal"],
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadResult({
        success: false,
        message: t["peringatan-gagal"],
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div id="upload-image" className="section">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <i className="material-icons mr-2 text-orange-400">cloud_upload</i>
        {t["upload-image"]}
      </h2>

      <div className="max-w-2xl mx-auto">
        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <div className="space-y-4">
            {apiKeys.length > 0 && (
              <div>
                <label htmlFor="api-key-select" className="block text-sm font-medium mb-2 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  {t["select-api-key"]}
                </label>
                <select
                  id="api-key-select"
                  value={selectedApiKey}
                  onChange={(e) => setSelectedApiKey(e.target.value)}
                  className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                >
                  {apiKeys.map((key, index) => (
                    <option key={index} value={key.key}>
                      {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 8)} (
                      {new Date(key.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">{t["api-key-description"]}</p>
              </div>
            )}

            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
                {t["select-image"]}
              </label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {preview && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">{t["preview"]}:</p>
                <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {file?.name} ({(file?.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}

            <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  {t["uploading"]}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t["upload-btn"]}
                </>
              )}
            </Button>
          </div>
        </div>

        {uploadResult && (
          <div
            className={`p-4 rounded-lg ${uploadResult.success ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}
          >
            <div className="flex items-start">
              {uploadResult.success ? (
                <Check className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{uploadResult.message}</p>
                {uploadResult.imageUrl && (
                  <p className="mt-1 text-sm">
                    {t["image-url"]}{" "}
                    <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">{uploadResult.imageUrl}</code>
                  </p>
                )}
                {uploadResult.firebaseUrl && (
                  <p className="mt-1 text-sm">
                    {t["firebase-url"]}{" "}
                    <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">{uploadResult.firebaseUrl}</code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">{t["api-instructions"]}</h3>
          <div className="bg-muted p-4 rounded-lg">
            <p className="mb-2">{t["api-usage"]}:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>{t["api-step1"]}</li>
              <li>
                {t["api-step2"]}{" "}
                <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">
                  {window.location.origin}/api/uploadImage
                </code>
              </li>
              <li>
                {t["api-step3"]} <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">x-api-key</code>
              </li>
              <li>
                {t["api-step4"]} <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">image</code>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

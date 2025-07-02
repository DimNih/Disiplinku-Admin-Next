"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"

interface ImagePopupProps {
  src: string
  isOpen: boolean
  onClose: () => void
  language?: string
}

export default function ImagePopup({ src, isOpen, onClose, language = "id" }: ImagePopupProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const t = translations[language as keyof typeof translations] || translations.id

  useEffect(() => {
    // Reset scale and rotation when opening a new image
    if (isOpen) {
      setScale(1)
      setRotation(0)
    }

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Initial check
    checkIfMobile()

    // Add resize listener
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [isOpen])

  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const link = document.createElement("a")
    link.href = src
    link.download = src.split("/").pop() || "image"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose()
    if (e.key === "+" || e.key === "=") handleZoomIn()
    if (e.key === "-") handleZoomOut()
    if (e.key === "r") handleRotate()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-85 z-50 p-4"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Mobile controls at the top */}
          {isMobile && (
            <div className="absolute top-4 left-0 right-0 flex justify-center space-x-2 z-10">
              <div className="bg-black bg-opacity-50 rounded-full p-1 flex space-x-1">
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomIn()
                  }}
                  title={t["zoom-in"]}
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomOut()
                  }}
                  title={t["zoom-out"]}
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRotate()
                  }}
                  title={t["rotate"]}
                >
                  <RotateCw className="h-5 w-5" />
                </button>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload()
                  }}
                  title={t["download"]}
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                  onClick={onClose}
                  title={t["close-image"]}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop controls at the top right */}
          {!isMobile && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomIn()
                }}
                title={t["zoom-in"]}
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomOut()
                }}
                title={t["zoom-out"]}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRotate()
                }}
                title={t["rotate"]}
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload()
                }}
                title={t["download"]}
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
                onClick={onClose}
                title={t["close-image"]}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-[90%] max-h-[90%] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-auto max-w-full max-h-[90vh]">
              <motion.img
                src={src || "/placeholder.svg"}
                alt="Full Image"
                className="object-contain rounded-lg shadow-2xl"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  maxWidth: "100%",
                  maxHeight: "80vh",
                }}
                transition={{ duration: 0.2 }}
              />
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
              {t["zoom"]}: {Math.round(scale * 100)}%{rotation > 0 && ` | ${t["rotation"]}: ${rotation}°`}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

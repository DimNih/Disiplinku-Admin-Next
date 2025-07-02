"use client"

import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"
import { useToast } from "@/contexts/toast-context"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, AlertTriangle, User, School, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WarningModalProps {
  isOpen: boolean
  onClose: () => void
  student: {
    nis: string
    name: string
    kelas: string
  }
  language: string
}

export default function WarningModal({ isOpen, onClose, student, language }: WarningModalProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { showToast } = useToast()

  const t = translations[language as keyof typeof translations] || translations.id

  useEffect(() => {
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
  }, [])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!message.trim()) {
      showToast(t["validation-error"], t["pesan-kosong"], "error")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/warning/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nis: student.nis,
          message,
          timestamp: Date.now(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t["peringatan-gagal"])
      }

      showToast(t["success"], t["peringatan-berhasil"], "success")
      setMessage("")
      onClose()
    } catch (error) {
      console.error("Error submitting warning:", error)
      showToast(
        t["error"],
        `${t["peringatan-gagal"]}: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-card p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-600 flex items-center">
                <AlertTriangle className="mr-2 text-orange-400 h-5 w-5" />
                {t["beri-peringatan"]}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mb-4">
              <p className="text-foreground flex items-center text-sm">
                <User className="mr-2 text-blue-500 h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{student.name}</span>
              </p>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <School className="mr-2 text-orange-400 h-4 w-4 flex-shrink-0" />
                <span>{`${t["kelas"]}: ${student.kelas}`}</span>
              </div>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <FileText className="mr-2 text-orange-400 h-4 w-4 flex-shrink-0" />
                <span>{`NIS: ${student.nis}`}</span>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="warning-message" className="block text-sm font-medium mb-2 text-foreground">
                {t["warning-message"]}
              </label>
              <textarea
                id="warning-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border rounded-lg mb-1 focus:ring-2 focus:ring-orange-400 bg-background text-foreground resize-none"
                rows={4}
                placeholder={t["warning-message"]}
              />
              <p className="text-xs text-muted-foreground">{t["warning-description"]}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex items-center justify-center order-2 sm:order-1"
              >
                <X className="mr-2 h-4 w-4" />
                {t["batal"]}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    {t["processing"]}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t["kirim"]}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

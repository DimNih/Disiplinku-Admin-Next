"use client"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info" | "default"
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  // Use a state to track rendered toasts to prevent duplicate keys
  const [renderedToasts, setRenderedToasts] = useState<Toast[]>([])

  useEffect(() => {
    // Update rendered toasts when toasts change
    // This ensures each toast has a unique key based on its position in the array
    setRenderedToasts(toasts)
  }, [toasts])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {renderedToasts.map((toast, index) => (
          <motion.div
            key={`${toast.id}-${index}`}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : toast.type === "warning"
                    ? "bg-orange-500 text-white"
                    : toast.type === "info"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
            }`}
          >
            <div className="flex-1">
              <h4 className="font-medium text-sm">{toast.title}</h4>
              {toast.description && <p className="text-xs mt-1 opacity-90">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

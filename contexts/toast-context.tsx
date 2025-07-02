"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useRef } from "react"
import { ToastContainer } from "@/components/ui/toast-container"

type ToastType = "success" | "error" | "warning" | "info" | "default"

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (title: string, description?: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastCounter = useRef(0)

  const showToast = useCallback((title: string, description?: string, type: ToastType = "default") => {
    // Use a counter to ensure unique IDs
    const id = `toast-${Date.now()}-${toastCounter.current++}`
    const newToast = { id, title, description, type }

    setToasts((prev) => [...prev, newToast])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

"use client"

import { useState, useRef } from "react"

type ToastType = "default" | "success" | "error" | "warning" | "info"

interface ToastState {
  id: number
  open: boolean
  title: string
  description?: string
  type: ToastType
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])
  const toastCounter = useRef(0)

  const toast = (title: string, description?: string, type: ToastType = "default", duration = 5000) => {
    // Use a counter to ensure unique IDs
    const id = Date.now() + toastCounter.current++
    const newToast = { id, open: true, title, description, type, duration }
    setToasts((prev) => [...prev, newToast])

    // Auto dismiss
    setTimeout(() => {
      dismissToast(id)
    }, duration)

    return id
  }

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (title: string, description?: string, duration?: number) =>
    toast(title, description, "success", duration)

  const error = (title: string, description?: string, duration?: number) => toast(title, description, "error", duration)

  const warning = (title: string, description?: string, duration?: number) =>
    toast(title, description, "warning", duration)

  const info = (title: string, description?: string, duration?: number) => toast(title, description, "info", duration)

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss: dismissToast,
  }
}

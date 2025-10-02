"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, title, description, type = "info", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5",
        {
          "bg-green-50 ring-green-200": type === "success",
          "bg-red-50 ring-red-200": type === "error",
          "bg-blue-50 ring-blue-200": type === "info",
        },
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            {title && (
              <p
                className={cn("text-sm font-medium", {
                  "text-green-800": type === "success",
                  "text-red-800": type === "error",
                  "text-blue-800": type === "info",
                })}
              >
                {title}
              </p>
            )}
            {description && (
              <p
                className={cn("mt-1 text-sm", {
                  "text-green-700": type === "success",
                  "text-red-700": type === "error",
                  "text-blue-700": type === "info",
                })}
              >
                {description}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className={cn("inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2", {
                "text-green-400 hover:text-green-500 focus:ring-green-500": type === "success",
                "text-red-400 hover:text-red-500 focus:ring-red-500": type === "error",
                "text-blue-400 hover:text-blue-500 focus:ring-blue-500": type === "info",
              })}
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastProps[]
  onClose: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
      <div className="flex flex-col space-y-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}

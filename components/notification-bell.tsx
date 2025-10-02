"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/notifications")
        const data = await response.json()

        if (data.success) {
          setUnreadCount(data.data.unreadCount)
        }
      } catch (error) {
        console.error("Error fetching notification count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    router.push("/notifications")
  }

  return (
    <Button variant="ghost" size="sm" className={`relative ${className}`} onClick={handleClick} disabled={loading}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  )
}

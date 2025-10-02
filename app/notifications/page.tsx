"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Bell, Package, Truck, Clock, CreditCard, Tag, Settings, Trash2, ExternalLink, CheckCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Notification {
  id: string
  type: "order" | "delivery" | "order_window" | "subscription" | "promotion" | "system"
  title: string
  description: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  actionText?: string
}

interface NotificationsData {
  notifications: Notification[]
  unreadCount: number
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order":
      return <Package className="h-5 w-5 text-blue-500" />
    case "delivery":
      return <Truck className="h-5 w-5 text-green-500" />
    case "order_window":
      return <Clock className="h-5 w-5 text-orange-500" />
    case "subscription":
      return <CreditCard className="h-5 w-5 text-purple-500" />
    case "promotion":
      return <Tag className="h-5 w-5 text-pink-500" />
    case "system":
      return <Settings className="h-5 w-5 text-gray-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

const getRelativeTime = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }
}

export default function NotificationsPage() {
  const [notificationsData, setNotificationsData] = useState<NotificationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()

  const fetchNotifications = async (filter = "all") => {
    try {
      setLoading(true)
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/notifications?filter=${filter}`)
      const data = await response.json()

      if (data.success) {
        setNotificationsData(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications(activeFilter)
  }, [activeFilter])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/notifications/${notificationId}/read`, {
        method: "PUT",
      })

      const data = await response.json()

      if (data.success) {
        setNotificationsData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            notifications: prev.notifications.map((notif) =>
              notif.id === notificationId ? { ...notif, isRead: true } : notif,
            ),
            unreadCount: Math.max(0, prev.unreadCount - 1),
          }
        })
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/notifications/${notificationId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setNotificationsData((prev) => {
          if (!prev) return prev
          const notification = prev.notifications.find((n) => n.id === notificationId)
          return {
            notifications: prev.notifications.filter((notif) => notif.id !== notificationId),
            unreadCount: notification && !notification.isRead ? prev.unreadCount - 1 : prev.unreadCount,
          }
        })
        toast({
          title: "Notification Deleted",
          description: "The notification has been removed.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/notifications/mark-all-read", {
        method: "PUT",
      })

      const data = await response.json()

      if (data.success) {
        setNotificationsData((prev) => {
          if (!prev) return prev
          return {
            notifications: prev.notifications.map((notif) => ({ ...notif, isRead: true })),
            unreadCount: 0,
          }
        })
        toast({
          title: "All Notifications Read",
          description: "All notifications have been marked as read.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      })
    }
  }

  const handleNotificationAction = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const filterTabs = [
    { id: "all", label: "All", icon: Bell },
    { id: "order", label: "Orders", icon: Package },
    { id: "delivery", label: "Deliveries", icon: Truck },
    { id: "promotion", label: "Promotions", icon: Tag },
    { id: "system", label: "System", icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your orders, deliveries, and account activities</p>
          </div>
          {notificationsData && notificationsData.unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notification Count */}
        {notificationsData && (
          <div className="flex items-center space-x-4 mb-6">
            <Badge variant="secondary" className="text-sm">
              {notificationsData.notifications.length} Total
            </Badge>
            {notificationsData.unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {notificationsData.unreadCount} Unread
              </Badge>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            {filterTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {filterTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              {/* Notifications List */}
              {notificationsData && notificationsData.notifications.length > 0 ? (
                <div className="space-y-4">
                  {notificationsData.notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`transition-all duration-200 hover:shadow-md ${
                        !notification.isRead ? "border-primary/20 bg-primary/5" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Notification Icon */}
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold text-foreground">{notification.title}</h3>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-sm mb-2">{notification.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {getRelativeTime(notification.timestamp)}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2 ml-4">
                                {notification.actionUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNotificationAction(notification)}
                                  >
                                    {notification.actionText}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No notifications</h2>
                    <p className="text-muted-foreground">
                      {activeFilter === "all"
                        ? "You're all caught up! No notifications to show."
                        : `No ${activeFilter} notifications to show.`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

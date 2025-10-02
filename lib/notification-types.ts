export interface Notification {
  id: string
  type: "order" | "delivery" | "order_window" | "subscription" | "promotion" | "system"
  title: string
  description: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  actionText?: string
}

export interface NotificationsData {
  notifications: Notification[]
  unreadCount: number
}

export interface NotificationPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  whatsappNotifications: boolean
  deliveryReminders: boolean
  orderUpdates: boolean
  promotionalEmails: boolean
  orderWindowAlerts: boolean
  subscriptionReminders: boolean
  systemUpdates: boolean
}

export interface NotificationFilters {
  type?: "all" | "order" | "delivery" | "order_window" | "subscription" | "promotion" | "system"
  isRead?: boolean
  dateRange?: "all" | "today" | "week" | "month"
}

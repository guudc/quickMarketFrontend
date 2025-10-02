export interface OrderItem {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    pricePerKg: number
    images: string[]
    category: string
  }
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled"
  totalAmount: number
  deliveryDate: string
  deliveryPoint: string
  createdAt: string
  paymentStatus: "paid" | "pending" | "failed"
  paymentMethod: string
  deliveryType: "pickup" | "home"
}

export interface OrderDetails extends Order {
  deliveryFees: number
  subtotal: number
  timeline: TimelineEvent[]
}

export interface TimelineEvent {
  status: string
  timestamp: string
  description: string
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  location: string
  isVerified: boolean
  joinedDate: string
  subscription: {
    id: string
    packageName: string
    slots: number
    slotsUsed: number
    slotsRemaining: number
    renewalDate: string
    isActive: boolean
  }
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    whatsappNotifications: boolean
    deliveryReminders: boolean
  }
  paymentMethods: Array<{
    id: string
    type: string
    last4: string
    brand: string
    isDefault: boolean
  }>
}

export interface OrderFilters {
  status?: "all" | "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled"
  search?: string
  dateRange?: "all" | "week" | "month"
}

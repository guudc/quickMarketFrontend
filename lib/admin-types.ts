export interface AdminUser {
  id: string
  name: string
  email: string
  role: "super_admin" | "ops_manager" | "customer_support" | "finance"
  permissions: string[]
  avatar?: string
  lastLogin?: string
  isActive: boolean
}

export interface AdminAction {
  id: string
  action: string
  timestamp: string
  adminId: string
  adminName: string
  details: any
  entityType: "product" | "order" | "user" | "system"
  entityId?: string
}

export interface DashboardStats {
  totalOrders: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  activeSubscriptions: number
  totalRevenue: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  pendingOrders: number
  outOfStockItems: number
  activeUsers: number
  recentOrders: AdminOrder[]
  lowStockAlerts: LowStockAlert[]
  systemStatus: SystemStatus
}

export interface AdminOrder {
  id: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: AdminOrderItem[]
  status: "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled"
  totalAmount: number
  deliveryDate: string
  deliveryPoint: string
  deliveryType: "pickup" | "home"
  createdAt: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod: string
  notes?: string
  location: string
}

export interface AdminOrderItem {
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

export interface AdminProduct {
  id: string
  name: string
  category: string
  subcategory?: string
  pricePerKg: number
  stockQty: number
  availabilityStatus: "Available" | "Out of Stock" | "Seasonal"
  images: string[]
  description: string
  location: string
  origin?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  locationPricing?: LocationPricing[]
}

export interface LocationPricing {
  location: string
  pricePerKg: number
}

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  isVerified: boolean
  joinedDate: string
  lastLoginDate?: string
  subscription: {
    id: string
    packageName: string
    slots: number
    slotsUsed: number
    slotsRemaining: number
    renewalDate: string
    isActive: boolean
  }
  orderHistory: AdminOrder[]
  totalSpent: number
  isActive: boolean
  supportTickets: number
}

export interface LowStockAlert {
  productId: string
  productName: string
  currentStock: number
  minimumStock: number
  location: string
  category: string
}

export interface SystemStatus {
  database: "healthy" | "warning" | "error"
  paymentGateway: "healthy" | "warning" | "error"
  deliverySystem: "healthy" | "warning" | "error"
  notifications: "healthy" | "warning" | "error"
}

export interface BulkAction {
  action: "activate" | "deactivate" | "update_price" | "update_stock" | "delete"
  productIds: string[]
  data?: any
}

export interface OrderStatusUpdate {
  orderId: string
  status: AdminOrder["status"]
  notes?: string
  notifyCustomer: boolean
}

export interface ProductFormData {
  name: string
  category: string
  subcategory?: string
  pricePerKg: number
  stockQty: number
  availabilityStatus: "Available" | "Out of Stock" | "Seasonal"
  description: string
  location: string
  origin?: string
  images: File[]
  locationPricing?: LocationPricing[]
}

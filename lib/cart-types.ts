export interface CartItem {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    pricePerKg: number
    images: string[]
    category: string
    stockQty: number
    availabilityStatus: string
  }
}

export interface UserSubscription {
  id: string
  userId: string
  packageId: string
  packageName: string
  slots: number
  quantityLimits: {
    perItemMax: number
  }
  locationId: string
  isActive: boolean
  startDate: string
  endDate: string
  slotsUsed: number
  slotsRemaining: number
}

export interface PickupPoint {
  id: string
  name: string
  address: string
  fee: number
}

export interface DeliveryInfo {
  type: "pickup" | "home"
  pickupPointId?: string
  homeAddress?: string
  specialInstructions?: string
}

export interface OrderWindow {
  isOpen: boolean
  nextOpenDate: string
  currentDay: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  deliveryInfo: DeliveryInfo
  totalAmount: number
  slotUsage: number
  status: "confirmed" | "processing" | "delivered" | "cancelled"
  orderDate: string
  deliveryDate: string
  paymentStatus: "pending" | "paid" | "failed"
}

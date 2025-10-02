export interface OrderTracking {
  orderId: string
  status: "pending" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled"
  timeline: OrderEvent[]
  deliveryInfo: {
    assignedDate: string
    timeSlot: string
    address: string
    partnerId?: string
    partnerName?: string
    partnerPhone?: string
    estimatedTime?: string
    actualDeliveryTime?: string
    deliveryPhoto?: string
  }
  items: OrderItem[]
  totals: OrderTotals
  modificationAllowed: boolean
  trackingUpdates: TrackingUpdate[]
  deliveryPartner?: DeliveryPartner
}

export interface OrderEvent {
  status: string
  timestamp: string
  description: string
  completed: boolean
  location?: string
  notes?: string
}

export interface TrackingUpdate {
  id: string
  timestamp: string
  status: string
  location: string
  description: string
  estimatedArrival?: string
}

export interface DeliveryPartner {
  id: string
  name: string
  phone: string
  photo?: string
  rating: number
  vehicleInfo: string
  currentLocation?: {
    lat: number
    lng: number
  }
}

export interface OrderTotals {
  subtotal: number
  deliveryFees: number
  serviceFee: number
  total: number
}

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

export interface OrderModification {
  type: "add_item" | "remove_item" | "change_quantity" | "change_address" | "cancel_order"
  itemId?: string
  newQuantity?: number
  newAddress?: string
  reason?: string
}

export interface DeliveryFeedback {
  orderId: string
  deliveryRating: number
  productQualityRating: number
  deliveryPartnerRating: number
  comments?: string
  issues?: string[]
}

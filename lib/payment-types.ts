export interface PaymentResult {
  status: "success" | "failed" | "pending" | "timeout"
  reference: string
  amount: number
  message: string
  orderId?: string
  failureReason?:
    | "insufficient_funds"
    | "card_declined"
    | "network_error"
    | "invalid_card"
    | "limit_exceeded"
    | "3ds_failed"
}

export interface PaymentReceipt {
  orderId: string
  paymentReference: string
  amount: number
  paymentMethod: string
  timestamp: string
  items: OrderItem[]
  deliveryInfo: DeliveryDetails
}

export interface DeliveryDetails {
  type: "pickup" | "home"
  address?: string
  pickupPoint?: string
  deliveryDate: string
  timeSlot: string
}

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  pricePerKg: number
  totalPrice: number
}

export interface PaymentFailureReason {
  code: string
  title: string
  description: string
  action: string
}

export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  name: string
  count: number
}

export interface FAQData {
  faqs: FAQ[]
  categories: FAQCategory[]
}

export interface SupportTicket {
  id: string
  userId: string
  type: "order" | "delivery" | "subscription" | "payment" | "technical" | "general"
  subject: string
  message: string
  orderId?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "resolved" | "closed"
  createdAt: string
  updatedAt: string
  responses: SupportResponse[]
}

export interface SupportResponse {
  id: string
  ticketId: string
  message: string
  sender: "user" | "support"
  timestamp: string
  attachments?: string[]
}

export interface SupportFormData {
  type: string
  subject: string
  message: string
  orderId?: string
  priority: string
}

export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
}

export interface SupportContact {
  type: "chat" | "whatsapp" | "email" | "phone"
  label: string
  value: string
  isAvailable: boolean
  responseTime?: string
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  phone?: string
  phoneVerified: boolean
  dateOfBirth?: string
  gender?: string
  language: string
  profilePicture?: string
  location: string
  joinedDate: string
  profileCompletion: number
  subscription: {
    id: string
    packageName: string
    slots: number
    slotsUsed: number
    slotsRemaining: number
    renewalDate: string
    isActive: boolean
  }
  preferences: UserPreferences
}

export interface UserPreferences {
  // Communication channels
  emailNotifications: boolean
  smsNotifications: boolean
  whatsappNotifications: boolean

  // Notification types
  deliveryReminders: boolean
  orderUpdates: boolean
  promotionalEmails: boolean
  marketingCommunications: boolean

  // Privacy settings
  dataSharing: boolean
  profileVisibility: "private" | "public"

  // Delivery preferences
  delivery?: {
    preferredTimeSlot?: string
    specialInstructions?: string
    defaultAddressId?: string
  }
}

export interface Address {
  id: string
  nickname: string
  fullAddress: string
  isDefault: boolean
  type: "residential" | "commercial"
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  lastPasswordChange: string
  activeSessions: LoginSession[]
}

export interface LoginSession {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

export interface ProfileValidation {
  emailVerified: boolean
  phoneVerified: boolean
  profileComplete: boolean
  requiredFields: string[]
}

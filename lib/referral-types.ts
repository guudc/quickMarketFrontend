export interface ReferralCode {
  userId: string
  code: string
  createdAt: string
  totalUses: number
  successfulReferrals: number
  pendingReferrals: number
  totalEarned: number
  isActive: boolean
}

export interface ReferralReward {
  id: string
  referrerId: string
  refereeId: string
  referralCode: string
  status: "pending" | "completed" | "expired"
  referrerReward: number
  refereeReward: number
  createdAt: string
  completedAt?: string
  expiresAt: string
  orderId?: string
}

export interface UserCredits {
  userId: string
  availableCredits: number
  pendingCredits: number
  totalEarned: number
  lastUpdated: string
}

export interface ReferralStats {
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  conversionRate: number
  thisMonthReferrals: number
  lifetimeEarnings: number
  availableCredits: number
  pendingCredits: number
  vipStatus: boolean
}

export interface ShareMessage {
  platform: "whatsapp" | "sms" | "email" | "facebook" | "twitter"
  message: string
  url: string
}

export interface ReferralActivity {
  id: string
  type: "referral_sent" | "referral_signup" | "referral_completed" | "reward_earned" | "credit_used"
  description: string
  amount?: number
  timestamp: string
  refereeEmail?: string
}

// Reward structure constants
export const REFERRAL_REWARDS = {
  REFERRER_REWARD: 500, // NGN 500 for referrer
  REFEREE_REWARD: 300, // NGN 300 for referee
  BONUS_THRESHOLD: 5, // Every 5 successful referrals
  BONUS_AMOUNT: 200, // NGN 200 bonus
  VIP_THRESHOLD: 10, // VIP status after 10 referrals
  CREDIT_EXPIRY_DAYS: 90, // Credits expire after 90 days
} as const

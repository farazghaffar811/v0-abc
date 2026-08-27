export type Currency = "INR" | "USD"

export interface UserProfile {
  uid: string
  email: string
  username?: string
  displayName?: string
  phoneNumber?: string
  address?: string
  balance: number
  realBalance: number
  currency?: Currency
  avatar?: string
  phone?: string
  direction?: string
  frozenAmount: number
  creditScore: number
  status: "active" | "inactive" | "suspended" | "frozen"
  withdrawalStatus: "allowed" | "prohibited"
  withdrawalProhibited: boolean
  isFrozen: boolean
  ban: "none" | "temporary" | "permanent"
  reputation: number
  referralCode: string
  referralCount: number
  referredBy?: string
  isAdmin?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  symbol: string
  type: "buy" | "sell"
  amount: number
  price: number
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "trade" | "referral"
  amount: number
  status: "pending" | "completed" | "failed"
  description: string
  createdAt: Date
}

export interface Withdrawal {
  id: string
  userId: string
  amount: number
  currency?: Currency
  method: "bank" | "crypto"
  address?: string
  network?: string
  bankDetails?: {
    accountNumber: string
    routingNumber: string
    bankName: string
  }
  status: "pending" | "approved" | "rejected" | "completed"
  createdAt: Date
  processedAt?: Date
}

export interface DepositRequest {
  id: string
  userId: string
  amount: number
  method: "bank" | "crypto"
  status: "pending" | "approved" | "rejected"
  proofImage?: string
  createdAt: Date
  processedAt?: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  createdAt: Date
}

export interface Announcement {
  id: string
  message: string
  createdAt: Date
  readAt?: Date
  isRead: boolean
  fromAdmin: boolean
}

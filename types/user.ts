export interface UserProfile {
  uid: string
  email: string
  referralCode: string
  balance: number
  referredBy?: string
  referralCount: number
  createdAt: Date
  frozenAmount?: number
  creditScore?: number
}

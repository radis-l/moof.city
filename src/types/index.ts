// Types for Fortune Tell Website

export interface UserData {
  email: string
  ageRange: string
  birthDay: string
  bloodGroup: string
  timestamp?: string
}

export interface FortuneResult {
  luckyNumber: number
  relationship: string
  work: string
  health: string
  generatedAt: string
}

export interface FortuneResponse {
  success: boolean
  data?: FortuneResult
  error?: string
}

// Form validation types
export type AgeRange = '<18' | '18-25' | '26-35' | '36-45' | '46-55' | '55+'
export type BirthDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export type BloodGroup = 'A' | 'B' | 'AB' | 'O'
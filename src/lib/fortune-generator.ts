import type { UserData, FortuneResult, AgeRange, BirthDay, BloodGroup } from '@/types'
import {
  relationshipMessages,
  relationshipModifiers,
  workMessages,
  workModifiers,
  healthMessages,
  healthModifiers
} from '@/data/fortunes'

// Helper functions for number generation
const getAgeMultiplier = (ageRange: AgeRange): number => {
  const multipliers = { '<18': 5, '18-25': 7, '26-35': 11, '36-45': 13, '46-55': 17, '55+': 19 }
  return multipliers[ageRange] || 11
}

const getDayMultiplier = (birthDay: BirthDay): number => {
  const multipliers = {
    'Monday': 2, 'Tuesday': 3, 'Wednesday': 5, 'Thursday': 7,
    'Friday': 11, 'Saturday': 13, 'Sunday': 17
  }
  return multipliers[birthDay] || 7
}

const getBloodMultiplier = (bloodGroup: BloodGroup): number => {
  const multipliers = { 'A': 3, 'B': 5, 'AB': 7, 'O': 11 }
  return multipliers[bloodGroup] || 7
}

// Create deterministic selection based on user data seed
const createSeededSelector = (userData: UserData) => {
  const { ageRange, birthDay, bloodGroup } = userData
  
  // Create a consistent seed from user data
  const ageMultiplier = getAgeMultiplier(ageRange as AgeRange)
  const dayMultiplier = getDayMultiplier(birthDay as BirthDay)
  const bloodMultiplier = getBloodMultiplier(bloodGroup as BloodGroup)
  const baseSeed = (ageMultiplier * 31 + dayMultiplier * 17 + bloodMultiplier * 13) % 1000
  
  // Return a function that generates deterministic "random" numbers
  return (index: number, arrayLength: number): number => {
    const seed = (baseSeed + index * 23) % 997 // Use prime numbers for better distribution
    return seed % arrayLength
  }
}

// Fortune generation based on user data
export const generateFortune = (userData: UserData): FortuneResult => {
  const { ageRange, birthDay, bloodGroup } = userData

  // Create deterministic selector for this user
  const selectIndex = createSeededSelector(userData)

  // Generate lucky number based on user data
  const luckyNumber = generateLuckyNumber(ageRange, birthDay, bloodGroup)

  // Generate personalized predictions
  const relationship = generateRelationshipFortune(birthDay, bloodGroup, selectIndex)
  const work = generateWorkFortune(ageRange, birthDay, selectIndex)
  const health = generateHealthFortune(bloodGroup, ageRange, selectIndex)

  return {
    luckyNumber,
    relationship,
    work,
    health,
    generatedAt: new Date().toISOString()
  }
}

// Generate single lucky number (2-digits: 10-99) based on user attributes
const generateLuckyNumber = (
  ageRange: string,
  birthDay: string,
  bloodGroup: string
): number => {
  // Create seed from user data for consistent results
  const ageMultiplier = getAgeMultiplier(ageRange as AgeRange)
  const dayMultiplier = getDayMultiplier(birthDay as BirthDay)
  const bloodMultiplier = getBloodMultiplier(bloodGroup as BloodGroup)

  // Generate lucky number between 10-99 (2 digits)
  const seed = (ageMultiplier + dayMultiplier + bloodMultiplier) % 90 + 10
  const luckyNumber = ((seed * 17) % 90) + 10

  return luckyNumber
}

// Generate relationship fortune using birthDay + bloodGroup combination
const generateRelationshipFortune = (
  birthDay: string,
  bloodGroup: string,
  selectIndex: (index: number, arrayLength: number) => number
): string => {
  const dayMessages = relationshipMessages[birthDay as BirthDay] || relationshipMessages['Monday']
  const bloodModifierMessages = relationshipModifiers[bloodGroup as BloodGroup] || relationshipModifiers['A']

  // Combine deterministic birth day message + blood group modifier
  const baseMessage = dayMessages[selectIndex(0, dayMessages.length)]
  const bloodModifier = bloodModifierMessages[selectIndex(1, bloodModifierMessages.length)]

  return baseMessage + bloodModifier
}

// Generate work fortune
const generateWorkFortune = (
  ageRange: string,
  birthDay: string,
  selectIndex: (index: number, arrayLength: number) => number
): string => {
  const ageTemplates = workMessages[ageRange as AgeRange] || workMessages['26-35']
  const dayModifierMessages = workModifiers[birthDay as BirthDay] || workModifiers['Monday']

  const baseMessage = ageTemplates[selectIndex(2, ageTemplates.length)]
  const dayMessage = dayModifierMessages[selectIndex(3, dayModifierMessages.length)]

  return `${baseMessage} ${dayMessage}`
}

// Generate health fortune
const generateHealthFortune = (
  bloodGroup: string,
  ageRange: string,
  selectIndex: (index: number, arrayLength: number) => number
): string => {
  const bloodTemplates = healthMessages[bloodGroup as BloodGroup] || healthMessages['O']
  const ageAdviceMessages = healthModifiers[ageRange as AgeRange] || healthModifiers['26-35']

  const baseMessage = bloodTemplates[selectIndex(4, bloodTemplates.length)]
  const ageMessage = ageAdviceMessages[selectIndex(5, ageAdviceMessages.length)]

  return `${baseMessage} ${ageMessage}`
}
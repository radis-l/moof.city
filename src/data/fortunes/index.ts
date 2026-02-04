import type { BirthDay, BloodGroup, AgeRange } from '@/types'

// Import JSON files
import relationshipData from './relationship.json'
import relationshipModifiersData from './relationship-modifiers.json'
import workData from './work.json'
import workModifiersData from './work-modifiers.json'
import healthData from './health.json'
import healthModifiersData from './health-modifiers.json'

// Type definitions for fortune data
export type RelationshipMessages = Record<BirthDay, string[]>
export type RelationshipModifiers = Record<BloodGroup, string[]>
export type WorkMessages = Record<AgeRange, string[]>
export type WorkModifiers = Record<BirthDay, string[]>
export type HealthMessages = Record<BloodGroup, string[]>
export type HealthModifiers = Record<AgeRange, string[]>

// Typed exports
export const relationshipMessages: RelationshipMessages = relationshipData as RelationshipMessages
export const relationshipModifiers: RelationshipModifiers = relationshipModifiersData as RelationshipModifiers
export const workMessages: WorkMessages = workData as WorkMessages
export const workModifiers: WorkModifiers = workModifiersData as WorkModifiers
export const healthMessages: HealthMessages = healthData as HealthMessages
export const healthModifiers: HealthModifiers = healthModifiersData as HealthModifiers

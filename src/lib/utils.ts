// Utility functions for the fortune telling app

/**
 * Parse Thai timestamp format "DD/MM/YYYY HH:MM:SS"
 * Handles Thai Buddhist year (BE) to Gregorian year (AD) conversion
 * @param timestamp - Thai format timestamp string
 * @returns Date object or null if parsing fails
 */
export function parseThaiTimestamp(timestamp: string): Date | null {
  try {
    const [datePart, timePart] = timestamp.split(' ')
    if (!datePart || !timePart) return null

    const [day, month, year] = datePart.split('/')
    const [hour, minute, second] = timePart.split(':')
    
    if (!day || !month || !year || !hour || !minute) return null

    // Convert Thai Buddhist year to Gregorian year if needed
    const actualYear = parseInt(year) > 2500 ? parseInt(year) - 543 : parseInt(year)
    
    return new Date(
      actualYear,
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      second ? parseInt(second) : 0
    )
  } catch {
    return null
  }
}

/**
 * Check if a timestamp is within a time range from a reference date
 * @param timestamp - Thai format timestamp string
 * @param referenceDate - Reference date to compare against
 * @param rangeMinutes - Time range in minutes
 * @returns boolean indicating if timestamp is within range
 */
export function isTimestampInRange(
  timestamp: string,
  referenceDate: Date,
  rangeMinutes: number
): boolean {
  const parsedDate = parseThaiTimestamp(timestamp)
  if (!parsedDate) return false
  
  const timeDiff = referenceDate.getTime() - parsedDate.getTime()
  const rangeMills = rangeMinutes * 60 * 1000
  
  return timeDiff >= 0 && timeDiff <= rangeMills
}
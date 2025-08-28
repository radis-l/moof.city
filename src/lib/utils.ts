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

    // Parse and validate numeric values
    const dayNum = parseInt(day)
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    const hourNum = parseInt(hour)
    const minuteNum = parseInt(minute)
    const secondNum = second ? parseInt(second) : 0

    // Validate ranges
    if (dayNum < 1 || dayNum > 31) return null
    if (monthNum < 1 || monthNum > 12) return null
    if (hourNum < 0 || hourNum > 23) return null
    if (minuteNum < 0 || minuteNum > 59) return null
    if (secondNum < 0 || secondNum > 59) return null

    // Convert Thai Buddhist year to Gregorian year if needed
    const actualYear = yearNum > 2500 ? yearNum - 543 : yearNum
    
    const date = new Date(
      actualYear,
      monthNum - 1, // Month is 0-indexed
      dayNum,
      hourNum,
      minuteNum,
      secondNum
    )

    // Check if the date was auto-adjusted by JavaScript (invalid date)
    if (date.getDate() !== dayNum || date.getMonth() !== monthNum - 1 || date.getFullYear() !== actualYear) {
      return null
    }

    return date
  } catch {
    return null
  }
}


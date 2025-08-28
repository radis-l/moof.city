import { test, expect } from '@playwright/test';
import { parseThaiTimestamp, isTimestampInRange } from '../src/lib/utils';

test.describe('Utility Functions Tests', () => {
  test.describe('parseThaiTimestamp', () => {
    test('parses Thai Buddhist year timestamp correctly', () => {
      const timestamp = '27/08/2567 10:30:15';
      const result = parseThaiTimestamp(timestamp);
      
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(2024); // 2567 - 543 = 2024
      expect(result!.getMonth()).toBe(7); // August (0-indexed)
      expect(result!.getDate()).toBe(27);
      expect(result!.getHours()).toBe(10);
      expect(result!.getMinutes()).toBe(30);
      expect(result!.getSeconds()).toBe(15);
    });

    test('parses Gregorian year timestamp correctly', () => {
      const timestamp = '27/08/2024 14:45:30';
      const result = parseThaiTimestamp(timestamp);
      
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(2024);
      expect(result!.getMonth()).toBe(7); // August (0-indexed)
      expect(result!.getDate()).toBe(27);
      expect(result!.getHours()).toBe(14);
      expect(result!.getMinutes()).toBe(45);
      expect(result!.getSeconds()).toBe(30);
    });

    test('handles timestamp without seconds', () => {
      const timestamp = '15/12/2567 09:15';
      const result = parseThaiTimestamp(timestamp);
      
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(2024); // 2567 - 543 = 2024
      expect(result!.getMonth()).toBe(11); // December (0-indexed)
      expect(result!.getDate()).toBe(15);
      expect(result!.getHours()).toBe(9);
      expect(result!.getMinutes()).toBe(15);
      expect(result!.getSeconds()).toBe(0); // Default to 0 seconds
    });

    test('returns null for invalid timestamp format', () => {
      const invalidTimestamps = [
        'invalid-timestamp',
        '2024-08-27 10:30:15', // Wrong format
        '27/08 10:30:15', // Missing year
        '27/08/2024', // Missing time
        '32/13/2024 25:70:80', // Invalid date/time values
        '', // Empty string
      ];

      invalidTimestamps.forEach(timestamp => {
        expect(parseThaiTimestamp(timestamp)).toBeNull();
      });
    });

    test('handles edge cases correctly', () => {
      // Test leap year
      const leapYearTimestamp = '29/02/2567 12:00:00'; // 2024 is leap year
      const leapResult = parseThaiTimestamp(leapYearTimestamp);
      expect(leapResult).not.toBeNull();
      expect(leapResult!.getMonth()).toBe(1); // February
      expect(leapResult!.getDate()).toBe(29);

      // Test end of year
      const endOfYearTimestamp = '31/12/2566 23:59:59';
      const endResult = parseThaiTimestamp(endOfYearTimestamp);
      expect(endResult).not.toBeNull();
      expect(endResult!.getFullYear()).toBe(2023); // 2566 - 543 = 2023
      expect(endResult!.getMonth()).toBe(11); // December
      expect(endResult!.getDate()).toBe(31);
      expect(endResult!.getHours()).toBe(23);
      expect(endResult!.getMinutes()).toBe(59);
      expect(endResult!.getSeconds()).toBe(59);
    });
  });

  test.describe('isTimestampInRange', () => {
    test('correctly identifies timestamp within range', () => {
      const referenceDate = new Date(2024, 7, 27, 15, 0, 0); // Aug 27, 2024 15:00:00
      const timestamp = '27/08/2567 14:30:00'; // 30 minutes before reference
      
      const result = isTimestampInRange(timestamp, referenceDate, 60); // 60-minute range
      expect(result).toBe(true);
    });

    test('correctly identifies timestamp outside range', () => {
      const referenceDate = new Date(2024, 7, 27, 15, 0, 0); // Aug 27, 2024 15:00:00
      const timestamp = '27/08/2567 13:00:00'; // 2 hours before reference
      
      const result = isTimestampInRange(timestamp, referenceDate, 60); // 60-minute range
      expect(result).toBe(false);
    });

    test('correctly identifies future timestamp outside range', () => {
      const referenceDate = new Date(2024, 7, 27, 15, 0, 0); // Aug 27, 2024 15:00:00
      const timestamp = '27/08/2567 16:00:00'; // 1 hour after reference (future)
      
      const result = isTimestampInRange(timestamp, referenceDate, 60); // 60-minute range
      expect(result).toBe(false);
    });

    test('handles invalid timestamp gracefully', () => {
      const referenceDate = new Date(2024, 7, 27, 15, 0, 0);
      const invalidTimestamp = 'invalid-timestamp';
      
      const result = isTimestampInRange(invalidTimestamp, referenceDate, 60);
      expect(result).toBe(false);
    });

    test('handles exact range boundaries correctly', () => {
      const referenceDate = new Date(2024, 7, 27, 15, 0, 0); // Aug 27, 2024 15:00:00
      
      // Exactly at the start of range (60 minutes before)
      const startRangeTimestamp = '27/08/2567 14:00:00';
      expect(isTimestampInRange(startRangeTimestamp, referenceDate, 60)).toBe(true);
      
      // Exactly at reference time
      const exactTimestamp = '27/08/2567 15:00:00';
      expect(isTimestampInRange(exactTimestamp, referenceDate, 60)).toBe(true);
      
      // Just outside range (61 minutes before)
      const outsideRangeTimestamp = '27/08/2567 13:59:00';
      expect(isTimestampInRange(outsideRangeTimestamp, referenceDate, 60)).toBe(false);
    });
  });
});
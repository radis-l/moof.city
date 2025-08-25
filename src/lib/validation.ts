import { z } from 'zod'

export const fortuneFormSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  
  ageRange: z.enum(['<18', '18-25', '26-35', '36-45', '46-55', '55+']),
  
  birthDay: z.enum([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ]),
  
  bloodGroup: z.enum(['A', 'B', 'AB', 'O'])
})

export type FortuneFormData = z.infer<typeof fortuneFormSchema>

// Validation helper
export const validateFortuneForm = (data: unknown) => {
  try {
    return {
      success: true,
      data: fortuneFormSchema.parse(data)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Validation failed'
    }
  }
}
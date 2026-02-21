import { z } from 'zod'

// User validation schemas
export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  user_type: z.enum(['PATIENT', 'DOCTOR']).default('PATIENT'),
  is_verified: z.boolean().default(false),
})

export const CreateUserSchema = UserSchema.omit({ id: true })

// Doctor profile validation schemas
export const DoctorProfileSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  specialization: z.string().min(2, 'Specialization is required'),
  experience: z.string().min(1, 'Experience is required'),
  consultation_fee: z.number().min(0, 'Consultation fee must be positive'),
  qualifications: z.string().optional(),
  languages: z.string().optional(),
  working_hours: z.string().min(1, 'Working hours are required'),
  about: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  review_count: z.number().min(0).default(0),
  is_available: z.boolean().default(true),
  image: z.string().url().optional(),
})

export const CreateDoctorProfileSchema = DoctorProfileSchema.omit({ 
  id: true, 
  rating: true, 
  review_count: true 
})

// Patient profile validation schemas
export const PatientProfileSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
})

export const CreatePatientProfileSchema = PatientProfileSchema.omit({ id: true })

// Appointment validation schemas
export const AppointmentSchema = z.object({
  id: z.string().optional(),
  patient_id: z.string().min(1, 'Patient ID is required'),
  doctor_id: z.string().min(1, 'Doctor ID is required'),
  date: z.string().min(1, 'Date is required'), // Accept YYYY-MM-DD format
  time: z.string().min(1, 'Time is required'), // Accept any time format for now
  consultation_type: z.enum(['IN_PERSON', 'VIDEO', 'in-person', 'video']).transform(val => 
    val.toUpperCase() as 'IN_PERSON' | 'VIDEO'
  ).default('IN_PERSON'),
  consultation_fee: z.number().min(0),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled']).transform(val => 
    val.toUpperCase() as 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
  ).default('SCHEDULED'),
  reason: z.string().optional(),
  notes: z.string().optional(),
  prescription: z.string().optional(),
  diagnosis: z.string().optional(),
})

export const CreateAppointmentSchema = AppointmentSchema.omit({ 
  id: true, 
  status: true, 
  prescription: true, 
  diagnosis: true 
})

export const UpdateAppointmentSchema = AppointmentSchema.partial().omit({ 
  id: true, 
  patient_id: true, 
  doctor_id: true 
})

// Time slot validation schemas
export const TimeSlotSchema = z.object({
  id: z.string().uuid().optional(),
  doctor_profile_id: z.string().uuid(),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  is_available: z.boolean().default(true),
  slot_type: z.enum(['MORNING', 'AFTERNOON', 'EVENING']).default('MORNING'),
  duration: z.number().min(15).max(120).default(30), // Duration in minutes
})

export const CreateTimeSlotSchema = TimeSlotSchema.omit({ id: true })

// Notification validation schemas
export const NotificationSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['APPOINTMENT_BOOKING', 'APPOINTMENT_REMINDER', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'GENERAL', 'SYSTEM']).default('GENERAL'),
  is_read: z.boolean().default(false),
  metadata: z.string().optional(),
})

export const CreateNotificationSchema = NotificationSchema.omit({ id: true, is_read: true })

// Authentication validation schemas
export const LoginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
})

export const OTPVerificationSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  sessionId: z.string().min(1, 'Session ID is required'),
})

// Search validation schemas
export const DoctorSearchSchema = z.object({
  query: z.string().optional(),
  specialization: z.string().optional(),
  location: z.string().optional(),
  available: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
})

// Booking validation schemas
export const BookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  consultationType: z.enum(['IN_PERSON', 'VIDEO']).default('IN_PERSON'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

// Profile update validation schemas
export const UpdateUserProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
})

export const UpdateDoctorProfileSchema = z.object({
  specialization: z.string().min(2, 'Specialization is required').optional(),
  experience: z.string().min(1, 'Experience is required').optional(),
  consultation_fee: z.number().min(0, 'Consultation fee must be positive').optional(),
  qualifications: z.string().optional(),
  languages: z.string().optional(),
  working_hours: z.string().min(1, 'Working hours are required').optional(),
  about: z.string().optional(),
  is_available: z.boolean().optional(),
  image: z.string().url().optional(),
})

export const UpdatePatientProfileSchema = z.object({
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
})

// Error handling types
export type ValidationError = {
  field: string
  message: string
}

export function formatZodErrors(error: z.ZodError): ValidationError[] {
  if (!error || !error.errors || !Array.isArray(error.errors)) {
    return [{ field: 'unknown', message: 'Invalid error format' }];
  }
  
  return error.errors.map(err => ({
    field: err.path?.join('.') || 'unknown',
    message: err.message || 'Validation error'
  }));
}

// Utility function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: ValidationError[]
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    console.log('Validation error details:', error);
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatZodErrors(error) }
    }
    return { success: false, errors: [{ field: 'unknown', message: error instanceof Error ? error.message : 'Validation failed' }] }
  }
}
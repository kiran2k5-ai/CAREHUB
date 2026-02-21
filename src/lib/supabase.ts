import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that require elevated permissions
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
)

// Database types based on your schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          name: string | null
          email: string | null
          user_type: 'PATIENT' | 'DOCTOR'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          email?: string | null
          user_type?: 'PATIENT' | 'DOCTOR'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          email?: string | null
          user_type?: 'PATIENT' | 'DOCTOR'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      doctor_profiles: {
        Row: {
          id: string
          user_id: string
          specialization: string
          experience: string
          consultation_fee: number
          qualifications: string | null
          languages: string | null
          working_hours: string
          about: string | null
          rating: number
          review_count: number
          is_available: boolean
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialization: string
          experience: string
          consultation_fee: number
          qualifications?: string | null
          languages?: string | null
          working_hours: string
          about?: string | null
          rating?: number
          review_count?: number
          is_available?: boolean
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialization?: string
          experience?: string
          consultation_fee?: number
          qualifications?: string | null
          languages?: string | null
          working_hours?: string
          about?: string | null
          rating?: number
          review_count?: number
          is_available?: boolean
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patient_profiles: {
        Row: {
          id: string
          user_id: string
          age: number | null
          gender: string | null
          address: string | null
          emergency_contact: string | null
          blood_group: string | null
          allergies: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number | null
          gender?: string | null
          address?: string | null
          emergency_contact?: string | null
          blood_group?: string | null
          allergies?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number | null
          gender?: string | null
          address?: string | null
          emergency_contact?: string | null
          blood_group?: string | null
          allergies?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          date: string
          time: string
          consultation_type: 'IN_PERSON' | 'VIDEO'
          consultation_fee: number
          status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
          reason: string | null
          notes: string | null
          prescription: string | null
          diagnosis: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          date: string
          time: string
          consultation_type?: 'IN_PERSON' | 'VIDEO'
          consultation_fee: number
          status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
          reason?: string | null
          notes?: string | null
          prescription?: string | null
          diagnosis?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          date?: string
          time?: string
          consultation_type?: 'IN_PERSON' | 'VIDEO'
          consultation_fee?: number
          status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
          reason?: string | null
          notes?: string | null
          prescription?: string | null
          diagnosis?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'APPOINTMENT_BOOKING' | 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_RESCHEDULED' | 'GENERAL' | 'SYSTEM'
          is_read: boolean
          metadata: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'APPOINTMENT_BOOKING' | 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_RESCHEDULED' | 'GENERAL' | 'SYSTEM'
          is_read?: boolean
          metadata?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'APPOINTMENT_BOOKING' | 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_RESCHEDULED' | 'GENERAL' | 'SYSTEM'
          is_read?: boolean
          metadata?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_slots: {
        Row: {
          id: string
          doctor_profile_id: string
          date: string
          time: string
          is_available: boolean
          slot_type: 'MORNING' | 'AFTERNOON' | 'EVENING'
          duration: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_profile_id: string
          date: string
          time: string
          is_available?: boolean
          slot_type?: 'MORNING' | 'AFTERNOON' | 'EVENING'
          duration?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_profile_id?: string
          date?: string
          time?: string
          is_available?: boolean
          slot_type?: 'MORNING' | 'AFTERNOON' | 'EVENING'
          duration?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
// Simplified database service for new schema
import { supabase } from './supabase'

export class SimpleDatabaseService {
  
  // User operations
  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async getUserByPhone(phone: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Doctor operations
  static async getAllDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  static async getDoctorById(id: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Appointment operations
  static async createAppointment(appointmentData: any) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getAppointmentsByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getAppointmentsByDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getAllAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
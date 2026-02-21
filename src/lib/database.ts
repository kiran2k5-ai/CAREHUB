import { supabase, supabaseAdmin, Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']
type DoctorProfile = Database['public']['Tables']['doctor_profiles']['Row']
type PatientProfile = Database['public']['Tables']['patient_profiles']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']
type TimeSlot = Database['public']['Tables']['time_slots']['Row']

export class DatabaseService {
  public supabase: any
  
  constructor() {
    this.supabase = supabase
  }

  // Use admin client for server-side operations
  static getClient() {
    // Use admin client on server-side, regular client on client-side
    return typeof window === 'undefined' ? supabaseAdmin : supabase;
  }

  // User operations
  static async createUser(userData: {
    phone: string
    name?: string
    email?: string
    user_type?: 'PATIENT' | 'DOCTOR'
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserByPhone(phone: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        doctor_profiles(*),
        patient_profiles(*)
      `)
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        doctor_profiles(*),
        patient_profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Doctor operations
  static async getAllDoctors(filters?: {
    specialization?: string
    available?: boolean
    location?: string
  }) {
    let query = supabase
      .from('doctor_profiles')
      .select(`
        *,
        users!inner(*)
      `)

    if (filters?.specialization) {
      query = query.ilike('specialization', `%${filters.specialization}%`)
    }

    if (filters?.available !== undefined) {
      query = query.eq('is_available', filters.available)
    }

    const { data, error } = await query.order('rating', { ascending: false })

    if (error) throw error
    return data
  }

  static async getDoctorById(id: string) {
    // Simple query without complex foreign key relationships
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*, users(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async getDoctorByUserId(userId: string) {
    // Simple query without complex foreign key relationships
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*, users(*)')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  static async createDoctorProfile(profileData: Database['public']['Tables']['doctor_profiles']['Insert']) {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .insert([profileData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateDoctorProfile(id: string, updates: Partial<DoctorProfile>) {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Patient operations
  static async getPatientByUserId(userId: string) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select(`
        *,
        users!inner(*),
        appointments(
          *,
          doctor_profiles!appointments_doctor_id_fkey(
            *,
            users!doctor_profiles_user_id_fkey(*)
          )
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async createPatientProfile(profileData: Database['public']['Tables']['patient_profiles']['Insert']) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .insert([profileData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updatePatientProfile(id: string, updates: Partial<PatientProfile>) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Appointment operations
  static async createAppointment(appointmentData: Database['public']['Tables']['appointments']['Insert']) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single()

    if (error) throw error

    // Mark time slot as unavailable
    if (data) {
      await this.markTimeSlotUnavailable(data.doctor_id, data.date, data.time)
    }

    return data
  }

  static async getAppointmentsByPatientId(patientId: string) {
    // Simple query without complex foreign key relationships
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false })

    if (error) throw error

    // Manually fetch doctor details for each appointment
    if (data && data.length > 0) {
      const enrichedAppointments = await Promise.all(
        data.map(async (appointment) => {
          // Get doctor details
          const { data: doctorProfile } = await supabase
            .from('doctor_profiles')
            .select(`
              *,
              users(*)
            `)
            .eq('id', appointment.doctor_id)
            .single()

          return {
            ...appointment,
            doctor_profile: doctorProfile
          }
        })
      )
      return enrichedAppointments
    }

    return data
  }

  static async getAppointmentsByDoctorId(doctorId: string) {
    console.log('🔍 DatabaseService: Looking for appointments for doctor:', doctorId);
    
    const client = this.getClient(); // Use admin client on server-side
    
    // Try direct query first (if doctor_id directly matches)
    let { data, error } = await client
      .from('appointments')
      .select(`
        *
      `)
      .eq('doctor_id', doctorId)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ DatabaseService: Error fetching appointments directly:', error);
      throw error;
    }

    console.log('📊 DatabaseService: Found', data?.length || 0, 'appointments');

    // If no appointments found with direct doctor_id, try with doctor_profiles table
    if (!data || data.length === 0) {
      console.log('🔄 DatabaseService: Trying doctor_profiles lookup...');
      
      // Try getting doctor profile ID from user ID
      const { data: doctorProfile } = await client
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', doctorId)
        .single();

      if (doctorProfile) {
        const { data: profileAppointments, error: profileError } = await client
          .from('appointments')
          .select(`
            *
          `)
          .eq('doctor_id', doctorProfile.id)
          .order('date', { ascending: false });

        if (!profileError && profileAppointments) {
          data = profileAppointments;
          console.log('📊 DatabaseService: Found', data.length, 'appointments via doctor_profiles');
        }
      }
    }

    // Manually fetch patient details for each appointment
    if (data && data.length > 0) {
      const enrichedAppointments = await Promise.all(
        data.map(async (appointment) => {
          // Get patient details
          const { data: patientUser } = await client
            .from('users')
            .select('*')
            .eq('id', appointment.patient_id)
            .single();

          return {
            ...appointment,
            users: patientUser
          };
        })
      );

      console.log('✅ DatabaseService: Enriched appointments with patient data');
      return enrichedAppointments;
    }

    console.log('⚠️ DatabaseService: No appointments found');
    return data || [];
  }

  static async updateAppointment(id: string, updates: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        users!appointments_patient_id_fkey(*),
        doctor_profiles!appointments_doctor_id_fkey(
          *,
          users!doctor_profiles_user_id_fkey(*)
        )
      `)
      .single()

    if (error) throw error
    return data
  }

  static async cancelAppointment(id: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Make time slot available again
    if (data) {
      await this.markTimeSlotAvailable(data.doctor_id, data.date, data.time)
    }

    return data
  }

  // Time slot operations
  static async getAvailableTimeSlots(doctorProfileId: string, date: string) {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('doctor_profile_id', doctorProfileId)
      .eq('date', date)
      .eq('is_available', true)
      .order('time')

    if (error) throw error
    return data
  }

  static async createTimeSlots(slots: Database['public']['Tables']['time_slots']['Insert'][]) {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(slots)
      .select()

    if (error) throw error
    return data
  }

  static async markTimeSlotUnavailable(doctorId: string, date: string, time: string) {
    // First get doctor profile id
    const { data: doctorProfile } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', doctorId)
      .single()

    if (!doctorProfile) return

    const { error } = await supabase
      .from('time_slots')
      .update({ is_available: false })
      .eq('doctor_profile_id', doctorProfile.id)
      .eq('date', date)
      .eq('time', time)

    if (error) throw error
  }

  static async markTimeSlotAvailable(doctorId: string, date: string, time: string) {
    // First get doctor profile id
    const { data: doctorProfile } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', doctorId)
      .single()

    if (!doctorProfile) return

    const { error } = await supabase
      .from('time_slots')
      .update({ is_available: true })
      .eq('doctor_profile_id', doctorProfile.id)
      .eq('date', date)
      .eq('time', time)

    if (error) throw error
  }

  // Notification operations
  static async createNotification(notificationData: Database['public']['Tables']['notifications']['Insert']) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getNotificationsByUserId(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async markNotificationAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async markAllNotificationsAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return data
  }

  // Search operations
  static async searchDoctors(query: string, filters?: { specialization?: string }) {
    let searchQuery = supabase
      .from('doctor_profiles')
      .select(`
        *,
        users!inner(*)
      `)

    if (query) {
      searchQuery = searchQuery.or(`specialization.ilike.%${query}%,users.name.ilike.%${query}%`)
    }

    if (filters?.specialization) {
      searchQuery = searchQuery.ilike('specialization', `%${filters.specialization}%`)
    }

    const { data, error } = await searchQuery.order('rating', { ascending: false })

    if (error) throw error
    return data
  }

  // Dashboard statistics
  static async getDoctorDashboardStats(doctorId: string) {
    const [appointmentsToday, totalAppointments, unreadNotifications] = await Promise.all([
      supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('doctor_id', doctorId)
        .gte('date', new Date().toISOString().split('T')[0])
        .lt('date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      
      supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('doctor_id', doctorId),
      
      supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', doctorId)
        .eq('is_read', false)
    ])

    return {
      appointmentsToday: appointmentsToday.count || 0,
      totalAppointments: totalAppointments.count || 0,
      unreadNotifications: unreadNotifications.count || 0
    }
  }

  static async getPatientDashboardStats(patientId: string) {
    const [upcomingAppointments, totalAppointments, unreadNotifications] = await Promise.all([
      supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientId)
        .gte('date', new Date().toISOString())
        .in('status', ['SCHEDULED', 'CONFIRMED']),
      
      supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientId),
      
      supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', patientId)
        .eq('is_read', false)
    ])

    return {
      upcomingAppointments: upcomingAppointments.count || 0,
      totalAppointments: totalAppointments.count || 0,
      unreadNotifications: unreadNotifications.count || 0
    }
  }
}
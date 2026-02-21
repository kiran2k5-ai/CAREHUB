import { DatabaseService } from '@/lib/database';

// Service that uses only real database data - no mock fallback
export class HybridDataService {
  static async getAppointmentsByDoctorId(doctorId: string) {
    // Only use real database data - no mock fallback
    console.log('🔍 DatabaseService: Looking for appointments for doctor:', doctorId);
    const dbResult = await DatabaseService.getAppointmentsByDoctorId(doctorId);
    console.log('✅ Successfully fetched', dbResult?.length || 0, 'appointments for doctor', doctorId);
    return dbResult;
  }

  static async createAppointment(appointmentData: any) {
    // Only use real database data - no mock fallback
    const dbResult = await DatabaseService.createAppointment(appointmentData);
    console.log('✅ Appointment created in database:', dbResult.id);
    return dbResult;
  }

  static async getAppointmentsByPatientId(patientId: string) {
    // Only use real database data - no mock fallback
    const dbResult = await DatabaseService.getAppointmentsByPatientId(patientId);
    console.log('✅ Successfully fetched', dbResult?.length || 0, 'appointments for patient', patientId);
    return dbResult;
  }
}
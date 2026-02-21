// MOCK DATA DISABLED - Using only real database data
// This file is kept for reference but not used in production

/* 
ALL MOCK DATA HAS BEEN DISABLED
System now uses only Supabase database
*/

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  location: string;
  availability: string;
  nextSlot: string;
  image: string;
  isAvailable: boolean;
  distance: string;
  languages: string[];
  qualifications: string[];
  about: string;
  workingDays: string[];
  workingHours: string;
  hospitalId?: string;
  phoneNumber?: string;
  email?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  type: 'morning' | 'afternoon' | 'evening';
  date: string;
  doctorId: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  status: 'scheduled' | 'completed' | 'cancelled';
  consultationFee: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
}

// ALL MOCK DATA ARRAYS HAVE BEEN EMPTIED
export const mockDoctors: Doctor[] = [];
export const mockTimeSlots: TimeSlot[] = [];
export const mockAppointments: Appointment[] = [];

// Helper functions return empty arrays - use database instead
export const findDoctorById = (id: string): Doctor | undefined => {
  console.warn('findDoctorById called - use DatabaseService instead');
  return undefined;
};

export const searchDoctors = (query: string, specialty?: string): Doctor[] => {
  console.warn('searchDoctors called - use DatabaseService instead');
  return [];
};

export const getTimeSlotsByDoctor = (doctorId: string, date: string): TimeSlot[] => {
  console.warn('getTimeSlotsByDoctor called - use DatabaseService instead');
  return [];
};

export const bookAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
  console.error('bookAppointment called - use DatabaseService instead');
  throw new Error('Mock data disabled - use DatabaseService.createAppointment instead');
};

// Fallback doctor data for when API fails
export const fallbackDoctors = [
  {
    id: 'c9e8d234-ae56-4f78-9a02-345678901bcd',
    name: 'Dr. Michael Chen',
    specialization: 'Cardiology',
    experience: '8+ years',
    rating: 4.8,
    reviewCount: 127,
    consultationFee: 600,
    location: 'Online',
    availability: 'Available today',
    nextSlot: '9:00 AM - 7:00 PM',
    image: '/api/placeholder/150/150',
    isAvailable: true,
    distance: '0 km',
    languages: ['English', 'Chinese'],
    qualifications: ['MBBS', 'MD Cardiology'],
    about: 'Experienced Cardiologist with 8+ years of practice in treating heart conditions.',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: '9:00 AM - 7:00 PM',
    phoneNumber: '9876543210',
    email: 'michael.chen@hospital.com'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Dr. Prakash Das',
    specialization: 'General Medicine',
    experience: '10+ years',
    rating: 4.5,
    reviewCount: 89,
    consultationFee: 500,
    location: 'Online',
    availability: 'Available today',
    nextSlot: '9:00 AM - 7:00 PM',
    image: '/api/placeholder/150/150',
    isAvailable: true,
    distance: '0 km',
    languages: ['English', 'Hindi'],
    qualifications: ['MBBS', 'MD Internal Medicine'],
    about: 'Experienced General Medicine practitioner with 10+ years of practice.',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: '9:00 AM - 7:00 PM',
    phoneNumber: '9042222856',
    email: 'prakash.das@hospital.com'
  }
];

// Fallback appointment data for when API fails
export const fallbackAppointments = [
  {
    id: 'appt-demo-001',
    doctorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    doctorName: 'Dr. Prakash Das',
    doctorSpecialization: 'General Medicine',
    doctorPhone: '9042222856',
    date: '2025-10-12',
    time: '10:00',
    reason: 'Regular checkup',
    status: 'confirmed',
    consultationType: 'in-person',
    consultationFee: 500,
    notes: 'Routine health examination',
    createdAt: '2025-10-10T08:00:00Z',
    updatedAt: '2025-10-10T08:00:00Z'
  },
  {
    id: 'appt-demo-002',
    doctorId: 'c9e8d234-ae56-4f78-9a02-345678901bcd',
    doctorName: 'Dr. Michael Chen',
    doctorSpecialization: 'Cardiology',
    doctorPhone: '9876543210',
    date: '2025-10-15',
    time: '14:30',
    reason: 'Heart checkup',
    status: 'confirmed',
    consultationType: 'video',
    consultationFee: 600,
    notes: 'Follow-up cardiac consultation',
    createdAt: '2025-10-10T09:15:00Z',
    updatedAt: '2025-10-10T09:15:00Z'
  }
];

export function getFallbackDoctor(doctorId: string) {
  return fallbackDoctors.find(doctor => doctor.id === doctorId) || fallbackDoctors[0];
}

export function getFallbackAppointments(patientId: string) {
  // Return demo appointments for the specific patient
  return fallbackAppointments.map(apt => ({
    ...apt,
    patientId: patientId
  }));
}
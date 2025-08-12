import {
  Patient,
  Appointment,
  Diagnosis,
  Prescription,
  TreatmentNote,
  Document,
} from './types';

export const patient: Patient = {
  id: 'p001',
  name: 'John Doe',
  age: 32,
  gender: 'Male',
  contact: '9876543210',
};

export const appointments: Appointment[] = [
  { id: 'a1', date: '2025-08-01', doctor: 'Dr. Smith', department: 'Cardiology' },
  { id: 'a2', date: '2025-07-15', doctor: 'Dr. Ray', department: 'Dermatology' },
];

export const diagnoses: Diagnosis[] = [
  { id: 'd1', date: '2025-08-01', notes: 'Mild hypertension detected.' },
];

export const prescriptions: Prescription[] = [
  {
    id: 'pr1',
    date: '2025-08-01',
    medicines: ['Amlodipine 5mg', 'Paracetamol 500mg'],
  },
];

export const treatmentNotes: TreatmentNote[] = [
  {
    id: 'tn1',
    date: '2025-08-01',
    note: 'Recommended regular exercise and dietary changes.',
  },
];

export const documents: Document[] = [
  { id: 'doc1', fileName: 'blood_report.pdf', uploadedAt: '2025-08-01' },
];

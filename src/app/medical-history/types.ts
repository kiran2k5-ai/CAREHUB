// types.ts
export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact?: string;
};

export type Appointment = {
  id: string;
  date: string;
  doctor: string;
  department: string;
};

export type Diagnosis = {
  id: string;
  date: string;
  notes: string;
};

export type Prescription = {
  id: string;
  date: string;
  medicines: string[];
};

export type TreatmentNote = {
  id: string;
  date: string;
  note: string;
};

export type Document = {
  id: string;
  fileName: string;
  uploadedAt: string;
};

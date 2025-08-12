'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const mockData = [
  {
    id: '123',
    name: 'John Doe',
    history: [
      {
        date: '2025-08-01',
        diagnosis: 'Fever',
        prescription: 'Paracetamol 500mg',
        notes: 'Take every 6 hours after food.',
        doctor: 'Dr. Smith',
      },
    ],
  },
  {
    id: '456',
    name: 'Alice Smith',
    history: [
      {
        date: '2025-08-05',
        diagnosis: 'Migraine',
        prescription: 'Pain relievers',
        notes: 'Avoid screen time, reduce caffeine.',
        doctor: 'Dr. Sharma',
      },
    ],
  },
  {
    id: '789',
    name: 'Robert Johnson',
    history: [
      {
        date: '2025-07-20',
        diagnosis: 'Sprained ankle',
        prescription: 'RICE method',
        notes: 'Use ankle brace if needed.',
        doctor: 'Dr. Patel',
      },
    ],
  },
];

interface Props {
  params: {
    patientId: string;
  };
}

export default function PatientMedicalHistory({ params }: Props) {
  const { patientId } = params;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    const found = mockData.find((p) => p.id === patientId);
    setPatient(found || null);
  }, [patientId]);

  const downloadPDF = (entry: any) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('🩺 Clinic Prescription', 20, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${entry.date}`, 20, 35);
    doc.text(`Patient Name: ${patient.name}`, 20, 45);
    doc.text(`Patient ID: ${patientId}`, 20, 52);
    doc.text(`Doctor: ${entry.doctor || 'N/A'}`, 20, 62);

    doc.setFontSize(14);
    doc.text('Diagnosis:', 20, 75);
    doc.setFontSize(12);
    doc.text(entry.diagnosis, 30, 83);

    doc.setFontSize(14);
    doc.text('Prescription:', 20, 98);
    doc.setFontSize(12);
    doc.text(entry.prescription, 30, 106);

    const notesY = 116;
    doc.setFontSize(14);
    doc.text('Notes:', 20, notesY);
    doc.setFontSize(12);
    doc.text(entry.notes, 30, notesY + 8);

    doc.setFontSize(10);
    doc.text('Clinic Address: 123 Health Street, Wellness City, India', 20, 280);

    doc.save(`Prescription_${patient.name}_${entry.date}.pdf`);
  };

  if (!patient) {
    return (
      <main className="p-6 bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-black mb-4">🩺 Medical History</h1>
        <p className="text-red-600 text-lg">❌ No patient found with ID: {patientId}</p>
      </main>
    );
  }

  return (
    <main className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-black text-center mb-2">🩺 Medical History</h1>
      <h2 className="text-lg text-gray-700 text-center mb-6">
        Patient: <span className="font-semibold">{patient.name}</span> (ID: {patientId})
      </h2>
      <div className="space-y-4">
        {[...patient.history].reverse().map((entry: any, index: number) => (
          <div
            key={index}
            className="border rounded-lg shadow-sm p-4 bg-gray-100 transition-all duration-300"
            style={{ marginLeft: 'auto', marginRight: 'auto', width: '85%' }}
          >
            <button
              className="w-full text-left text-blue-700 font-medium flex justify-between items-center"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <span>Date: {entry.date}</span>
              <span>{expandedIndex === index ? '▲ Collapse' : '▼ Expand'}</span>
            </button>

            {expandedIndex === index && (
              <div className="mt-4 text-gray-800">
                <p><strong>Doctor:</strong> {entry.doctor || 'N/A'}</p>
                <p><strong>Diagnosis:</strong> {entry.diagnosis}</p>
                <p className="mt-2"><strong>Prescription:</strong> {entry.prescription}</p>
                <p className="mt-2"><strong>Notes:</strong> {entry.notes}</p>

                <button
                  onClick={() => downloadPDF(entry)}
                  className="mt-4 px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  📄 Download PDF
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

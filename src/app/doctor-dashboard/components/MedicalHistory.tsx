'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import Link from 'next/link';

export default function MedicalHistory({ patientId }: { patientId: string }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mockPatients: Record<string, any> = {
    '123': {
      name: 'John Doe',
      appointments: [
        {
          date: '2025-08-01',
          diagnosis: 'Flu',
          prescriptions: ['Paracetamol', 'Vitamin C'],
        },
        {
          date: '2025-06-15',
          diagnosis: 'Back Pain',
          prescriptions: ['Ibuprofen'],
        },
        {
          date: '2025-05-10',
          diagnosis: 'Allergy',
          prescriptions: ['Cetirizine', 'Nasal Spray'],
        },
        {
          date: '2025-03-22',
          diagnosis: 'Cold',
          prescriptions: ['Antihistamine', 'Cough Syrup'],
        },
      ],
    },
  };

  const patientData = mockPatients[patientId];

  if (!patientData) {
    return (
      <div className="p-6 text-center text-red-500 text-lg font-semibold">
        ❌ No patient found.
      </div>
    );
  }

  const handleDownloadPDF = (appointment: any, index: number) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Prescription`, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Patient Name: ${patientData.name}`, 20, 40);
    doc.text(`Patient ID: ${patientId}`, 20, 50);
    doc.text(`Date: ${appointment.date}`, 20, 60);
    doc.text(`Diagnosis: ${appointment.diagnosis}`, 20, 70);
    doc.text(`Prescriptions:`, 20, 80);

    appointment.prescriptions.forEach((prescription: string, i: number) => {
      doc.text(`- ${prescription}`, 30, 90 + i * 10);
    });

    doc.save(`prescription_${patientId}_${index + 1}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
       

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Medical History
        </h1>

        <div className="text-center text-lg text-gray-600 mb-4">
          Patient: <span className="font-semibold">{patientData.name}</span> (ID: {patientId})
        </div>

        {patientData.appointments.map((appointment: any, index: number) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-5 mb-5 border border-gray-200 transition hover:shadow-lg"
          >
            <div
              className="cursor-pointer text-blue-700 font-medium text-lg flex justify-between items-center"
              onClick={() =>
                setExpandedIndex(index === expandedIndex ? null : index)
              }
            >
              <span>📅 Date: {appointment.date}</span>
              <span className="text-sm text-gray-500">
                {expandedIndex === index ? '▲ Collapse' : '▼ Expand'}
              </span>
            </div>

            {expandedIndex === index && (
              <div className="mt-3 text-gray-700">
                <div className="mb-2">
                  <strong>🩺 Diagnosis:</strong> {appointment.diagnosis}
                </div>
                <div className="mb-4">
                  <strong>💊 Prescriptions:</strong>{' '}
                  {appointment.prescriptions.join(', ')}
                </div>

                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                  onClick={() => handleDownloadPDF(appointment, index)}
                >
                  📄 Download PDF
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

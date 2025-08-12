'use client';
import { prescriptions } from './mockData';

export default function PrescriptionModal() {
  return (
    <section className="bg-white p-4 rounded-lg shadow mt-4">
      <h2 className="text-xl font-semibold mb-2">💊 Prescriptions</h2>
      <ul className="space-y-2">
        {prescriptions.map(p => (
          <li key={p.id} className="border p-2 rounded-md">
            <div><strong>Date:</strong> {p.date}</div>
            <div><strong>Medicines:</strong>
              <ul className="list-disc list-inside ml-2">
                {p.medicines.map((med, index) => (
                  <li key={index}>{med}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
'use client';

import { patient } from './mockData';

export default function PatientProfile() {
  return (
    <section className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">🧑‍🤝‍🧑 Patient Profile</h2>
      <ul className="space-y-1">
        <li><strong>Name:</strong> {patient.name}</li>
        <li><strong>Age:</strong> {patient.age}</li>
        <li><strong>Gender:</strong> {patient.gender}</li>
        <li><strong>Contact:</strong> {patient.contact}</li>
      </ul>
    </section>
  );
}

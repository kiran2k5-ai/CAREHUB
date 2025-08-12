'use client';
import { appointments } from './mockData';

export default function AppointmentHistory() {
  return (
    <section className="bg-white p-4 rounded-lg shadow mt-4">
      <h2 className="text-xl font-semibold mb-2">📅 Appointment History</h2>
      <ul className="space-y-2">
        {appointments.map(app => (
          <li key={app.id} className="border p-2 rounded-md">
            <div><strong>Date:</strong> {app.date}</div>
            <div><strong>Doctor:</strong> {app.doctor}</div>
            <div><strong>Department:</strong> {app.department}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

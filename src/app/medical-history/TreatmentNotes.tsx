'use client';
import { treatmentNotes } from './mockData';

export default function TreatmentNotes() {
  return (
    <section className="bg-white p-4 rounded-lg shadow mt-4">
      <h2 className="text-xl font-semibold mb-2">🗒️ Treatment Notes</h2>
      <ul className="space-y-2">
        {treatmentNotes.map(note => (
          <li key={note.id} className="border p-2 rounded-md">
            <div><strong>Date:</strong> {note.date}</div>
            <div><strong>Note:</strong> {note.note}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

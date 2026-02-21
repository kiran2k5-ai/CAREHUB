'use client';
import { documents } from './mockData';

export default function DocumentUploads() {
  return (
    <section className="bg-white p-4 rounded-lg shadow mt-4">
      <h2 className="text-xl font-semibold mb-2">📂 Document Uploads</h2>
      <ul className="space-y-2">
        {documents.map(doc => (
          <li key={doc.id} className="border p-2 rounded-md">
            <div><strong>File:</strong> {doc.fileName}</div>
            <div><strong>Uploaded At:</strong> {doc.uploadedAt}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
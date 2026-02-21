// app/medical-history/layout.tsx
import React from 'react';

export default function MedicalHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Optional layout wrapper like a sidebar, header, etc. */}
      {children}
    </div>
  );
}

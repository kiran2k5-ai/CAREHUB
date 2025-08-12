"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Home, Bell, User } from 'lucide-react';

const mockData = [
  { id: '123', name: 'John Doe' },
  { id: '456', name: 'Alice Smith' },
  { id: '789', name: 'Robert Johnson' },
];

export default function PatientList() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Content */}
      <div className="flex-grow py-10 px-4 sm:px-10">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-10">
          🩺 Patient Medical History
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {mockData.map((patient) => (
            <Link
              key={patient.id}
              href={`/medical-history/${patient.id}`}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-6 text-center shadow-sm transition duration-300 ease-in-out"
            >
              <p className="text-lg font-semibold text-gray-800">{patient.name}</p>
              <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow z-50">
        <div className="flex justify-around items-center py-2">
          <NavItem href="/" icon={<Home size={20} />} label="Home" active={pathname === "/"} />
          <NavItem href="/appointments" icon={<CalendarDays size={20} />} label="Appointments" active={pathname === "/appointments"} />
          <NavItem href="/notifications" icon={<Bell size={20} />} label="Notifications" active={pathname === "/notifications"} badgeCount={2} />
          <NavItem href="/profile" icon={<User size={20} />} label="Profile" active={pathname === "/profile"} />
        </div>
      </footer>
    </div>
  );
}

function NavItem({ href, icon, label, active, badgeCount = 0 }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badgeCount?: number;
}) {
  return (
    <Link href={href} className="relative flex flex-col items-center text-xs text-gray-500 hover:text-blue-600 transition-all">
      <div className={`flex items-center justify-center ${active ? 'text-blue-600' : ''}`}>
        {icon}
        {badgeCount > 0 && (
          <span className="absolute top-[-4px] right-[-10px] bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {badgeCount}
          </span>
        )}
      </div>
      <span className={`mt-1 ${active ? 'text-blue-600 font-semibold' : ''}`}>{label}</span>
    </Link>
  );
}

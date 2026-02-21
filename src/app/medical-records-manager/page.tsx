'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authUtils';
import AuthGuard from '@/components/AuthGuard';
import MedicalRecordsManager from '@/components/MedicalRecordsManager';
import AddMedicalRecordModal from '@/components/AddMedicalRecordModal';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function MedicalRecordsManagerPage() {
  const { getAuth } = useAuth();
  const router = useRouter();
  const [showAddRecord, setShowAddRecord] = useState(false);

  // Get current user
  const authData = getAuth();
  const user = authData?.userData;
  const isDoctorView = authData?.userType === 'doctor';

  const handleRecordAdded = () => {
    setShowAddRecord(false);
    // Force refresh by re-rendering the component
    window.location.reload();
  };

  if (!isDoctorView) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">Only doctors can access the medical records manager.</p>
            <button
              onClick={() => router.push('/patient-dashboard')}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Go to Patient Dashboard
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/doctor-dashboard')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Back to Dashboard"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Medical Records Manager</h1>
                  <p className="text-gray-600 mt-1">
                    Manage patient medical records, prescriptions, and medical history
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">How to use Medical Records Manager:</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Select a patient from your patient list below</li>
              <li>View their existing medical records and history</li>
              <li>Add new medical records with diagnosis, prescriptions, and lab reports</li>
              <li>Prescribe medications and track patient progress</li>
              <li>All data is stored securely and accessible to both doctor and patient</li>
            </ol>
          </div>

          {/* Medical Records Manager Component */}
          <MedicalRecordsManager
            doctorId={user?.id || '0697ef6b-563a-4e8f-8ba5-689056a5d385'}
            viewMode="doctor"
          />
        </div>
      </div>
    </AuthGuard>
  );
}
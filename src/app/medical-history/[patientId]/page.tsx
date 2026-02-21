'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authUtils';
import AuthGuard from '@/components/AuthGuard';
import MedicalRecordsManager from '@/components/MedicalRecordsManager';
import AddMedicalRecordModal from '@/components/AddMedicalRecordModal';

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default function MedicalHistoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { getAuth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);

  // Get current user
  const authData = getAuth();
  const user = authData?.userData;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // For patient view, we might already have user info
        if (user?.user_type === 'patient' && user.id === resolvedParams.patientId) {
          setPatient(user);
        } else {
          // Fetch patient details for doctor view
          const response = await fetch(`/api/patients/${resolvedParams.patientId}`);
          if (response.ok) {
            const data = await response.json();
            setPatient(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.patientId) {
      fetchPatient();
    }
  }, [resolvedParams.patientId, user]);

  const handleRecordAdded = () => {
    // Refresh the medical records by re-rendering the component
    setShowAddRecord(false);
    // You can add a key prop to MedicalRecordsManager and update it here to force re-render
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </AuthGuard>
    );
  }

  const isDoctorView = user?.user_type === 'doctor';
  const isPatientView = user?.user_type === 'patient';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {isPatientView ? 'My Medical History' : `Medical History - ${patient?.name || 'Patient'}`}
                </h1>
                {patient && (
                  <div className="mt-2">
                    <p className="text-gray-600">{patient.email}</p>
                    {patient.phone && (
                      <p className="text-gray-500 text-sm">{patient.phone}</p>
                    )}
                  </div>
                )}
              </div>
              
              {isDoctorView && patient && (
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Medical Record
                </button>
              )}
            </div>
          </div>

          {/* Medical Records Manager */}
          <MedicalRecordsManager
            patientId={resolvedParams.patientId}
            doctorId={isDoctorView ? user?.id : undefined}
            viewMode={isDoctorView ? 'doctor' : 'patient'}
          />

          {/* Add Medical Record Modal */}
          {showAddRecord && isDoctorView && patient && (
            <AddMedicalRecordModal
              isOpen={showAddRecord}
              onClose={() => setShowAddRecord(false)}
              patientId={resolvedParams.patientId}
              doctorId={user.id}
              onRecordAdded={handleRecordAdded}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

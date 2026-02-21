'use client';

import React, { useState, useEffect } from 'react';
import { User, Calendar, FileText, Plus, Search, Stethoscope, ClipboardList } from 'lucide-react';
import AddMedicalRecordModal from './AddMedicalRecordModal';
import FloatingAddButton from './FloatingAddButton';
import QuickActionsGuide from './QuickActionsGuide';
import StepByStepGuide from './StepByStepGuide';
import AddButtonHighlighter from './AddButtonHighlighter';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
}

interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  diagnosis: string;
  notes?: string;
  doctor?: { name: string };
  patient?: { name: string };
  prescriptions?: Prescription[];
  lab_reports?: LabReport[];
}

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  prescribed_date: string;
}

interface LabReport {
  id: string;
  test_name: string;
  test_date: string;
  results: string;
  normal_range?: string;
  notes?: string;
}

interface MedicalRecordsManagerProps {
  doctorId?: string;
  patientId?: string;
  viewMode?: 'doctor' | 'patient';
}

export default function MedicalRecordsManager({ 
  doctorId, 
  patientId, 
  viewMode = 'doctor' 
}: MedicalRecordsManagerProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHighlighter, setShowHighlighter] = useState(false);

  // Fetch patients for doctor view
  useEffect(() => {
    if (viewMode === 'doctor' && doctorId) {
      fetchPatients();
    }
  }, [viewMode, doctorId]);

  // Auto-select patient in patient view
  useEffect(() => {
    if (viewMode === 'patient' && patientId) {
      // In patient view, we don't need to fetch patient list
      fetchMedicalRecords(patientId);
    }
  }, [viewMode, patientId]);

  // Fetch medical records when patient is selected (doctor view)
  useEffect(() => {
    if (viewMode === 'doctor' && selectedPatient) {
      fetchMedicalRecords(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching patients for doctor:', doctorId);
      const url = doctorId ? `/api/patients?doctorId=${doctorId}` : '/api/patients';
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📊 Patients API response:', data);
      
      if (data.success) {
        setPatients(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} patients`);
      } else {
        console.error('❌ Failed to fetch patients:', data.error);
        // Try fetching all patients as fallback
        if (doctorId) {
          console.log('🔄 Retrying without doctor filter...');
          const fallbackResponse = await fetch('/api/patients');
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            setPatients(fallbackData.data || []);
            console.log(`✅ Fallback loaded ${fallbackData.data?.length || 0} patients`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      // Show a user-friendly message
      alert('Unable to load patients. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async (patId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/medical-records?patientId=${patId}`);
      const data = await response.json();
      if (data.success) {
        setMedicalRecords(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setMedicalRecords([]);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-cyan-600" />
              Medical Records Management
            </h2>
            <p className="text-gray-600 mt-1">
              {viewMode === 'doctor' 
                ? 'Manage patient medical records and prescriptions' 
                : 'View your medical history and prescriptions'}
            </p>
          </div>
          {viewMode === 'doctor' && selectedPatient && (
            <button
              onClick={() => setShowAddRecord(true)}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus className="h-5 w-5" />
              Add Medical Record
            </button>
          )}
        </div>
      </div>

      {/* Step-by-Step Guide for Doctor */}
      {viewMode === 'doctor' && (
        <StepByStepGuide 
          onShowButtons={() => setShowHighlighter(true)}
        />
      )}

      {/* Quick Actions Guide for Doctor */}
      {viewMode === 'doctor' && (
        <QuickActionsGuide
          hasSelectedPatient={!!selectedPatient}
          onAddRecord={() => setShowAddRecord(true)}
        />
      )}

      {/* Patient Selection (Doctor View) */}
      {viewMode === 'doctor' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Select Patient</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddRecord(true)}
                disabled={!selectedPatient}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  selectedPatient
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="h-4 w-4" />
                Add Record
              </button>
              <button
                onClick={fetchPatients}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh Patients
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading patients...</p>
            </div>
          )}

          {/* No Patients Found */}
          {!loading && filteredPatients.length === 0 && (
            <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
              <User className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h4 className="font-medium text-yellow-800 mb-2">No Patients Found</h4>
              <p className="text-yellow-700 mb-4">
                {patients.length === 0 
                  ? "No patients in the database yet." 
                  : "No patients match your search criteria."}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={fetchPatients}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  🔄 Retry Loading
                </button>
                <button
                  onClick={() => window.open('/api/patients', '_blank')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔧 Test API
                </button>
              </div>
            </div>
          )}

          {/* Patients Grid */}
          {!loading && filteredPatients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedPatient?.id === patient.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    onClick={() => handlePatientSelect(patient)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        {patient.phone && (
                          <p className="text-sm text-gray-500">{patient.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedPatient?.id === patient.id && (
                    <div className="mt-3 pt-3 border-t border-cyan-200">
                      <button
                        onClick={() => setShowAddRecord(true)}
                        className="w-full bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Medical Record
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedPatient && (
            <div className="bg-cyan-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800">Selected Patient:</h4>
              <p className="text-cyan-700">{selectedPatient.name}</p>
            </div>
          )}
        </div>
      )}

      {/* Medical Records Display */}
      {(selectedPatient || patientId) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Medical Records</h3>
            {viewMode === 'doctor' && (
              <button
                onClick={() => setShowAddPrescription(true)}
                disabled={!medicalRecords.length}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  medicalRecords.length
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                Add Prescription
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading medical records...</p>
            </div>
          ) : medicalRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No medical records found</p>
              {viewMode === 'doctor' && selectedPatient && (
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Add First Medical Record
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Visit - {formatDate(record.visit_date)}
                      </h4>
                      {record.doctor && (
                        <p className="text-sm text-gray-600">
                          Dr. {record.doctor.name}
                        </p>
                      )}
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {formatDate(record.visit_date)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h5 className="font-medium text-gray-700 mb-1">Diagnosis:</h5>
                    <p className="text-gray-600">{record.diagnosis}</p>
                  </div>

                  {record.notes && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-700 mb-1">Notes:</h5>
                      <p className="text-gray-600">{record.notes}</p>
                    </div>
                  )}

                  {/* Prescriptions */}
                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Prescriptions:
                      </h5>
                      <div className="bg-green-50 p-3 rounded-lg">
                        {record.prescriptions.map((prescription) => (
                          <div key={prescription.id} className="mb-2 last:mb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-green-800">
                                  {prescription.medication_name}
                                </p>
                                <p className="text-sm text-green-700">
                                  {prescription.dosage} - {prescription.frequency}
                                </p>
                                <p className="text-sm text-green-600">
                                  Duration: {prescription.duration}
                                </p>
                                {prescription.instructions && (
                                  <p className="text-sm text-green-600 italic">
                                    {prescription.instructions}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-green-500">
                                {formatDate(prescription.prescribed_date)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Reports */}
                  {record.lab_reports && record.lab_reports.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Lab Reports:</h5>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        {record.lab_reports.map((report) => (
                          <div key={report.id} className="mb-2 last:mb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-blue-800">{report.test_name}</p>
                                <p className="text-sm text-blue-700">Results: {report.results}</p>
                                {report.normal_range && (
                                  <p className="text-sm text-blue-600">
                                    Normal Range: {report.normal_range}
                                  </p>
                                )}
                                {report.notes && (
                                  <p className="text-sm text-blue-600 italic">{report.notes}</p>
                                )}
                              </div>
                              <span className="text-xs text-blue-500">
                                {formatDate(report.test_date)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Add Button */}
      <FloatingAddButton
        onClick={() => setShowAddRecord(true)}
        disabled={viewMode !== 'doctor' || !selectedPatient}
        label="Add Medical Record"
      />

      {/* Add Record Modal */}
      {showAddRecord && viewMode === 'doctor' && selectedPatient && (
        <AddMedicalRecordModal
          isOpen={showAddRecord}
          onClose={() => setShowAddRecord(false)}
          patientId={selectedPatient.id}
          doctorId={doctorId || ''}
          onRecordAdded={() => {
            setShowAddRecord(false);
            // Refresh medical records
            if (selectedPatient) {
              fetchMedicalRecords(selectedPatient.id);
            }
          }}
        />
      )}

      {/* Add Prescription Modal would go here */}
      
      {/* Add Button Highlighter */}
      <AddButtonHighlighter 
        isActive={showHighlighter}
        onClose={() => setShowHighlighter(false)}
      />
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChevronLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserIcon,
  HeartIcon,
  BeakerIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

interface MedicalRecord {
  id: string;
  type: 'prescription' | 'lab-report' | 'scan' | 'consultation' | 'vaccination';
  title: string;
  doctorName: string;
  date: string;
  description: string;
  fileUrl?: string;
  status: 'normal' | 'attention' | 'urgent';
  tags: string[];
  appointmentId: string;
}

interface Appointment {
  id: string;
  patientId?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
  consultationType?: string;
  reason?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string>('');
  const [currentView, setCurrentView] = useState<'records' | 'appointments'>('appointments');

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    // Get patient data
    const userData = localStorage.getItem('userData');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const patient = JSON.parse(userData);
      const currentPatientId = patient.id || `patient_${patient.phone?.replace(/[^0-9]/g, '')}` || 'user123';
      setPatientId(currentPatientId);
      
      await loadMedicalRecords(currentPatientId);
    } catch (error) {
      console.error('Error initializing records page:', error);
      setLoading(false);
    }
  };

  const loadMedicalRecords = async (patientId: string) => {
    try {
      setLoading(true);
      
      // Fetch all appointments (including completed ones)
      const response = await fetch(`/api/appointments?patientId=${patientId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const appointments = result.data;
        const completed = appointments.filter((apt: Appointment) => apt.status === 'completed');
        
        // Add mock completed appointments if none exist
        const mockCompletedAppointments = completed.length === 0 ? [
          {
            id: 'completed_1',
            patientId: patientId,
            doctorId: '1',
            doctorName: 'Dr. Sarah Wilson',
            doctorSpecialization: 'Cardiology',
            date: '2025-07-15',
            time: '10:00 AM',
            status: 'completed',
            consultationFee: 800,
            consultationType: 'in-person',
            reason: 'Heart health checkup',
            diagnosis: 'Normal cardiac function. Blood pressure slightly elevated. Recommended dietary changes and regular exercise.',
            prescription: 'Available',
            createdAt: '2025-07-15T10:00:00Z',
            updatedAt: '2025-07-15T11:30:00Z'
          },
          {
            id: 'completed_2',
            patientId: patientId,
            doctorId: '2',
            doctorName: 'Dr. Michael Chen',
            doctorSpecialization: 'Dermatology',
            date: '2025-06-20',
            time: '2:30 PM',
            status: 'completed',
            consultationFee: 600,
            consultationType: 'in-person',
            reason: 'Skin condition examination',
            diagnosis: 'Mild eczema on arms. Prescribed topical treatment and moisturizing routine.',
            prescription: 'Available',
            createdAt: '2025-06-20T14:30:00Z',
            updatedAt: '2025-06-20T15:15:00Z'
          },
          {
            id: 'completed_3',
            patientId: patientId,
            doctorId: '3',
            doctorName: 'Dr. Emily Davis',
            doctorSpecialization: 'General Medicine',
            date: '2025-06-05',
            time: '11:15 AM',
            status: 'completed',
            consultationFee: 500,
            consultationType: 'video',
            reason: 'Annual health checkup',
            diagnosis: 'Overall health is good. Vitamin D deficiency detected. Recommended supplements and increased sun exposure.',
            prescription: 'Available',
            createdAt: '2025-06-05T11:15:00Z',
            updatedAt: '2025-06-05T12:00:00Z'
          }
        ] as Appointment[] : completed;
        
        setCompletedAppointments(mockCompletedAppointments);
        
        // Generate medical records from completed appointments
        const generatedRecords = mockCompletedAppointments.map((appointment: Appointment) => 
          generateMedicalRecordsFromAppointment(appointment)
        ).flat();
        
        setMedicalRecords(generatedRecords);
      } else {
        setCompletedAppointments([]);
        setMedicalRecords([]);
      }
    } catch (error) {
      console.error('Error loading medical records:', error);
      setCompletedAppointments([]);
      setMedicalRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMedicalRecordsFromAppointment = (appointment: Appointment): MedicalRecord[] => {
    const baseRecord = {
      appointmentId: appointment.id,
      doctorName: appointment.doctorName,
      date: appointment.date,
      status: 'normal' as const,
    };

    const records: MedicalRecord[] = [];

    // Always generate a consultation record
    records.push({
      id: `consultation_${appointment.id}`,
      type: 'consultation',
      title: `${appointment.doctorSpecialization} Consultation`,
      description: `Consultation with ${appointment.doctorName} for ${appointment.reason || 'general health assessment'}. ${appointment.notes || 'Follow-up care plan discussed.'}`,
      tags: [appointment.doctorSpecialization, 'Consultation', 'Follow-up'],
      fileUrl: `/consultations/${appointment.id}.pdf`,
      ...baseRecord
    });

    // Generate prescription based on specialization
    const prescriptions = generatePrescriptionBySpecialty(appointment.doctorSpecialization, appointment.id);
    if (prescriptions) {
      records.push({
        id: `prescription_${appointment.id}`,
        type: 'prescription',
        title: prescriptions.title,
        description: prescriptions.description,
        tags: ['Prescription', appointment.doctorSpecialization, 'Medication'],
        fileUrl: `/prescriptions/${appointment.id}.pdf`,
        ...baseRecord
      });
    }

    // Randomly add lab reports or scans for some appointments (based on specialization)
    if (shouldGenerateLabReport(appointment.doctorSpecialization)) {
      const labReport = generateLabReportBySpecialty(appointment.doctorSpecialization, appointment.id);
      records.push({
        id: `lab_${appointment.id}`,
        type: 'lab-report',
        title: labReport.title,
        description: labReport.description,
        tags: ['Lab Report', appointment.doctorSpecialization, 'Test Results'],
        fileUrl: `/lab-reports/${appointment.id}.pdf`,
        ...baseRecord
      });
    }

    return records;
  };

  const generatePrescriptionBySpecialty = (specialization: string, appointmentId: string) => {
    const prescriptions: Record<string, any> = {
      'Cardiology': {
        title: 'Cardiac Medication',
        description: 'Prescribed medication for heart health management and blood pressure control.'
      },
      'Dermatology': {
        title: 'Skin Treatment',
        description: 'Topical medications and skin care regimen for dermatological condition.'
      },
      'Pediatrics': {
        title: 'Pediatric Medication',
        description: 'Age-appropriate medication prescribed for pediatric care.'
      },
      'Orthopedics': {
        title: 'Pain Management',
        description: 'Pain relief and anti-inflammatory medications for orthopedic condition.'
      },
      'General Medicine': {
        title: 'General Medication',
        description: 'General health medications and vitamin supplements.'
      },
      'Psychiatry': {
        title: 'Mental Health Medication',
        description: 'Psychiatric medications for mental health management.'
      },
      'Psychologist': {
        title: 'Therapy Recommendations',
        description: 'Recommended therapy techniques and coping strategies.'
      }
    };

    return prescriptions[specialization] || {
      title: 'Medical Prescription',
      description: 'Prescribed medications and treatment recommendations.'
    };
  };

  const shouldGenerateLabReport = (specialization: string): boolean => {
    const labSpecialties = ['Cardiology', 'General Medicine', 'Pediatrics'];
    return labSpecialties.includes(specialization) && Math.random() > 0.5;
  };

  const generateLabReportBySpecialty = (specialization: string, appointmentId: string) => {
    const labReports: Record<string, any> = {
      'Cardiology': {
        title: 'Cardiac Function Tests',
        description: 'EKG and cardiac enzyme tests showing normal heart function.'
      },
      'General Medicine': {
        title: 'Complete Blood Count (CBC)',
        description: 'Routine blood work showing normal values across all parameters.'
      },
      'Pediatrics': {
        title: 'Growth & Development Assessment',
        description: 'Height, weight, and developmental milestone evaluation.'
      }
    };

    return labReports[specialization] || {
      title: 'Medical Test Results',
      description: 'Laboratory test results and medical assessments.'
    };
  };

  const handleViewPrescription = (appointmentId: string) => {
    alert(`Viewing prescription for appointment ${appointmentId}`);
  };

  const handleDownloadPrescription = (appointmentId: string) => {
    alert(`Downloading prescription for appointment ${appointmentId}`);
  };

  const handleSharePrescription = (appointmentId: string) => {
    alert(`Sharing prescription for appointment ${appointmentId}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <HeartIcon className="w-5 h-5" />;
      case 'lab-report': return <BeakerIcon className="w-5 h-5" />;
      case 'scan': return <CameraIcon className="w-5 h-5" />;
      case 'consultation': return <UserIcon className="w-5 h-5" />;
      case 'vaccination': return <HeartIcon className="w-5 h-5" />;
      default: return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'text-blue-600 bg-blue-50';
      case 'lab-report': return 'text-green-600 bg-green-50';
      case 'scan': return 'text-purple-600 bg-purple-50';
      case 'consultation': return 'text-orange-600 bg-orange-50';
      case 'vaccination': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'attention': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || record.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const recordTypes = [
    { value: 'all', label: 'All Records', count: medicalRecords.length },
    { value: 'prescription', label: 'Prescriptions', count: medicalRecords.filter(r => r.type === 'prescription').length },
    { value: 'lab-report', label: 'Lab Reports', count: medicalRecords.filter(r => r.type === 'lab-report').length },
    { value: 'scan', label: 'Scans', count: medicalRecords.filter(r => r.type === 'scan').length },
    { value: 'consultation', label: 'Consultations', count: medicalRecords.filter(r => r.type === 'consultation').length },
    { value: 'vaccination', label: 'Vaccinations', count: medicalRecords.filter(r => r.type === 'vaccination').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-white hover:text-green-100 hover:bg-white/20 rounded-lg -ml-2"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-white">Medical Records</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-white hover:text-green-100 hover:bg-white/20 rounded-lg"
            >
              <FunnelIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-white/20 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('appointments')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentView === 'appointments'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📋 Completed Appointments
            </button>
            <button
              onClick={() => setCurrentView('records')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentView === 'records'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📄 Medical Records
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search records, doctors, or conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          {showFilters && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {recordTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedFilter(type.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border ${
                    selectedFilter === type.value
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {currentView === 'appointments' ? (
          /* Completed Appointments Grid View */
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Health Journey</h2>
              <p className="text-gray-600">Track your completed appointments and health progress</p>
            </div>
            
            {completedAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Appointments</h3>
                <p className="text-gray-500 mb-6">
                  Complete your first appointment to see your medical records here.
                </p>
                <button
                  onClick={() => router.push('/book-appointment')}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
                >
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {appointment.doctorName.split(' ')[1]?.charAt(0) || 'D'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{appointment.doctorName}</h3>
                            <p className="text-xs text-green-600">{appointment.doctorSpecialization}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          ✓ Completed
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      {/* Appointment Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{appointment.date} at {appointment.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{appointment.reason || 'General consultation'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="w-4 h-4 mr-2 text-lg">💰</span>
                          <span>₹{appointment.consultationFee}</span>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      {appointment.diagnosis && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <h4 className="font-medium text-blue-900 text-sm mb-1">Diagnosis</h4>
                          <p className="text-blue-800 text-xs leading-relaxed">{appointment.diagnosis}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleViewPrescription(appointment.id)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <EyeIcon className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPrescription(appointment.id)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                      
                      {/* Prescription Status */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Prescription:</span>
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            appointment.prescription === 'Available' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {appointment.prescription || 'Not Required'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Medical Records List View */
          <>
            {/* Search and Filters */}
            <div className="bg-white border-b mb-6 rounded-lg shadow-sm">
              <div className="px-4 py-4">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search records, doctors, or conditions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Tabs */}
                {showFilters && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {recordTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedFilter(type.value)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border ${
                          selectedFilter === type.value
                            ? 'bg-cyan-500 text-white border-cyan-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {type.label} ({type.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Records List */}
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {medicalRecords.length === 0 ? 'No medical records available' : 'No records found'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 
                    `No records match "${searchQuery}"` : 
                    medicalRecords.length === 0 ?
                      'Medical records will appear here after you complete appointments with doctors.' :
                      'No medical records available for the selected filter.'
                  }
                </p>
                {medicalRecords.length === 0 && (
                  <button
                    onClick={() => router.push('/book-appointment')}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Book Your First Appointment
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(record.type)}`}>
                            {getTypeIcon(record.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{record.title}</h3>
                            <p className="text-sm text-gray-600">{record.doctorName}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 mb-3">{record.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>{formatDate(record.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="capitalize">{record.type.replace('-', ' ')}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {record.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <button className="flex-1 bg-cyan-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2">
                          <EyeIcon className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

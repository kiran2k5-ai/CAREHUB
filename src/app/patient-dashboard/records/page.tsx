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
  CameraIcon,
  StarIcon,
  XMarkIcon,
  CheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

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
  rating?: number;
  review?: string;
}

interface ReviewFormData {
  appointmentId: string;
  rating: number;
  reviewText: string;
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    appointmentId: '',
    rating: 0,
    reviewText: ''
  });
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
      
      // Mock completed appointments with reviews
      const mockCompletedAppointments = [
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
          updatedAt: '2025-07-15T11:30:00Z',
          rating: 5,
          review: 'Excellent consultation! Dr. Wilson was very thorough and explained everything clearly.'
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
          updatedAt: '2025-06-05T12:00:00Z',
          rating: 4,
          review: 'Very professional and caring doctor. The video consultation was convenient.'
        }
      ] as Appointment[];
      
      setCompletedAppointments(mockCompletedAppointments);
      
      // Generate medical records from completed appointments
      const generatedRecords = mockCompletedAppointments.map((appointment: Appointment) => 
        generateMedicalRecordsFromAppointment(appointment)
      ).flat();
      
      setMedicalRecords(generatedRecords);
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

  // Generate detailed prescription data for PDF
  const generatePrescriptionDetails = (appointment: Appointment) => {
    const medicationsBySpecialty: Record<string, any> = {
      'Cardiology': {
        medications: [
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take with food' },
          { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with meals' }
        ],
        instructions: 'Monitor blood pressure regularly. Follow up in 2 weeks.',
        restrictions: 'Avoid alcohol. Maintain low-sodium diet.'
      },
      'Dermatology': {
        medications: [
          { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Twice daily', duration: '14 days', instructions: 'Apply thin layer to affected areas' },
          { name: 'Moisturizing Lotion', dosage: 'As needed', frequency: 'Daily', duration: '30 days', instructions: 'Apply after bathing' }
        ],
        instructions: 'Keep skin moisturized. Avoid harsh soaps.',
        restrictions: 'Do not use on broken skin.'
      },
      'General Medicine': {
        medications: [
          { name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily', duration: '90 days', instructions: 'Take with food' },
          { name: 'Calcium Supplement', dosage: '500mg', frequency: 'Twice daily', duration: '90 days', instructions: 'Take with meals' }
        ],
        instructions: 'Increase sun exposure (15-20 minutes daily). Regular exercise recommended.',
        restrictions: 'None specific. Maintain balanced diet.'
      }
    };

    return medicationsBySpecialty[appointment.doctorSpecialization] || {
      medications: [
        { name: 'General Medication', dosage: 'As prescribed', frequency: 'As directed', duration: '30 days', instructions: 'Follow doctor instructions' }
      ],
      instructions: 'Follow up as recommended by your doctor.',
      restrictions: 'None specific.'
    };
  };

  // Generate PDF content for prescription
  const generatePrescriptionPDF = async (appointment: Appointment) => {
    setDownloadingPdf(true);
    
    try {
      const prescriptionData = generatePrescriptionDetails(appointment);
      const currentDate = new Date().toLocaleDateString();
      
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Medical Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0891b2; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0891b2; }
            .clinic-info { margin-top: 10px; color: #666; }
            .prescription-title { font-size: 20px; font-weight: bold; margin: 30px 0; text-align: center; }
            .patient-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .doctor-info { background: #ecfdf5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .medication-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .medication-table th, .medication-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .medication-table th { background-color: #0891b2; color: white; font-weight: bold; }
            .instructions { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .restrictions { background: #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
            .signature { margin-top: 40px; }
            .date-issued { text-align: right; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">HealthCare Plus</div>
            <div class="clinic-info">
              Digital Healthcare Platform<br>
              Phone: +91-9876543210 | Email: support@healthcareplus.com
            </div>
          </div>
          
          <div class="prescription-title">MEDICAL PRESCRIPTION</div>
          
          <div class="date-issued">Date Issued: ${currentDate}</div>
          
          <div class="patient-info">
            <h3>Patient Information</h3>
            <p><strong>Patient ID:</strong> ${appointment.patientId || 'Not specified'}</p>
            <p><strong>Appointment Date:</strong> ${appointment.date} at ${appointment.time}</p>
            <p><strong>Consultation Type:</strong> ${appointment.consultationType || 'In-person'}</p>
          </div>
          
          <div class="doctor-info">
            <h3>Doctor Information</h3>
            <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
            <p><strong>Specialization:</strong> ${appointment.doctorSpecialization}</p>
            <p><strong>Doctor ID:</strong> ${appointment.doctorId}</p>
          </div>
          
          <div>
            <h3>Diagnosis</h3>
            <p>${appointment.diagnosis || 'General health consultation'}</p>
          </div>
          
          <div>
            <h3>Prescribed Medications</h3>
            <table class="medication-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${prescriptionData.medications.map((med: any) => `
                  <tr>
                    <td>${med.name}</td>
                    <td>${med.dosage}</td>
                    <td>${med.frequency}</td>
                    <td>${med.duration}</td>
                    <td>${med.instructions}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="instructions">
            <h3>General Instructions</h3>
            <p>${prescriptionData.instructions}</p>
          </div>
          
          <div class="restrictions">
            <h3>Restrictions & Warnings</h3>
            <p>${prescriptionData.restrictions}</p>
          </div>
          
          <div class="signature">
            <p><strong>Doctor's Signature:</strong> ${appointment.doctorName}</p>
            <p><strong>License No:</strong> MED${appointment.doctorId}2025</p>
          </div>
          
          <div class="footer">
            <p>This is a digitally generated prescription. For any queries, please contact the clinic.</p>
            <p>Prescription ID: RX${appointment.id}_${Date.now()}</p>
          </div>
        </body>
        </html>
      `;

      // Create and download the PDF
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription_${appointment.doctorName.replace(/\s+/g, '_')}_${appointment.date}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      alert('Prescription downloaded successfully! You can convert the HTML file to PDF using your browser\'s print function.');
      
    } catch (error) {
      console.error('Error generating prescription PDF:', error);
      alert('Error generating prescription. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleViewPrescription = (appointment: Appointment) => {
    const prescriptionData = generatePrescriptionDetails(appointment);
    setSelectedPrescription({ ...appointment, prescriptionData });
    setShowPrescriptionModal(true);
  };

  const handleDownloadPrescription = (appointment: Appointment) => {
    generatePrescriptionPDF(appointment);
  };

  const handleSharePrescription = (appointmentId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Medical Prescription',
        text: `Prescription from appointment ${appointmentId}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`Prescription from appointment ${appointmentId}: ${window.location.href}`);
      alert('Prescription link copied to clipboard!');
    }
  };

  // Review form functions
  const openReviewForm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReviewForm({
      appointmentId: appointment.id,
      rating: appointment.rating || 0,
      reviewText: appointment.review || ''
    });
    setShowReviewModal(true);
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleReviewSubmit = () => {
    if (reviewForm.rating === 0) {
      alert('Please provide a rating before submitting.');
      return;
    }

    // Update the appointment with review data
    setCompletedAppointments(prev => 
      prev.map(apt => 
        apt.id === reviewForm.appointmentId 
          ? { ...apt, rating: reviewForm.rating, review: reviewForm.reviewText }
          : apt
      )
    );

    setShowReviewModal(false);
    alert('Thank you for your review! Your feedback helps us improve our services.');
    
    // Reset form
    setReviewForm({ appointmentId: '', rating: 0, reviewText: '' });
    setSelectedAppointment(null);
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
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg">
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
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          {/* Search Bar */}
          <div className="relative mb-4 text-black">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <input
              type="text"
              placeholder="Search records, doctors, or conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
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

                      {/* Rating Display */}
                      {appointment.rating && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= appointment.rating! ? 'text-yellow-400' : 'text-gray-200'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">({appointment.rating}/5)</span>
                          </div>
                          {appointment.review && (
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                              "{appointment.review}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Diagnosis */}
                      {appointment.diagnosis && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <h4 className="font-medium text-blue-900 text-sm mb-1">Diagnosis</h4>
                          <p className="text-blue-800 text-xs leading-relaxed">{appointment.diagnosis}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          onClick={() => handleViewPrescription(appointment)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <EyeIcon className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPrescription(appointment)}
                          disabled={downloadingPdf}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <ArrowDownTrayIcon className="w-3 h-3" />
                          <span>{downloadingPdf ? 'Generating...' : 'Download'}</span>
                        </button>
                      </div>
                      
                      {/* Prescription Status */}
                      <div className="mb-3 pt-3 border-t border-gray-100">
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

                      {/* Review Section */}
                      <div className="pt-3 border-t border-gray-100">
                        {!appointment.rating ? (
                          <div className="text-center">
                            <button
                              onClick={() => openReviewForm(appointment)}
                              className="w-full px-3 py-2 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
                            >
                              ⭐ Rate this appointment
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <button
                              onClick={() => openReviewForm(appointment)}
                              className="w-full px-3 py-2 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              ✏️ Edit review
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Medical Records View</h3>
            <p className="text-gray-500">Medical records functionality coming soon.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {selectedAppointment.doctorName.split(' ')[1]?.charAt(0) || 'D'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{selectedAppointment.doctorName}</h3>
                    <p className="text-xs text-gray-600">{selectedAppointment.doctorSpecialization}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{selectedAppointment.date} at {selectedAppointment.time}</p>
              </div>

              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate this appointment? *
                </label>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className="transition-colors"
                    >
                      <StarIconSolid
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200'
                        } hover:text-yellow-300`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-600">
                    {reviewForm.rating === 0 && 'Click to rate'}
                    {reviewForm.rating === 1 && 'Poor'}
                    {reviewForm.rating === 2 && 'Fair'}
                    {reviewForm.rating === 3 && 'Good'}
                    {reviewForm.rating === 4 && 'Very Good'}
                    {reviewForm.rating === 5 && 'Excellent'}
                  </span>
                </div>
              </div>

              {/* Review Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Share your experience (optional)
                  </label>
                  <textarea
                    value={reviewForm.reviewText}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                    placeholder="Tell us about your experience with this appointment..."
                    className="w-full p-3 border border-black rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {reviewForm.reviewText.length}/500 characters
                  </div>
                </div>


              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewForm.rating === 0}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Prescription Header */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg mb-6 border border-blue-100">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-blue-900">Medical Prescription</h3>
                  <p className="text-sm text-blue-700">HealthCare Plus Digital Platform</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Doctor:</strong> {selectedPrescription.doctorName}</p>
                    <p><strong>Specialization:</strong> {selectedPrescription.doctorSpecialization}</p>
                    <p><strong>Date:</strong> {selectedPrescription.date}</p>
                  </div>
                  <div>
                    <p><strong>Time:</strong> {selectedPrescription.time}</p>
                    <p><strong>Consultation:</strong> {selectedPrescription.consultationType}</p>
                    <p><strong>Patient ID:</strong> {selectedPrescription.patientId}</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Diagnosis</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedPrescription.diagnosis}</p>
                </div>
              </div>

              {/* Medications */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Prescribed Medications</h4>
                <div className="space-y-3">
                  {selectedPrescription.prescriptionData.medications.map((med: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{med.name}</h5>
                        <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">{med.dosage}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <p><strong>Frequency:</strong> {med.frequency}</p>
                        <p><strong>Duration:</strong> {med.duration}</p>
                      </div>
                      <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                        <strong>Instructions:</strong> {med.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Instructions */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">General Instructions</h4>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">{selectedPrescription.prescriptionData.instructions}</p>
                </div>
              </div>

              {/* Restrictions */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Restrictions & Warnings</h4>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">{selectedPrescription.prescriptionData.restrictions}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDownloadPrescription(selectedPrescription)}
                  disabled={downloadingPdf}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={() => handleSharePrescription(selectedPrescription.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BellIcon,
  Cog6ToothIcon,
  PowerIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PatientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  consultationFee: number;
  location: string;
  phone: string;
  availableSlots: string[];
  image?: string;
  isAvailable?: boolean;
  nextSlot?: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const specialties = [
    'All',
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Gynecology',
    'Psychiatry',
    'Ophthalmology',
    'ENT',
    'Urology'
  ];

  useEffect(() => {
    initializeDashboard();
  }, [router]);

  const initializeDashboard = async () => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    if (userType !== 'patient' || !userData) {
      router.push('/login');
      return;
    }

    try {
      const patient = JSON.parse(userData);
      
      // Migrate old patient data to include ID if missing
      if (!patient.id && patient.phone) {
        patient.id = `patient_${patient.phone.replace(/[^0-9]/g, '')}`;
        // Update localStorage with the new format
        localStorage.setItem('userData', JSON.stringify(patient));
      }
      
      console.log('Patient data loaded:', patient);
      setPatientData(patient);
      await loadDashboardData(patient.id || patient.email || 'user123');
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Fallback to demo user
      const demoPatient = {
        id: 'user123',
        name: 'Demo Patient',
        email: 'patient@demo.com',
        phone: '+1234567890'
      };
      setPatientData(demoPatient);
      await loadDashboardData(demoPatient.id);
    }
  };

  const loadDashboardData = async (patientId: string) => {
    setRefreshing(true);
    try {
      // Load appointments and doctors in parallel
      const [appointmentsRes, doctorsRes] = await Promise.all([
        fetch(`/api/appointments?patientId=${patientId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        }),
        fetch('/api/doctors', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
      ]);

      // Handle appointments
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(Array.isArray(appointmentsData.data) ? appointmentsData.data : []);
      }

      // Handle doctors
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        // Check if the response has nested structure
        const doctorsList = doctorsData.data?.doctors || doctorsData.data || [];
        setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays to prevent filter errors
      setAppointments([]);
      setDoctors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookAppointment = (doctorId: string) => {
    router.push(`/book-appointment/${doctorId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const handleViewPrescription = (appointmentId: string) => {
    router.push(`/patient-dashboard/prescription/${appointmentId}`);
  };

  const handleDownloadPrescription = (appointmentId: string) => {
    // In a real app, this would trigger a PDF download
    alert(`Downloading prescription for appointment ${appointmentId}`);
  };

  const getDoctorAvatar = (doctorName: string) => {
    // Generate a simple avatar URL or use initials
    const avatars = [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1594824475562-e171b5c0ef10?w=100&h=100&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=100&h=100&fit=crop&crop=face&auto=format'
    ];
    
    // Use the first letter of doctor's name to consistently pick an avatar
    const index = doctorName.charCodeAt(0) % avatars.length;
    return avatars[index];
  };

  const filteredDoctors = Array.isArray(doctors) ? doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All' || 
                            doctor.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  }) : [];

  const upcomingAppointments = Array.isArray(appointments) ? appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  const recentAppointments = Array.isArray(appointments) ? appointments.filter(apt => 
    apt.status === 'completed'
  ).slice(0, 3) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                  {patientData?.avatar ? (
                    <img
                      src={patientData.avatar}
                      alt={patientData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-cyan-600 font-bold text-lg sm:text-2xl">
                      {patientData?.name?.charAt(0).toUpperCase() || 'P'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">
                  Welcome, {patientData?.name || 'Patient'}
                </h1>
                <p className="text-sm sm:text-base text-cyan-100">Your Health Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => router.push('/patient-dashboard/notifications')}
                className="relative p-2 text-white hover:text-cyan-100 hover:bg-white/20 rounded-lg transition-colors"
              >
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs">
                  {upcomingAppointments.length}
                </span>
              </button>
              
              <button 
                onClick={() => router.push('/patient-dashboard/profile')}
                className="p-2 text-white hover:text-cyan-100 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-white hover:text-red-200 hover:bg-white/20 rounded-lg transition-colors"
              >
                <PowerIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Upcoming</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{upcomingAppointments.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Visits</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-sm p-4 sm:p-6 border border-cyan-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-xs sm:text-sm font-medium">Health Score</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl sm:text-3xl font-bold text-white">8.5</p>
                  <span className="text-sm text-cyan-100 ml-1">/10</span>
                </div>
                <p className="text-xs text-cyan-200 mt-1">Excellent</p>
              </div>
              <div className="relative">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
                  <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="mt-3">
              <div className="bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Expenses</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">₹{appointments.reduce((total, apt) => total + apt.consultationFee, 0)}</p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg">
                <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile Responsive */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button 
              onClick={() => router.push('/book-appointment')}
              className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <PlusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-cyan-900">Book Appointment</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/appointments')}
              className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <CalendarDaysIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-blue-900">Appointments</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/records')}
              className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-green-900">Records</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/profile')}
              className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-yellow-900">Profile</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Appointments Section */}
          <div className="xl:col-span-1 space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <button 
                  onClick={() => router.push('/patient-dashboard/appointments')}
                  className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm mb-4">No upcoming appointments</p>
                    <button 
                      onClick={() => router.push('/book-appointment')}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
                    >
                      Book Your First Appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{appointment.doctorName}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <CalendarDaysIcon className="h-4 w-4 mr-2" />
                          {appointment.date} at {appointment.time}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-medium text-gray-900">₹{appointment.consultationFee}</span>
                          <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Consultations & Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Consultations</h2>
                <button 
                  onClick={() => router.push('/patient-dashboard/records')}
                  className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                {recentAppointments.length === 0 ? (
                  <div className="text-center py-6">
                    <DocumentTextIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent consultations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{appointment.doctorName}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                            <p className="text-xs text-gray-500 mt-1">{appointment.date}</p>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Completed
                          </span>
                        </div>
                        
                        {/* Prescription Available */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <DocumentTextIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">Prescription Available</span>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewPrescription(appointment.id)}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleDownloadPrescription(appointment.id)}
                              className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prescriptions & Medical Records Section */}
          <div className="xl:col-span-2">
            {/* Successful Appointments with Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Medical Records & Prescriptions</h2>
                <button 
                  onClick={() => router.push('/patient-dashboard/records')}
                  className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                >
                  View All Records
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                {recentAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm mb-4">No medical records available</p>
                    <p className="text-gray-400 text-xs">Complete an appointment to get your medical records</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 text-sm">{appointment.doctorName}</h3>
                              <p className="text-xs text-gray-600">{appointment.doctorSpecialization}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Completed
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-xs text-gray-500">
                            <CalendarDaysIcon className="w-3 h-3 mr-1" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <CreditCardIcon className="w-3 h-3 mr-1" />
                            <span>₹{appointment.consultationFee} - Paid</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewPrescription(appointment.id)}
                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                          >
                            <DocumentTextIcon className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPrescription(appointment.id)}
                            className="flex-1 px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Find Doctors Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Find Doctors</h2>
                  {refreshing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty === 'All' ? '' : specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {filteredDoctors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No doctors found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredDoctors.slice(0, 6).map((doctor) => (
                      <div key={doctor.id} className="border border-gray-200 rounded-lg p-4 hover:border-cyan-200 hover:shadow-sm transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-r from-cyan-100 to-blue-100">
                              <img
                                src={getDoctorAvatar(doctor.name)}
                                alt={doctor.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLDivElement;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                              <div 
                                className="avatar-fallback w-full h-full bg-gradient-to-r from-cyan-100 to-blue-100 flex items-center justify-center"
                                style={{ display: 'none' }}
                              >
                                <span className="text-lg sm:text-xl font-semibold text-cyan-600">
                                  {doctor.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base">{doctor.name}</h3>
                              <p className="text-xs sm:text-sm text-gray-600">{doctor.specialization}</p>
                              <div className="flex items-center mt-1">
                                <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                                <span className="text-xs sm:text-sm text-gray-600 ml-1">{doctor.rating}</span>
                                <span className="text-xs sm:text-sm text-gray-400 ml-2">{doctor.experience}</span>
                                {doctor.isAvailable && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                    Available
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:block sm:text-right">
                            <div>
                              <p className="text-lg sm:text-xl font-semibold text-gray-900">₹{doctor.consultationFee}</p>
                              {doctor.nextSlot && (
                                <p className="text-xs text-gray-500">{doctor.nextSlot}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleBookAppointment(doctor.id)}
                              className="ml-4 sm:ml-0 sm:mt-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-4">
                          <div className="flex items-center">
                            <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="truncate">{doctor.location}</span>
                          </div>
                          <div className="flex items-center">
                            <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{doctor.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {filteredDoctors.length > 6 && (
                  <div className="text-center mt-6">
                    <button 
                      onClick={() => router.push('/book-appointment')}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
                    >
                      View All Doctors ({filteredDoctors.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

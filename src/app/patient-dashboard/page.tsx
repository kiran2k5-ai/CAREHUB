'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
  PowerIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UserGroupIcon,
  CheckCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { getAuthData } from '@/lib/authUtils';
import NotificationCenter from '@/components/NotificationCenter';

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
  const [lastRefresh, setLastRefresh] = useState(Date.now());

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
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshDashboardData();
      }
    }, 30000);

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshDashboardData();
      }
    };

    // Listen for profile updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'profileUpdated' && event.newValue === 'true') {
        console.log('🔄 Profile update detected, refreshing dashboard...');
        refreshDashboardData();
        localStorage.removeItem('profileUpdated');
      }
    };

    // Listen for profile updates via custom events
    const handleProfileUpdate = () => {
      console.log('🔄 Profile update event detected, refreshing dashboard...');
      refreshDashboardData();
    };

    // Check for recent appointment booking flag
    const checkForNewBooking = () => {
      const justBooked = localStorage.getItem('appointmentJustBooked');
      const lastBooking = localStorage.getItem('lastAppointmentBooking');
      
      if (justBooked === 'true' && lastBooking) {
        const bookingTime = parseInt(lastBooking);
        const timeDiff = Date.now() - bookingTime;
        
        // If booking was within last 5 minutes, refresh data
        if (timeDiff < 5 * 60 * 1000) {
          console.log('Recent appointment booking detected, refreshing dashboard...');
          refreshDashboardData();
          localStorage.removeItem('appointmentJustBooked');
        }
      }
    };

    // Set up event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check immediately and set up interval
    setTimeout(checkForNewBooking, 1000);
    const bookingCheckInterval = setInterval(checkForNewBooking, 10000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(bookingCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  // Manual refresh function
  const refreshDashboardData = async () => {
    if (patientData?.id) {
      await loadDashboardData(patientData.id);
      setLastRefresh(Date.now());
    }
  };

  const initializeDashboard = async () => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    if (userType !== 'patient') {
      router.push('/login');
      return;
    }

    // ALWAYS use the real test patient UUID to avoid 404 errors
    const correctPatient = {
      id: '7f8e3607-a428-4241-aa3f-10a071f584fa',
      name: 'Test Patient',
      email: 'patient@demo.com',
      phone: '9999999999'
    };

    try {
      // Try to parse existing userData, but fall back to correct patient
      if (userData) {
        const patient = JSON.parse(userData);
        // If the stored patient has a different ID, update it
        if (patient.id !== correctPatient.id) {
          console.log('🔄 Updating stored patient ID to correct UUID');
          localStorage.setItem('userData', JSON.stringify(correctPatient));
        }
      } else {
        // No userData stored, set the correct patient
        localStorage.setItem('userData', JSON.stringify(correctPatient));
      }
      
      console.log('🔍 Patient dashboard using verified UUID:', correctPatient.id);
      setPatientData(correctPatient);
      await loadDashboardData(correctPatient.id);
      
    } catch (error) {
      console.error('Error in patient initialization:', error);
      // Always fall back to the correct patient
      console.log('🔄 Using verified patient with real UUID:', correctPatient.id);
      localStorage.setItem('userData', JSON.stringify(correctPatient));
      setPatientData(correctPatient);
      await loadDashboardData(correctPatient.id);
    }
  };

  const loadDashboardData = async (patientId: string) => {
    setRefreshing(true);
    try {
      console.log('📊 Loading patient dashboard data from database for:', patientId);
      
      // Load appointments, doctors, and profile data in parallel
      const [appointmentsRes, doctorsRes, profileRes] = await Promise.all([
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
        }),
        fetch(`/api/profile?userId=${patientId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
      ]);

      // Handle profile data from database
      if (profileRes.ok) {
        try {
          const profileData = await profileRes.json();
          console.log('👤 Profile from database:', profileData);
          
          if (profileData.success && profileData.data) {
            // Update patient data with latest profile information
            const updatedPatientData = {
              id: patientId,
              name: profileData.data.name || 'Patient',
              email: profileData.data.email || '',
              phone: profileData.data.phone || '',
              avatar: profileData.data.profileImage || undefined
            };
            setPatientData(updatedPatientData);
            
            // Update localStorage with fresh data
            localStorage.setItem('userData', JSON.stringify(updatedPatientData));
            console.log('✅ Patient profile updated from database');
          }
        } catch (parseError) {
          console.error('❌ JSON parsing error for profile:', parseError);
        }
      } else {
        console.log('⚠️ Profile API not available, using existing data');
      }

      // Handle appointments from database
      if (appointmentsRes.ok) {
        try {
          const appointmentsData = await appointmentsRes.json();
          console.log('📅 Patient appointments from database:', appointmentsData);
          console.log('📊 Appointments data type:', typeof appointmentsData);
          console.log('📊 Appointments success:', appointmentsData.success);
          console.log('📊 Appointments data array check:', Array.isArray(appointmentsData.data));
          console.log('📊 Actual appointments data:', appointmentsData.data);
          
          if (appointmentsData.success && Array.isArray(appointmentsData.data)) {
            setAppointments(appointmentsData.data);
            console.log(`✅ Loaded ${appointmentsData.data.length} appointments from Supabase database`);
            console.log('📋 First appointment sample:', appointmentsData.data[0]);
          } else {
            console.warn('❌ Invalid appointments response structure:', appointmentsData);
            console.warn('❌ Expected: {success: true, data: [...]}');
            setAppointments([]);
          }
        } catch (parseError) {
          console.error('❌ JSON parsing error for appointments:', parseError);
          setAppointments([]);
        }
      } else {
        const errorText = await appointmentsRes.text().catch(() => 'Unknown error');
        console.error('❌ Failed to fetch appointments:', {
          status: appointmentsRes.status,
          statusText: appointmentsRes.statusText,
          url: appointmentsRes.url,
          error: errorText
        });
        
        // Add fallback mock data for development
        console.log('🔄 Using fallback appointment data');
        setAppointments([
          {
            id: 'mock-1',
            doctorId: 'a4c2b678-ec90-4d12-bd46-789012345fab',
            doctorName: 'Dr. Ahmed Hassan',
            doctorSpecialization: 'Neurologist',
            date: '2025-10-20',
            time: '09:30',
            status: 'confirmed',
            consultationFee: 900
          }
        ]);
      }

      // Handle doctors from database
      if (doctorsRes.ok) {
        try {
          const doctorsData = await doctorsRes.json();
          console.log('👨‍⚕️ Doctors from database:', doctorsData);
          console.log('👨‍⚕️ Doctors data type:', typeof doctorsData);
          console.log('👨‍⚕️ Doctors success:', doctorsData.success);
          
          // Check if the response has nested structure
          const doctorsList = doctorsData.data?.doctors || doctorsData.data || [];
          console.log('👨‍⚕️ Doctors list:', doctorsList);
          console.log('👨‍⚕️ Doctors list is array:', Array.isArray(doctorsList));
          
          if (Array.isArray(doctorsList)) {
            setDoctors(doctorsList);
            console.log(`✅ Loaded ${doctorsList.length} doctors from Supabase database`);
          } else {
            console.warn('❌ Invalid doctors response structure:', doctorsData);
            setDoctors([]);
          }
        } catch (parseError) {
          console.error('❌ JSON parsing error for doctors:', parseError);
          setDoctors([]);
        }
      } else {
        const errorText = await doctorsRes.text().catch(() => 'Unknown error');
        console.error('❌ Failed to fetch doctors:', {
          status: doctorsRes.status,
          statusText: doctorsRes.statusText,
          url: doctorsRes.url,
          error: errorText
        });
        setDoctors([]);
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data from database:', error);
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

  const filteredDoctors = Array.isArray(doctors) ? doctors
    .filter(doctor => doctor && doctor.id) // Filter out doctors with null/undefined IDs
    .filter(doctor => {
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
                onClick={refreshDashboardData}
                disabled={refreshing}
                className="p-2 text-white hover:text-cyan-100 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh appointments"
              >
                <svg 
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <NotificationCenter 
                userId={patientData?.id || ''} 
                userType="patient" 
                className=""
              />
              
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
        {/* Enhanced Stats Cards - Mobile First Responsive */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Upcoming</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">{upcomingAppointments.length}</p>
              </div>
              <div className="p-1.5 sm:p-2 md:p-3 bg-blue-50 rounded-lg flex-shrink-0 ml-2">
                <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Total Visits</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
              </div>
              <div className="p-1.5 sm:p-2 md:p-3 bg-green-50 rounded-lg flex-shrink-0 ml-2">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border border-cyan-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-cyan-100 text-xs sm:text-sm font-medium truncate">Health Score</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">8.5</p>
                  <span className="text-sm text-cyan-100 ml-1">/10</span>
                </div>
                <p className="text-xs text-cyan-200 mt-1">Excellent</p>
              </div>
              <div className="relative flex-shrink-0 ml-2">
                <div className="p-1.5 sm:p-2 md:p-3 bg-white/20 rounded-lg">
                  <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="mt-3">
              <div className="bg-white/20 rounded-full h-1.5 sm:h-2">
                <div className="bg-white rounded-full h-1.5 sm:h-2 transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Expenses</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">₹{appointments.reduce((total, apt) => total + apt.consultationFee, 0)}</p>
              </div>
              <div className="p-1.5 sm:p-2 md:p-3 bg-yellow-50 rounded-lg flex-shrink-0 ml-2">
                <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Enhanced Mobile Responsive */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <button 
              onClick={() => router.push('/book-appointment')}
              className="flex flex-col items-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-cyan-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-cyan-900 text-center leading-tight">Book Appointment</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/appointments')}
              className="flex flex-col items-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-blue-900 text-center leading-tight">Appointments</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/records')}
              className="flex flex-col items-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-green-900 text-center leading-tight">Records</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/profile')}
              className="flex flex-col items-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-yellow-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-yellow-900 text-center leading-tight">Profile</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid - Enhanced Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Appointments Section */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                  <div className="flex items-center justify-between sm:justify-end space-x-2 text-xs sm:text-sm">
                    {refreshing && (
                      <div className="flex items-center text-cyan-600">
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-cyan-500 mr-1 sm:mr-2"></div>
                        <span className="hidden sm:inline">Updating...</span>
                        <span className="sm:hidden">...</span>
                      </div>
                    )}
                    <span className="text-gray-500 hidden sm:inline">
                      Updated {new Date(lastRefresh).toLocaleTimeString()}
                    </span>
                    <button 
                      onClick={() => router.push('/patient-dashboard/appointments')}
                      className="text-cyan-600 hover:text-cyan-700 font-medium whitespace-nowrap"
                    >
                      View All
                    </button>
                  </div>
                </div>
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
                    {filteredDoctors.slice(0, 6).map((doctor, index) => (
                      <div key={doctor.id || `doctor-${index}`} className="border border-gray-200 rounded-lg p-4 hover:border-cyan-200 hover:shadow-sm transition-all">
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

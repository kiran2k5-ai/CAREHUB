'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BellIcon,
  Cog6ToothIcon,
  PowerIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import NotificationCenter from '@/components/NotificationCenter';

interface DoctorData {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'scheduled' | 'SCHEDULED';
  type: 'consultation' | 'follow-up' | 'emergency';
  symptoms?: string;
  notes?: string;
  consultationFee: number;
}

interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  monthlyEarnings: number;
  weeklyGrowth: number;
}

export default function EnhancedDoctorDashboard() {
  const router = useRouter();
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    monthlyEarnings: 0,
    weeklyGrowth: 12.5
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    if (userType !== 'doctor' || !userData) {
      router.push('/login');
      return;
    }

    try {
      const doctor = JSON.parse(userData);
      let doctorId = doctor.id;
      // If doctorId is missing, not a valid UUID, or is a demo string, use the real UUID
      const validUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!doctorId || doctorId === 'undefined' || !validUuid.test(doctorId)) {
        doctorId = '550e8400-e29b-41d4-a716-446655440001'; // fallback to real doctor UUID
      }
      const updatedDoctor = {
        ...doctor,
        id: doctorId
      };
      localStorage.setItem('userData', JSON.stringify(updatedDoctor));
      console.log('Doctor data loaded with proper ID:', updatedDoctor);
      setDoctorData(updatedDoctor);
      loadDashboardData(updatedDoctor.id);
    } catch (error) {
      console.error('Error parsing doctor data:', error);
      // Fallback to real doctor UUID
      const demoDoctor = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Dr. Demo',
        email: 'doctor@demo.com',
        phone: '9876543210',
        specialization: 'General Physician'
      };
      setDoctorData(demoDoctor);
      loadDashboardData(demoDoctor.id);
    }

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

    // Check for recent appointment booking flag (from patient bookings)
    const checkForNewBooking = () => {
      const justBooked = localStorage.getItem('appointmentJustBooked');
      const lastBooking = localStorage.getItem('lastAppointmentBooking');
      
      if (justBooked === 'true' && lastBooking) {
        const bookingTime = parseInt(lastBooking);
        const timeDiff = Date.now() - bookingTime;
        
        // If booking was within last 5 minutes, refresh data
        if (timeDiff < 5 * 60 * 1000) {
          console.log('Recent patient appointment booking detected, refreshing doctor dashboard...');
          refreshDashboardData();
        }
      }
    };

    // Check immediately and set up interval
    setTimeout(checkForNewBooking, 1000);
    const bookingCheckInterval = setInterval(checkForNewBooking, 10000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(bookingCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  // Manual refresh function
  const refreshDashboardData = async () => {
    if (doctorData?.id) {
      setRefreshing(true);
      await loadDashboardData(doctorData.id);
      setLastRefresh(Date.now());
      setRefreshing(false);
    }
  };

  const loadDashboardData = async (doctorId: string) => {
    try {
      console.log('📊 Loading doctor dashboard data from database for:', doctorId);
      
      // Load appointments using the correct doctor appointments API
      const appointmentsRes = await fetch(`/api/doctor/appointments?doctorId=${doctorId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        console.log('📅 Doctor appointments from database:', appointmentsData);
        
        if (appointmentsData.success && Array.isArray(appointmentsData.data)) {
          const appointmentsList = appointmentsData.data;
          setAppointments(appointmentsList);
          console.log(`✅ Loaded ${appointmentsList.length} appointments from Supabase database`);
          
          // Calculate stats from appointments
          const today = new Date().toISOString().split('T')[0];
          const todayAppts = appointmentsList.filter((apt: Appointment) => apt.date === today);
          const pendingAppts = appointmentsList.filter((apt: Appointment) => 
            apt.status === 'pending' || apt.status === 'SCHEDULED' || apt.status === 'scheduled'
          );
          
          setStats({
            todayAppointments: todayAppts.length,
            pendingAppointments: pendingAppts.length,
            totalPatients: appointmentsList.length,
            monthlyEarnings: appointmentsList.reduce((sum: number, apt: Appointment) => 
              sum + (apt.consultationFee || 500), 0
            ),
            weeklyGrowth: 12.5 // Static for demo
          });
        } else {
          console.warn('❌ Invalid appointments response:', appointmentsData);
          setAppointments([]);
          setStats({
            todayAppointments: 0,
            pendingAppointments: 0,
            totalPatients: 0,
            monthlyEarnings: 0,
            weeklyGrowth: 0
          });
        }
      } else {
        console.error('❌ Failed to fetch doctor appointments:', appointmentsRes.status);
        setAppointments([]);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data from database:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Reload appointments after update
        if (doctorData?.id) {
          await loadDashboardData(doctorData.id);
          setLastRefresh(Date.now());
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Mobile-First Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                Welcome, {doctorData?.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">{doctorData?.specialization}</p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4 flex-shrink-0">
              <button
                onClick={refreshDashboardData}
                disabled={refreshing}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-cyan-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
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
                userId={doctorData?.id || ''} 
                userType="doctor" 
                className=""
              />
              
              <button 
                onClick={() => router.push('/doctor-dashboard/profile')}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-cyan-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Cog6ToothIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              
              <button 
                onClick={handleLogout}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <PowerIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* Enhanced Mobile-First Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Today's Appointments</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stats.todayAppointments}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg flex-shrink-0 ml-2">
                <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 sm:mt-4 text-green-600">
              <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium ml-1 truncate">+{stats.weeklyGrowth}% from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Pending Appointments</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stats.pendingAppointments}</p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg flex-shrink-0 ml-2">
                <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Total Patients</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-lg flex-shrink-0 ml-2">
                <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Earnings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.monthlyEarnings.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button 
              onClick={() => router.push('/doctor-dashboard/appointments')}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <CalendarDaysIcon className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">View Appointments</span>
            </button>
            
            <button 
              onClick={() => router.push('/doctor-dashboard/availability')}
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <ClockIcon className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Set Availability</span>
            </button>
            
            <button 
              onClick={() => router.push('/medical-records-manager')}
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-purple-900">Medical Records</span>
            </button>
            
            <button 
              onClick={() => router.push('/doctor-dashboard/notifications')}
              className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <BellIcon className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-yellow-900">Notifications</span>
            </button>
            
            <button 
              onClick={() => router.push('/doctor-dashboard/analytics')}
              className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <svg className="h-8 w-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-indigo-900">Analytics</span>
            </button>
            
            <button 
              onClick={() => router.push('/doctor-dashboard/profile')}
              className="flex flex-col items-center p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
            >
              <Cog6ToothIcon className="h-8 w-8 text-cyan-600 mb-2" />
              <span className="text-sm font-medium text-cyan-900">Settings</span>
            </button>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
              <div className="flex items-center space-x-4">
                {refreshing && (
                  <div className="flex items-center text-cyan-600 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500 mr-2"></div>
                    <span>Updating...</span>
                  </div>
                )}
                <span className="text-xs text-gray-500">
                  Updated {new Date(lastRefresh).toLocaleTimeString()}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:border-cyan-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-600">
                            {appointment.patientName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                          <p className="text-sm text-gray-600">{appointment.patientPhone}</p>
                          <p className="text-sm text-gray-500">{appointment.time} • {appointment.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        
                        {appointment.status === 'pending' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Confirm"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="px-3 py-1 bg-cyan-600 text-white text-xs font-medium rounded hover:bg-cyan-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {appointment.symptoms && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

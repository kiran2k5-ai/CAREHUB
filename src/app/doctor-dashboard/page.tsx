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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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

  useEffect(() => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    if (userType !== 'doctor' || !userData) {
      router.push('/login');
      return;
    }

    const doctor = JSON.parse(userData);
    setDoctorData(doctor);
    loadDashboardData(doctor.id);
  }, [router]);

  const loadDashboardData = async (doctorId: string) => {
    try {
      // Load appointments 
      const appointmentsRes = await fetch(`/api/doctor/appointments?doctorId=${doctorId}`);

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        const appointmentsList = appointmentsData.data || [];
        setAppointments(appointmentsList);
        
        // Calculate stats from appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointmentsList.filter((apt: Appointment) => apt.date === today);
        const pendingAppts = appointmentsList.filter((apt: Appointment) => apt.status === 'pending');
        
        setStats({
          todayAppointments: todayAppts.length,
          pendingAppointments: pendingAppts.length,
          totalPatients: appointmentsList.length,
          monthlyEarnings: appointmentsList.reduce((sum: number, apt: Appointment) => sum + (apt.consultationFee || 500), 0),
          weeklyGrowth: 12.5 // Static for demo
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
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
          loadDashboardData(doctorData.id);
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {doctorData?.name}
            </h1>
            <p className="text-gray-600">{doctorData?.specialization}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/doctor-dashboard/notifications')}
              className="relative p-2 text-gray-600 hover:text-cyan-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            
            <button 
              onClick={() => router.push('/doctor-dashboard/profile')}
              className="p-2 text-gray-600 hover:text-cyan-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
            
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PowerIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todayAppointments}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-600">
              <ArrowUpIcon className="h-4 w-4" />
              <span className="text-sm font-medium">+{stats.weeklyGrowth}% from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingAppointments}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              onClick={() => router.push('/doctor-dashboard/notifications')}
              className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <BellIcon className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-yellow-900">Notifications</span>
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
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
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

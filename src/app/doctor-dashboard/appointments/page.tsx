'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRef } from 'react';
import { parseISO } from 'date-fns';
import Link from 'next/link';

interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  status: 'scheduled' | 'completed' | 'cancelled';
  consultationFee: number;
  notes: string;
  patient?: {
    name: string;
    phone: string;
    age?: number;
  };
}

export default function DoctorAppointments() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string>('');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);


  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const userType = localStorage.getItem('userType');
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    console.log('🔍 Doctor Auth Data:', { userData, userType, loggedInUser });
    console.log('🔑 Full localStorage contents for doctor:', {
      userData: userData ? JSON.parse(userData) : null,
      userType,
      loggedInUser,
      doctorId: localStorage.getItem('doctorId'),
      userId: localStorage.getItem('userId')
    });
    
    let docId = '';
    
    // UUID validation regex
    const validUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Try to get doctor ID from userData first
    if (userData && userType === 'doctor') {
      try {
        const parsed = JSON.parse(userData);
        console.log('✅ Parsed userData:', parsed);
        docId = parsed.id;
        console.log('✅ Got doctor ID from userData:', docId, 'Type:', typeof docId);
        
        // Validate UUID format
        if (!validUuid.test(docId)) {
          console.warn('⚠️ Invalid UUID format detected:', docId, 'Length:', docId?.length);
          docId = ''; // Reset to trigger fallback
        } else {
          console.log('✅ UUID validation passed for:', docId);
        }
      } catch (error) {
        console.error('❌ Error parsing doctor userData:', error);
      }
    }
    
    // Fallback to loggedInUser (phone number) or demo doctor
    if (!docId) {
      console.warn('⚠️ No valid doctor ID found, trying fallback options');
      if (loggedInUser && validUuid.test(loggedInUser)) {
        docId = loggedInUser;
        console.log('📱 Using loggedInUser as doctor ID:', docId);
      } else {
        // Use actual doctor ID from database
        docId = '550e8400-e29b-41d4-a716-446655440001';
        console.log('🚨 Using real doctor ID from database:', docId);
      }
    }
    
    console.log('📊 Final doctor ID for appointments:', docId);
    console.log('📊 Doctor ID being set to state:', docId);
    setDoctorId(docId);
  }, []);

  // Separate useEffect to load appointments when doctorId changes
  useEffect(() => {
    if (!doctorId) {
      console.warn('⚠️ Waiting for doctor ID to be set...');
      return;
    }
    
    loadAppointments();
    
    // Poll for new appointments every 30 seconds
    const interval = setInterval(() => {
      console.log('🔄 Polling for appointment updates...');
      loadAppointments();
    }, 30000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Use the doctorId state that was already set in useEffect
      if (!doctorId) {
        console.error('❌ No doctor ID available to fetch appointments');
        console.log('Current doctorId state:', doctorId);
        setAppointments([]);
        setLoading(false);
        return;
      }

      console.log('📊 loadAppointments called with doctorId:', doctorId, 'Type:', typeof doctorId);
      console.log('Loading appointments for doctor:', doctorId);

      const apiUrl = `/api/doctor/appointments?doctorId=${doctorId}`;
      console.log('🔗 API URL being called:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Appointments loaded:', data);
      console.log('✅ Data structure:', {
        hasSuccess: !!data.success,
        hasAppointments: !!data.appointments,
        appointmentsLength: data.appointments?.length,
        hasData: !!data.data,
        dataLength: data.data?.length,
        firstAppointment: data.appointments?.[0] || data.data?.[0],
        fullData: data
      });
      
      // Handle both success and error responses  
      if (data.success && data.appointments) {
        console.log('✅ Using data.appointments:', data.appointments.length, 'appointments');
        setAppointments(data.appointments);
      } else if (data.appointments) {
        console.log('✅ Using data.appointments (no success flag):', data.appointments.length, 'appointments');
        setAppointments(data.appointments);
      } else if (data.data) {
        console.log('✅ Using data.data:', data.data.length, 'appointments');
        setAppointments(data.data);
      } else {
        console.warn('❌ No appointments found in response structure');
        setAppointments([]);
      }
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    try {
      console.log('📝 Updating appointment:', { appointmentId, status, notes });
      const response = await fetch('/api/doctor/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status, notes })
      });

      if (response.ok) {
        // Refresh appointments
        loadAppointments();
        alert(`Appointment ${status} successfully`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const getFilteredAppointments = () => {
    const todayString = new Date().toISOString().split('T')[0];
    console.log('🗓️ Today filter date:', todayString);
    console.log('📋 All appointments:', appointments.length);
    console.log('📊 Appointment dates and statuses:', appointments.map(apt => ({
      id: apt.id,
      date: apt.date,
      status: apt.status,
      matchesToday: apt.date === todayString,
      hasValidStatus: ['scheduled', 'SCHEDULED'].includes(apt.status)
    })));
    
    switch (selectedTab) {
      case 'all':
        console.log('📊 Showing all appointments:', appointments.length);
        return appointments;
      case 'today':
        const todayApts = appointments.filter(apt => {
          const matchesDate = apt.date === todayString;
          const matchesStatus = ['scheduled', 'SCHEDULED'].includes(apt.status);
          console.log(`📅 Appointment ${apt.id}: date=${apt.date}, status=${apt.status}, matchesDate=${matchesDate}, matchesStatus=${matchesStatus}`);
          return matchesDate && matchesStatus;
        });
        console.log('🎯 Today appointments found:', todayApts.length);
        return todayApts;
      case 'upcoming':
        return appointments.filter(apt => apt.date >= todayString && ['scheduled', 'SCHEDULED'].includes(apt.status));
      case 'past':
        return appointments.filter(apt => apt.date < todayString || ['completed', 'cancelled', 'COMPLETED', 'CANCELLED'].includes(apt.status));
      default:
        return appointments;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // If a date is selected in calendar, filter to that date, else use tab logic
  const filteredAppointments = selectedDate
    ? appointments.filter(a => a.date === selectedDate.toISOString().split('T')[0])
    : getFilteredAppointments();

  // Mark days with appointments
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasAppointment = appointments.some(a => a.date === date.toISOString().split('T')[0]);
      if (hasAppointment) {
        return <div className="flex justify-center mt-1"><span className="w-2 h-2 bg-cyan-400 rounded-full inline-block"></span></div>;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 -ml-2"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Appointments</h1>
              <p className="text-sm text-gray-600">Manage your patient appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'all'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({appointments.length})
            </button>
            <button
              onClick={() => setSelectedTab('today')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'today'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Today ({appointments.filter(a => {
                const todayString = new Date().toISOString().split('T')[0];
                return a.date === todayString && ['scheduled', 'SCHEDULED'].includes(a.status);
              }).length})
            </button>
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'upcoming'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming ({appointments.filter(a => {
                const todayString = new Date().toISOString().split('T')[0];
                return a.date >= todayString && ['scheduled', 'SCHEDULED'].includes(a.status);
              }).length})
            </button>
            <button
              onClick={() => setSelectedTab('past')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'past'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Past ({appointments.filter(a => {
                const todayString = new Date().toISOString().split('T')[0];
                return a.date < todayString || ['completed', 'cancelled', 'COMPLETED', 'CANCELLED'].includes(a.status);
              }).length})
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link href="/doctor-dashboard/calendar_view" className="flex-1 sm:flex-none">
            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-2.5 px-4 sm:px-6 rounded-lg shadow-md transition duration-300 ease-in-out text-sm sm:text-base">
              📅 Full Calendar View
            </button>
          </Link>
        </div>
      </div>

      {/* Appointments List */}
      <div className="px-4 py-6">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTab === 'all' ? 'No appointments' : `No ${selectedTab} appointments`}
            </h3>
            <p className="text-gray-500">
              {selectedTab === 'all'
                ? "You don't have any appointments yet."
                : selectedTab === 'today' 
                ? "You don't have any appointments scheduled for today."
                : selectedTab === 'upcoming'
                ? "You don't have any upcoming appointments."
                : "You don't have any past appointments to show."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.patient?.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          {appointment.patient?.phone}
                        </p>
                        {appointment.patient?.age && (
                          <p className="text-sm text-gray-600">Age: {appointment.patient.age}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status?.toLowerCase() || 'scheduled'}
                      </span>
                      {['scheduled', 'SCHEDULED'].includes(appointment.status) && (
                        <div className="relative">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === appointment.id ? null : appointment.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
                          {showActionMenu === appointment.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                              <button
                                onClick={() => {
                                  updateAppointmentStatus(appointment.id, 'completed');
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>Mark Complete</span>
                              </button>
                              <button
                                onClick={() => {
                                  updateAppointmentStatus(appointment.id, 'cancelled');
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <XCircleIcon className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>

                  {/* Consultation Type & Fee */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.type === 'video' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {appointment.type === 'video' ? 'Video Call' : 'In-Person'}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{appointment.consultationFee}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close action menu */}
      {showActionMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowActionMenu(null)}
        />
      )}

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Appointment Details</h3>
              <button
                onClick={() => setShowAppointmentDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Patient Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedAppointment.patient?.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-1" />
                    {selectedAppointment.patient?.phone}
                  </p>
                  {selectedAppointment.patient?.age && (
                    <p className="text-sm text-gray-600">Age: {selectedAppointment.patient.age}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="w-5 h-5 text-cyan-500" />
                <div>
                  <p className="font-medium text-gray-900">{formatDate(selectedAppointment.date)}</p>
                  <p className="text-sm text-gray-600">Appointment date</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-cyan-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedAppointment.time}</p>
                  <p className="text-sm text-gray-600">Appointment time</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status?.toLowerCase() || 'scheduled'}
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{selectedAppointment.consultationFee}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedAppointment.type === 'video' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedAppointment.type === 'video' ? 'Video Call' : 'In-Person'}
                </span>
                {selectedAppointment.notes && (
                  <p className="text-sm text-gray-600 mt-2">{selectedAppointment.notes}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {['scheduled', 'SCHEDULED'].includes(selectedAppointment.status) && (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, 'completed');
                    setShowAppointmentDetails(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
                <button
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, 'cancelled');
                    setShowAppointmentDetails(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircleIcon className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

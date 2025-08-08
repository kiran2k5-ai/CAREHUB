'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image?: string;
  phone?: string;
  location?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
  reason?: string;
  notes?: string;
  consultationType?: 'in-person' | 'video' | 'phone';
  createdAt?: string;
  updatedAt?: string;
}

export default function PatientAppointments() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    initializeAppointments();
  }, []);

  const initializeAppointments = async () => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    if (userType !== 'patient' || !userData) {
      router.push('/login');
      return;
    }

    try {
      const patient = JSON.parse(userData);
      setPatientData(patient);
      await loadAppointments(patient.id);
    } catch (error) {
      console.error('Error initializing appointments:', error);
      setLoading(false);
    }
  };

  const loadAppointments = async (patientId: string) => {
    try {
      const response = await fetch(`/api/appointments?patientId=${patientId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error('Failed to load appointments');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
    setShowActionMenu(null);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel || !patientData) return;

    try {
      setCancellingAppointment(appointmentToCancel.id);
      
      const response = await fetch(`/api/appointments/${appointmentToCancel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: cancelReason || 'No reason provided',
        }),
      });

      if (response.ok) {
        // Update local state
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentToCancel.id 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        ));
        
        setShowCancelModal(false);
        setAppointmentToCancel(null);
        setCancelReason('');
        
        // Show success message
        alert('Appointment cancelled successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    } finally {
      setCancellingAppointment(null);
    }
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    router.push(`/patient-dashboard/appointments/reschedule/${appointmentId}`);
    setShowActionMenu(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: ClockIcon, bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { icon: CheckCircleIcon, bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      completed: { icon: CheckCircleIcon, bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      cancelled: { icon: XCircleIcon, bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getConsultationIcon = (type: string = 'in-person') => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="w-4 h-4" />;
      case 'phone':
        return <PhoneIcon className="w-4 h-4" />;
      default:
        return <MapPinIcon className="w-4 h-4" />;
    }
  };

  const getConsultationText = (type: string = 'in-person') => {
    switch (type) {
      case 'video':
        return 'Video consultation';
      case 'phone':
        return 'Phone consultation';
      default:
        return 'In-person consultation';
    }
  };

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(appointment => {
    if (selectedTab === 'upcoming') {
      return appointment.status === 'confirmed' || appointment.status === 'pending';
    } else {
      return appointment.status === 'completed' || appointment.status === 'cancelled';
    }
  }) : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isUpcoming = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg -ml-2"
              >
                <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-sm text-gray-600">Manage your healthcare appointments</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/book-appointment')}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-2 sm:px-4 sm:py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Book New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'upcoming'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming ({Array.isArray(appointments) ? appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length : 0})
            </button>
            <button
              onClick={() => setSelectedTab('past')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'past'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Past ({Array.isArray(appointments) ? appointments.filter(a => a.status === 'completed' || a.status === 'cancelled').length : 0})
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md mx-auto">
              <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {selectedTab} appointments
              </h3>
              <p className="text-gray-500 mb-8">
                {selectedTab === 'upcoming' 
                  ? "You don't have any upcoming appointments scheduled."
                  : "You don't have any past appointments to show."
                }
              </p>
              {selectedTab === 'upcoming' && (
                <button
                  onClick={() => router.push('/book-appointment')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
                >
                  Book Your First Appointment
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-cyan-600 font-semibold text-lg sm:text-xl">
                          {appointment.doctorName?.charAt(0).toUpperCase() || 'D'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{appointment.doctorName}</h3>
                        <p className="text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                        <div className="mt-1">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:block">
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-gray-900">₹{appointment.consultationFee}</p>
                        <p className="text-xs text-gray-500">Consultation fee</p>
                      </div>
                      
                      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                        <div className="relative ml-4 sm:ml-0 sm:mt-2">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === appointment.id ? null : appointment.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
                          {showActionMenu === appointment.id && (
                            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                              <button
                                onClick={() => handleRescheduleAppointment(appointment.id)}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                              >
                                <PencilIcon className="w-4 h-4" />
                                <span>Reschedule</span>
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appointment)}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg border-t border-gray-100"
                                disabled={cancellingAppointment === appointment.id}
                              >
                                {cancellingAppointment === appointment.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                    <span>Cancelling...</span>
                                  </>
                                ) : (
                                  <>
                                    <TrashIcon className="w-4 h-4" />
                                    <span>Cancel</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <CalendarDaysIcon className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="font-medium text-gray-900">{formatShortDate(appointment.date)}</p>
                        <p className="text-sm">{formatDate(appointment.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                      <ClockIcon className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.time}</p>
                        <p className="text-sm">Appointment time</p>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Type */}
                  <div className="flex items-center space-x-3 text-gray-600 mb-4">
                    <div className="text-cyan-500">
                      {getConsultationIcon(appointment.consultationType)}
                    </div>
                    <span className="text-sm font-medium">{getConsultationText(appointment.consultationType)}</span>
                  </div>

                  {/* Notes */}
                  {appointment.reason && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason: </span>
                        {appointment.reason}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons for Upcoming Appointments */}
                  {appointment.status === 'confirmed' && isUpcoming(appointment.date) && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => router.push(`/patient-dashboard/appointments/${appointment.id}`)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
                      >
                        <span>View Details</span>
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                      
                      {appointment.consultationType === 'video' && (
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                          <VideoCameraIcon className="w-4 h-4" />
                          <span>Join Video Call</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Past Appointment Actions */}
                  {appointment.status === 'completed' && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
                      <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <span>View Report</span>
                      </button>
                      <button 
                        onClick={() => router.push(`/book-appointment/${appointment.doctorId}`)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
                      >
                        <span>Book Again</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close menu */}
      {showActionMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowActionMenu(null)}
        />
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && appointmentToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
            </div>
            
            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-cyan-600 font-semibold text-lg">
                    {appointmentToCancel.doctorName?.charAt(0).toUpperCase() || 'D'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{appointmentToCancel.doctorName}</h4>
                  <p className="text-sm text-gray-600">{appointmentToCancel.doctorSpecialization}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>{formatShortDate(appointmentToCancel.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{appointmentToCancel.time}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                rows={3}
              />
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Cancelling within 24 hours may incur charges. Please check our cancellation policy.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setAppointmentToCancel(null);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={cancellingAppointment !== null}
              >
                Keep Appointment
              </button>
              <button
                onClick={confirmCancelAppointment}
                disabled={cancellingAppointment !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
              >
                {cancellingAppointment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Cancel Appointment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

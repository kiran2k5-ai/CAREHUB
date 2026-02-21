'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  PhoneIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface AppointmentDetails {
  id: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorImage?: string;
  doctorPhone: string;
  date: string;
  time: string;
  consultationType: 'in-person' | 'video';
  consultationFee: number;
  location?: string;
  patientName: string;
  patientPhone: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface BookingConfirmationProps {
  appointment: AppointmentDetails;
  isVisible: boolean;
  onClose: () => void;
  onAddToCalendar?: () => void;
  onDownloadReceipt?: () => void;
  className?: string;
}

export default function BookingConfirmation({
  appointment,
  isVisible,
  onClose,
  onAddToCalendar,
  onDownloadReceipt,
  className = ''
}: BookingConfirmationProps) {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowSuccessAnimation(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const copyAppointmentId = async () => {
    try {
      await navigator.clipboard.writeText(appointment.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy appointment ID:', error);
    }
  };

  const shareAppointment = async () => {
    const shareData = {
      title: 'Appointment Confirmation',
      text: `Appointment with Dr. ${appointment.doctorName} on ${formatDate(appointment.date)} at ${formatTime(appointment.time)}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\nAppointment ID: ${appointment.id}`;
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to share appointment:', error);
    }
  };

  const generateCalendarUrl = () => {
    const startDate = new Date(`${appointment.date}T${appointment.time}`);
    const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutes later
    
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(`Appointment with Dr. ${appointment.doctorName}`);
    const details = encodeURIComponent(
      `Consultation with Dr. ${appointment.doctorName} (${appointment.doctorSpecialization})\n` +
      `Type: ${appointment.consultationType === 'video' ? 'Video Call' : 'In-Person'}\n` +
      `Fee: ₹${appointment.consultationFee}\n` +
      `Appointment ID: ${appointment.id}`
    );
    const location = encodeURIComponent(appointment.location || 'Online');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${details}&location=${location}`;
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Success Animation Header */}
        <div className="relative p-6 text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className={`transition-all duration-500 ${showSuccessAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <CheckCircleSolid className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-green-100">Your appointment has been successfully booked</p>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="p-6 space-y-6">
          {/* Doctor Information */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
              {appointment.doctorImage ? (
                <img 
                  src={appointment.doctorImage} 
                  alt={appointment.doctorName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-cyan-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
              <p className="text-sm text-gray-600">{appointment.doctorSpecialization}</p>
              <div className="flex items-center mt-1 space-x-2">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{appointment.doctorPhone}</span>
              </div>
            </div>
          </div>

          {/* Appointment Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-medium">Date</p>
                <p className="text-sm font-semibold text-blue-900">{formatDate(appointment.date)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <ClockIcon className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600 font-medium">Time</p>
                <p className="text-sm font-semibold text-purple-900">{formatTime(appointment.time)}</p>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <CameraIcon className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-xs text-orange-600 font-medium">Type</p>
                <p className="text-sm font-semibold text-orange-900 capitalize">
                  {appointment.consultationType === 'video' ? 'Video Call' : 'In-Person'}
                </p>
              </div>
            </div>

            {/* Fee */}
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">Fee</p>
                <p className="text-sm font-semibold text-green-900">₹{appointment.consultationFee}</p>
              </div>
            </div>
          </div>

          {/* Location (if in-person) */}
          {appointment.consultationType === 'in-person' && appointment.location && (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <MapPinIcon className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{appointment.location}</p>
              </div>
            </div>
          )}

          {/* Appointment ID */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <div>
              <p className="text-sm font-medium text-yellow-800">Appointment ID</p>
              <p className="text-sm text-yellow-700 font-mono">{appointment.id}</p>
            </div>
            <button
              onClick={copyAppointmentId}
              className="flex items-center space-x-1 text-yellow-700 hover:text-yellow-800 transition-colors"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
              <p className="text-sm text-gray-600">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.open(generateCalendarUrl(), '_blank')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CalendarDaysIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Add to Calendar</span>
            </button>

            <button
              onClick={shareAppointment}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ShareIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
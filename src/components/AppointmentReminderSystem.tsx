'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  BellIcon,
  CalendarDaysIcon,
  UserIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface AppointmentReminder {
  id: string;
  appointmentId: string;
  doctorName: string;
  doctorSpecialization: string;
  patientName: string;
  date: string;
  time: string;
  type: 'video' | 'in-person';
  location?: string;
  consultationFee: number;
  timeUntilAppointment: number; // minutes
  reminderType: 'day_before' | 'hour_before' | '15_min_before' | 'overdue';
  status: 'scheduled' | 'confirmed' | 'cancelled';
}

interface AppointmentReminderSystemProps {
  userId: string;
  userType: 'doctor' | 'patient';
  className?: string;
}

export default function AppointmentReminderSystem({
  userId,
  userType,
  className = ''
}: AppointmentReminderSystemProps) {
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load upcoming appointments that need reminders
  const loadReminders = async () => {
    setLoading(true);
    try {
      const paramName = userType === 'doctor' ? 'doctorId' : 'patientId';
      const response = await fetch(`/api/appointments?${paramName}=${userId}&reminders=true`);
      if (response.ok) {
        const data = await response.json();
        const appointments = data.data || [];
        
        // Process appointments to create reminders
        const now = new Date();
        const appointmentReminders: AppointmentReminder[] = [];

        appointments.forEach((appointment: any) => {
          const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
          const timeDiffMs = appointmentDateTime.getTime() - now.getTime();
          const timeDiffMins = Math.floor(timeDiffMs / (1000 * 60));

          // Create reminder if appointment is within reminder timeframes
          let reminderType: AppointmentReminder['reminderType'] | null = null;

          if (timeDiffMins < 0) {
            reminderType = 'overdue';
          } else if (timeDiffMins <= 15) {
            reminderType = '15_min_before';
          } else if (timeDiffMins <= 60) {
            reminderType = 'hour_before';
          } else if (timeDiffMins <= 1440) { // 24 hours
            reminderType = 'day_before';
          }

          if (reminderType && appointment.status !== 'cancelled') {
            appointmentReminders.push({
              id: `reminder_${appointment.id}_${reminderType}`,
              appointmentId: appointment.id,
              doctorName: appointment.doctorName || appointment.doctor?.name || 'Unknown Doctor',
              doctorSpecialization: appointment.doctorSpecialization || appointment.doctor?.specialization || '',
              patientName: appointment.patientName || appointment.patient?.name || 'Unknown Patient',
              date: appointment.date,
              time: appointment.time,
              type: appointment.type,
              location: appointment.location,
              consultationFee: appointment.consultationFee || 500,
              timeUntilAppointment: timeDiffMins,
              reminderType,
              status: appointment.status
            });
          }
        });

        setReminders(appointmentReminders);
      }
    } catch (error) {
      console.error('Error loading appointment reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dismiss a reminder
  const dismissReminder = (reminderId: string) => {
    setDismissedReminders(prev => new Set([...prev, reminderId]));
    
    // Store dismissed reminders in localStorage
    const dismissed = Array.from(dismissedReminders);
    dismissed.push(reminderId);
    localStorage.setItem(`dismissed_reminders_${userId}`, JSON.stringify(dismissed));
  };

  // Dismiss all reminders
  const dismissAllReminders = () => {
    const allReminderIds = reminders.map(r => r.id);
    setDismissedReminders(new Set(allReminderIds));
    localStorage.setItem(`dismissed_reminders_${userId}`, JSON.stringify(allReminderIds));
  };

  // Load dismissed reminders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`dismissed_reminders_${userId}`);
    if (stored) {
      try {
        const dismissedIds = JSON.parse(stored);
        setDismissedReminders(new Set(dismissedIds));
      } catch (error) {
        console.error('Error loading dismissed reminders:', error);
      }
    }
  }, [userId]);

  // Load reminders on mount and set up polling
  useEffect(() => {
    loadReminders();
    
    // Refresh reminders every 5 minutes
    const interval = setInterval(loadReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, userType]);

  // Get reminder message and styling
  const getReminderDetails = (reminder: AppointmentReminder) => {
    const timeAbs = Math.abs(reminder.timeUntilAppointment);
    
    switch (reminder.reminderType) {
      case 'day_before':
        return {
          message: `You have an appointment tomorrow`,
          urgency: 'low',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'hour_before':
        return {
          message: `Appointment in ${Math.floor(timeAbs / 60)}h ${timeAbs % 60}m`,
          urgency: 'medium',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case '15_min_before':
        return {
          message: `Appointment starting in ${timeAbs} minutes`,
          urgency: 'high',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'overdue':
        return {
          message: `Appointment was ${Math.floor(timeAbs / 60)}h ${timeAbs % 60}m ago`,
          urgency: 'urgent',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          textColor: 'text-red-900',
          iconColor: 'text-red-700'
        };
      default:
        return {
          message: 'Upcoming appointment',
          urgency: 'low',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  // Filter out dismissed reminders
  const activeReminders = reminders.filter(r => !dismissedReminders.has(r.id));

  if (loading || activeReminders.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      {activeReminders.length > 1 && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            {activeReminders.length} Appointment Reminders
          </h3>
          <button
            onClick={dismissAllReminders}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Dismiss All
          </button>
        </div>
      )}

      {/* Reminder Cards */}
      {activeReminders.map((reminder) => {
        const details = getReminderDetails(reminder);
        
        return (
          <div
            key={reminder.id}
            className={`p-4 rounded-lg border-l-4 ${details.bgColor} ${details.borderColor} ${details.textColor}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Urgency Icon */}
                <div className={`flex-shrink-0 mt-0.5 ${details.iconColor}`}>
                  {reminder.reminderType === 'overdue' ? (
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  ) : reminder.reminderType === '15_min_before' ? (
                    <BellIcon className="w-5 h-5" />
                  ) : (
                    <ClockIcon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Reminder Message */}
                  <p className="text-sm font-medium mb-1">
                    {details.message}
                  </p>

                  {/* Appointment Details */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {userType === 'doctor' ? 
                          `Patient: ${reminder.patientName}` : 
                          `Dr. ${reminder.doctorName}`
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{new Date(reminder.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{reminder.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {reminder.type === 'video' ? (
                        <VideoCameraIcon className="w-4 h-4" />
                      ) : (
                        <MapPinIcon className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {reminder.type === 'video' ? 'Video Call' : reminder.location || 'In-Person'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-3">
                    {reminder.type === 'video' && reminder.reminderType === '15_min_before' && (
                      <button className="text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors">
                        Join Call
                      </button>
                    )}
                    <button
                      onClick={() => window.location.href = `/${userType}-dashboard/appointments`}
                      className="text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => dismissReminder(reminder.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 ml-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
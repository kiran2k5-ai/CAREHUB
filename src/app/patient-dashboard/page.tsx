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
  PhoneIcon
} from '@heroicons/react/24/outline';

interface PatientData {
  id: string;
  name: string;
  email: string;
  phone: string;
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
}

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
}

export default function EnhancedPatientDashboard() {
  const router = useRouter();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const specialties = [
    'All',
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Gynecology',
    'Psychiatry'
  ];

  useEffect(() => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    if (userType !== 'patient' || !userData) {
      router.push('/login');
      return;
    }

    const patient = JSON.parse(userData);
    setPatientData(patient);
    loadDashboardData(patient.id);
  }, [router]);

  const loadDashboardData = async (patientId: string) => {
    try {
      // Load patient appointments
      const appointmentsRes = await fetch(`/api/appointments?patientId=${patientId}`);
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.data || []);
      }

      // Load available doctors
      const doctorsRes = await fetch('/api/doctors');
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All' || 
                            doctor.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {patientData?.name}
            </h1>
            <p className="text-gray-600">Your Health Dashboard</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/patient-dashboard/notifications')}
              className="relative p-2 text-gray-600 hover:text-cyan-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/profile')}
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingAppointments.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Consultations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Health Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">8.5/10</p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg">
                <HeartIcon className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/book-appointment')}
              className="flex flex-col items-center p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
            >
              <PlusIcon className="h-8 w-8 text-cyan-600 mb-2" />
              <span className="text-sm font-medium text-cyan-900">Book Appointment</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/appointments')}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <CalendarDaysIcon className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">My Appointments</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/records')}
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <ClockIcon className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Medical Records</span>
            </button>
            
            <button 
              onClick={() => router.push('/patient-dashboard/profile')}
              className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <UserIcon className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-yellow-900">Profile</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              </div>
              
              <div className="p-6">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No upcoming appointments</p>
                    <button 
                      onClick={() => router.push('/book-appointment')}
                      className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
                            <p className="text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarDaysIcon className="h-4 w-4 mr-2" />
                          {appointment.date} at {appointment.time}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Find Doctors */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Doctors</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty === 'All' ? '' : specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-6">
                {filteredDoctors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No doctors found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredDoctors.slice(0, 6).map((doctor) => (
                      <div key={doctor.id} className="border border-gray-200 rounded-lg p-4 hover:border-cyan-200 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg font-semibold text-cyan-600">
                                {doctor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                              <p className="text-sm text-gray-600">{doctor.specialization}</p>
                              <div className="flex items-center mt-1">
                                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                                <span className="text-sm text-gray-400 ml-2">{doctor.experience}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">₹{doctor.consultationFee}</p>
                            <button
                              onClick={() => handleBookAppointment(doctor.id)}
                              className="mt-2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span>{doctor.location}</span>
                          <PhoneIcon className="h-4 w-4 ml-4 mr-1" />
                          <span>{doctor.phone}</span>
                        </div>
                      </div>
                    ))}
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

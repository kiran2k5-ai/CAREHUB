'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthData } from '@/lib/authUtils';
import AuthGuard from '@/components/AuthGuard';
import {
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  FunnelIcon,
  ChevronLeftIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolid,
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  location: string;
  availability: string;
  nextSlot: string;
  image: string;
  isAvailable: boolean;
  isFavorite: boolean;
  distance: string;
  languages: string[];
  qualifications: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Auth is now handled by AuthGuard, just get the auth data
    const authData = getAuthData();
    if (authData) {
      setUser(authData.userData);
      console.log('User authenticated for booking:', authData.userData);
    }

    const savedFavorites = localStorage.getItem('doctorFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [router]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch doctors from database on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching doctors from database for booking page...');
        
        const response = await fetch('/api/doctors');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.doctors) {
            console.log('✅ Loaded doctors from database:', result.data.doctors);
            setDoctors(result.data.doctors);
          } else {
            console.error('❌ Invalid doctors response:', result);
            setDoctors([]);
          }
        } else {
          console.error('❌ Failed to fetch doctors:', response.status);
          setDoctors([]);
        }
      } catch (error) {
        console.error('❌ Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specialties = [
    'All',
    'Psychologist',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedic',
    'Pediatrician',
    'Gynecologist'
  ];

  const toggleFavorite = (doctorId: string) => {
    const updatedFavorites = favorites.includes(doctorId)
      ? favorites.filter(id => id !== doctorId)
      : [...favorites, doctorId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('doctorFavorites', JSON.stringify(updatedFavorites));
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            doctor.specialization.toLowerCase() === selectedSpecialty.toLowerCase();
    
    return matchesSearch && matchesSpecialty;
  });

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarSolid key={i} className="w-4 h-4 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="w-4 h-4 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <AuthGuard requiredUserType="patient">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 -ml-2"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Hello, {user.name.split(' ')[0]}
                </h1>
                <p className="text-sm text-gray-500">@ Downtown, Mumbai</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Doctors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
          >
            <FunnelIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Specialty Filter */}
        {showFilters && (
          <div className="mt-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty.toLowerCase())}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border ${
                    selectedSpecialty === specialty.toLowerCase()
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${filteredDoctors.length} doctors available`}
        </p>
      </div>

      {/* Doctors List */}
      <div className="px-4 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <span className="ml-3 text-gray-600">Loading doctors from database...</span>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Doctor Image */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLDivElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center hidden">
                          <span className="text-white font-semibold text-xl">
                            {doctor.name.split(' ')[1]?.charAt(0) || 'D'}
                          </span>
                        </div>
                      </div>
                      {/* Online Status */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">S</span>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                          <p className="text-cyan-600 text-sm font-medium">{doctor.specialization}</p>
                          <p className="text-gray-500 text-sm">{doctor.experience} experience</p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(doctor.id)}
                          className="p-1"
                        >
                          {favorites.includes(doctor.id) ? (
                            <HeartSolid className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Rating and Reviews */}
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex space-x-1">
                          {renderStars(doctor.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {doctor.rating} ({doctor.reviewCount} reviews)
                        </span>
                      </div>

                      {/* Availability */}
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {doctor.availability}
                        </span>
                      </div>

                      {/* Location and Time */}
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{doctor.distance}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{doctor.nextSlot}</span>
                        </div>
                      </div>

                      {/* Fee and Book Button */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-1">
                          <CurrencyRupeeIcon className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-900">₹{doctor.consultationFee}</span>
                          <span className="text-sm text-gray-500">/ consultation</span>
                        </div>
                        <button
                          onClick={() => router.push(`/book-appointment/${doctor.id}`)}
                          className="bg-cyan-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}

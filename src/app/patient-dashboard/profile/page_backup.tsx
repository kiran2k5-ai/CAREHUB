'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '../../../lib/useProfile';
import { LocalStorageManager } from '../../../lib/storage';
import {
  UserCircleIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  PhoneIcon,
  CalendarDaysIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  profileImage?: string;
}

interface ProfileMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  showChevron?: boolean;
  color?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  
  // Use the new localStorage-enabled profile hook
  const {
    profile,
    loading,
    saving,
    error,
    updateProfile
  } = useProfile('user123');
  
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setUser(profile);
      setEditForm(profile);
    }
  }, [profile]);

  // Initialize localStorage on component mount
  useEffect(() => {
    LocalStorageManager.initializeDefaultData();
  }, []);

  const saveProfile = async () => {
    try {
      const result = await updateProfile(editForm);
      
      if (result.success) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      LocalStorageManager.logout();
      router.push('/login');
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const menuItems: ProfileMenuItem[] = [
    {
      id: 'personal-info',
      label: 'Personal Information',
      icon: <UserCircleIcon className="w-6 h-6" />,
      action: () => setIsEditing(true),
      showChevron: true
    },
    {
      id: 'medical-info',
      label: 'Medical Information',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      action: () => setActiveModal('medical-info'),
      showChevron: true
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <BellIcon className="w-6 h-6" />,
      action: () => setActiveModal('notifications'),
      showChevron: true
    },
    {
      id: 'privacy',
      label: 'Privacy & Security',
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      action: () => setActiveModal('privacy'),
      showChevron: true
    },
    {
      id: 'password',
      label: 'Change Password',
      icon: <LockClosedIcon className="w-6 h-6" />,
      action: () => setActiveModal('change-password'),
      showChevron: true
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
      action: () => setActiveModal('help'),
      showChevron: true
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <ArrowRightOnRectangleIcon className="w-6 h-6" />,
      action: handleLogout,
      showChevron: false,
      color: 'text-red-600'
    }
  ];

  // Modal components
  const renderModal = () => {
    switch (activeModal) {
      case 'medical-info':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  <textarea
                    placeholder="List any allergies..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="Emergency contact name and phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    alert('Medical information saved!');
                  }}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                    <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive SMS for important updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Get email updates and newsletters</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    alert('Notification preferences saved!');
                  }}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        );

      case 'change-password':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    alert('Password changed successfully!');
                  }}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Help & Support</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="space-y-3">
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900">📞 Contact Support</h4>
                    <p className="text-sm text-gray-600 mt-1">Call us at +1-800-DOCTOR</p>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900">💬 Live Chat</h4>
                    <p className="text-sm text-gray-600 mt-1">Chat with our support team</p>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900">📧 Email Support</h4>
                    <p className="text-sm text-gray-600 mt-1">support@doctorbooking.com</p>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900">❓ FAQ</h4>
                    <p className="text-sm text-gray-600 mt-1">Find answers to common questions</p>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 -ml-2"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
              </div>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-semibold text-2xl">
                  {user.name.charAt(0)}
                </span>
              </div>
              <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg border border-gray-200">
                <CameraIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={editForm.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={editForm.dateOfBirth || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={editForm.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={editForm.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter your address"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Dynamic Header */}
      <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        
        <div className="relative px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-white hover:bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-white hover:bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <PencilIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Header */}
          <div className="text-center">
            {/* Avatar with Status */}
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl backdrop-blur-sm bg-white/90">
                <span className="text-cyan-600 font-bold text-3xl">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
            <p className="text-white/80 mb-6">{user.email}</p>

            {/* Health Score Circle */}
            <div className="relative mx-auto w-32 h-32 mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="white"
                  strokeOpacity="0.2"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="white"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.85)}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">85</div>
                  <div className="text-xs text-white/80">Health Score</div>
                </div>
              </div>
            </div>

            <div className="text-white/90 text-sm">
              🏆 Excellent Health Status
            </div>
          </div>
        </div>
      </div>

      </div>

      {/* Health Statistics Dashboard */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Completed Appointments */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">8</div>
              <div className="text-xs text-gray-600">Completed</div>
              <div className="text-xs text-gray-500">Appointments</div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">📅</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">2</div>
              <div className="text-xs text-gray-600">Upcoming</div>
              <div className="text-xs text-gray-500">Scheduled</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 text-xl">🏆</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
              <div className="text-xs text-gray-600">Health</div>
              <div className="text-xs text-gray-500">Achievements</div>
            </div>
          </div>
        </div>

        {/* Achievement System */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Health Achievements</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">3/4 Earned</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Health Pioneer */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🏆</span>
                </div>
                <div>
                  <h4 className="font-medium text-green-900 text-sm">Health Pioneer</h4>
                  <p className="text-green-700 text-xs">First checkup completed</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-green-600 text-xs">Earned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consistent Care */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">❤️</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">Consistent Care</h4>
                  <p className="text-blue-700 text-xs">5 appointments attended</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    <span className="text-blue-600 text-xs">Earned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preventive Care Champion */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">⭐</span>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900 text-sm">Preventive Champion</h4>
                  <p className="text-purple-700 text-xs">Annual checkup done</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                    <span className="text-purple-600 text-xs">Earned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medication Adherence (Upcoming) */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 opacity-60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🔥</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Medication Master</h4>
                  <p className="text-gray-600 text-xs">30-day compliance</p>
                  <div className="flex items-center mt-1">
                    <div className="w-8 bg-gray-200 rounded-full h-1 mr-2">
                      <div className="bg-orange-500 h-1 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-gray-500 text-xs">70% (21/30)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Phone</p>
                    <p className="text-blue-900 font-semibold">{user?.phone}</p>
                  </div>
                </div>
                <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Date of Birth */}
            {user?.dateOfBirth && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">Date of Birth</p>
                      <p className="text-green-900 font-semibold">
                        {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Health Info */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600 text-lg">🩸</span>
                    <div>
                      <p className="text-sm text-red-800 font-medium">Blood Type</p>
                      <p className="text-red-900 font-semibold">O+</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600 text-lg">📋</span>
                    <div>
                      <p className="text-sm text-red-800 font-medium">Last Checkup</p>
                      <p className="text-red-900 font-semibold">July 15, 2025</p>
                    </div>
                  </div>
                </div>
                <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Professional Menu Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`w-full flex items-center justify-between px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              index === menuItems.length - 1 ? 'border-b-0' : ''
            }`}
          >
            <div className={`flex items-center space-x-3 ${item.color || 'text-gray-900'}`}>
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
            {item.showChevron && (
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
        ))}
      </div>
      
      {/* Render active modal */}
      {activeModal && renderModal()}
    </div>
  );
}

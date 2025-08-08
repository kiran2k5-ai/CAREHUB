'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon,
  BellIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  phone: string;
  dateOfBirth?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  action: () => void;
  color?: string;
  showChevron?: boolean;
}

type ModalType = 'notifications' | 'settings' | 'help' | 'report' | 'privacy';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const renderModal = () => {
    const modalContent = {
      notifications: {
        title: 'Notification Settings',
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Appointment Reminders</h4>
                <p className="text-sm text-blue-700">Get notified before your appointments</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">Health Tips</h4>
                <p className="text-sm text-green-700">Receive daily health recommendations</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-medium text-purple-900">Medication Alerts</h4>
                <p className="text-sm text-purple-700">Never miss your medications</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
          </div>
        ),
      },
      settings: {
        title: 'App Settings',
        content: (
          <div className="space-y-4">
            <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h4 className="font-medium text-gray-900">Language</h4>
              <p className="text-sm text-gray-600">English (US)</p>
            </button>
            <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h4 className="font-medium text-gray-900">Time Zone</h4>
              <p className="text-sm text-gray-600">Pacific Standard Time</p>
            </button>
            <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h4 className="font-medium text-gray-900">App Theme</h4>
              <p className="text-sm text-gray-600">Light Mode</p>
            </button>
          </div>
        ),
      },
      help: {
        title: 'Help & Support',
        content: (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Frequently Asked Questions</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• How do I book an appointment?</li>
                <li>• How can I reschedule my appointment?</li>
                <li>• Where can I find my medical records?</li>
                <li>• How do I update my profile information?</li>
              </ul>
            </div>
            <button className="w-full p-4 bg-green-50 rounded-lg text-left hover:bg-green-100">
              <h4 className="font-medium text-green-900">Contact Support</h4>
              <p className="text-sm text-green-700">Get help from our support team</p>
            </button>
          </div>
        ),
      },
      report: {
        title: 'Report Issue',
        content: (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-lg">
                <option>Technical Problem</option>
                <option>Booking Issue</option>
                <option>Payment Problem</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg h-24"
                placeholder="Please describe the issue..."
              ></textarea>
            </div>
            <button className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700">
              Submit Report
            </button>
          </div>
        ),
      },
      privacy: {
        title: 'Privacy & Security',
        content: (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Data Protection
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Your medical data is encrypted and secure
              </p>
            </div>
            <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h4 className="font-medium text-gray-900">Privacy Policy</h4>
              <p className="text-sm text-gray-600">Read our privacy policy</p>
            </button>
            <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h4 className="font-medium text-gray-900">Data Download</h4>
              <p className="text-sm text-gray-600">Download your data</p>
            </button>
            <button className="w-full text-left p-4 bg-red-50 rounded-lg hover:bg-red-100">
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700">Permanently delete your account</p>
            </button>
          </div>
        ),
      },
    };

    const currentModal = modalContent[activeModal!];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
        <div className="bg-white rounded-t-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentModal.title}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-4">{currentModal.content}</div>
        </div>
      </div>
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <BellIcon className="w-5 h-5" />,
      action: () => setActiveModal('notifications'),
      showChevron: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <CogIcon className="w-5 h-5" />,
      action: () => setActiveModal('settings'),
      showChevron: true,
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
      action: () => setActiveModal('help'),
      showChevron: true,
    },
    {
      id: 'report',
      label: 'Report Issue',
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
      action: () => setActiveModal('report'),
      color: 'text-orange-600',
      showChevron: true,
    },
    {
      id: 'privacy',
      label: 'Privacy & Security',
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      action: () => setActiveModal('privacy'),
      showChevron: true,
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
      action: handleLogout,
      color: 'text-red-600',
    },
  ];

  // Profile picture helper
  const getProfilePicture = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=22d3ee&color=fff&bold=true`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* Enhanced Gradient Header with Profile */}
      <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 px-4 pt-16 pb-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Profile Content */}
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <img
                src={getProfilePicture(user.name)}
                alt={user.name}
                className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Welcome back, {user.name}!
              </h1>
              <p className="text-white/80 text-sm">Your health journey continues</p>
            </div>
          </div>

          {/* Circular Health Score */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-2">Health Score</h3>
                <div className="flex items-center space-x-2 text-white/90 text-sm">
                  <span>🏆 Excellent Health Status</span>
                </div>
              </div>
              
              {/* Circular Progress */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="white"
                    strokeOpacity="0.3"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeDasharray={`${85 * 2.51} 251.2`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">85</div>
                    <div className="text-xs text-white/80">Score</div>
                  </div>
                </div>
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
                    <p className="text-blue-900 font-semibold">{user.phone}</p>
                  </div>
                </div>
                <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Date of Birth */}
            {user.dateOfBirth && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">Date of Birth</p>
                      <p className="text-green-900 font-semibold">
                        {new Date(user.dateOfBirth).toLocaleDateString()}
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
      </div>
      
      {/* Render active modal */}
      {activeModal && renderModal()}
    </div>
  );
}

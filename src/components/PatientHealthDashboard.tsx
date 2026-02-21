'use client';

import { useState, useEffect } from 'react';
import {
  HeartIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  TrophyIcon,
  ChartBarIcon,
  UserIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit?: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  icon: React.ComponentType<any>;
}

interface PatientStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalConsultationFees: number;
  favoriteDoctor: string;
  memberSince: string;
  healthScore: number;
  lastCheckup: string;
}

interface PatientHealthDashboardProps {
  patientId: string;
  className?: string;
  showHealthMetrics?: boolean;
  showStats?: boolean;
  showAchievements?: boolean;
}

export default function PatientHealthDashboard({
  patientId,
  className = '',
  showHealthMetrics = true,
  showStats = true,
  showAchievements = true
}: PatientHealthDashboardProps) {
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock health metrics for demo
  const defaultHealthMetrics: HealthMetric[] = [
    {
      id: '1',
      name: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      status: 'normal',
      trend: 'stable',
      lastUpdated: '2025-01-10',
      icon: HeartIcon
    },
    {
      id: '2',
      name: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'normal',
      trend: 'down',
      lastUpdated: '2025-01-10',
      icon: HeartIcon
    },
    {
      id: '3',
      name: 'Weight',
      value: '68.5',
      unit: 'kg',
      status: 'normal',
      trend: 'down',
      lastUpdated: '2025-01-09',
      icon: ChartBarIcon
    },
    {
      id: '4',
      name: 'BMI',
      value: '23.4',
      unit: '',
      status: 'normal',
      trend: 'stable',
      lastUpdated: '2025-01-09',
      icon: ChartBarIcon
    }
  ];

  // Load patient statistics
  const loadPatientStats = async () => {
    setLoading(true);
    try {
      // Load appointments for stats calculation
      const appointmentsResponse = await fetch(`/api/appointments?patientId=${patientId}`);
      const appointmentsData = await appointmentsResponse.json();
      const appointments = appointmentsData.data || [];

      // Calculate stats
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const upcoming = appointments.filter((apt: any) => 
        apt.date >= today && (apt.status === 'scheduled' || apt.status === 'SCHEDULED')
      );
      const completed = appointments.filter((apt: any) => 
        apt.status === 'completed' || apt.status === 'COMPLETED'
      );
      
      const totalFees = appointments.reduce((sum: number, apt: any) => 
        sum + (apt.consultationFee || 500), 0
      );

      // Find favorite doctor (most frequent)
      const doctorCounts: Record<string, number> = {};
      appointments.forEach((apt: any) => {
        const doctorName = apt.doctorName || apt.doctor?.name || 'Unknown';
        doctorCounts[doctorName] = (doctorCounts[doctorName] || 0) + 1;
      });
      
      const favoriteDoctor = Object.entries(doctorCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

      // Calculate health score (mock calculation)
      const healthScore = Math.min(100, Math.max(60, 
        85 + (completed.length * 2) - (upcoming.length > 5 ? 10 : 0)
      ));

      setStats({
        totalAppointments: appointments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        totalConsultationFees: totalFees,
        favoriteDoctor,
        memberSince: '2024-06-15', // Mock date
        healthScore,
        lastCheckup: completed.length > 0 ? completed[completed.length - 1].date : 'Never'
      });

      // Set health metrics
      setHealthMetrics(defaultHealthMetrics);

    } catch (error) {
      console.error('Error loading patient stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadPatientStats();
    }
  }, [patientId]);

  const getStatusColor = (status: HealthMetric['status']) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: HealthMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Health Score & Overview */}
      {stats && (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Health Overview</h3>
              <p className="text-cyan-100 text-sm">Your health journey at a glance</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-lg font-bold ${getHealthScoreColor(stats.healthScore)} text-white bg-white bg-opacity-20`}>
              {stats.healthScore}/100
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-cyan-100">Member Since</p>
              <p className="font-semibold">{new Date(stats.memberSince).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-cyan-100">Last Checkup</p>
              <p className="font-semibold">
                {stats.lastCheckup === 'Never' ? 'Never' : new Date(stats.lastCheckup).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Health Metrics */}
      {showHealthMetrics && healthMetrics.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Metrics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {healthMetrics.map((metric) => (
              <div
                key={metric.id}
                className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="w-5 h-5" />
                    <h5 className="font-medium">{metric.name}</h5>
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  {metric.unit && <span className="text-sm">{metric.unit}</span>}
                </div>
                
                <p className="text-xs mt-2 opacity-75">
                  Updated {new Date(metric.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      {showStats && stats && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                  <p className="text-sm text-gray-600">Total Visits</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CurrencyRupeeIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalConsultationFees}</p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Doctor */}
          {stats.favoriteDoctor !== 'None' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <StarSolid className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-yellow-800">Favorite Doctor</p>
                  <p className="text-sm text-yellow-700">{stats.favoriteDoctor}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Health Achievements */}
      {showAchievements && stats && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Achievements</h4>
          <div className="space-y-3">
            {stats.completedAppointments >= 1 && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">First Consultation</p>
                  <p className="text-sm text-green-600">Completed your first medical consultation</p>
                </div>
              </div>
            )}

            {stats.completedAppointments >= 5 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <HeartSolid className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Health Enthusiast</p>
                  <p className="text-sm text-blue-600">Completed 5+ consultations</p>
                </div>
              </div>
            )}

            {stats.healthScore >= 80 && (
              <div className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <StarSolid className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Health Champion</p>
                  <p className="text-sm text-purple-600">Maintaining excellent health score</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';

export default function DatabaseTestPage() {
  const [results, setResults] = useState<Array<{message: string, type: string}>>([]);

  const addResult = (message: string, type: string = 'info') => {
    setResults(prev => [...prev, { message, type }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testDatabaseConnection = async () => {
    addResult('🔍 Testing database connection...', 'info');
    
    try {
      const response = await fetch('/api/db-test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Database connection successful!
📊 User count: ${data.data.userCount}
⏰ Timestamp: ${data.data.timestamp}`, 'success');
      } else {
        const errorData = await response.json();
        addResult(`❌ Database connection failed
Error: ${errorData.message}
${errorData.error || ''}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error testing database: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const createTestAppointment = async () => {
    const appointmentData = {
      patientId: 'patient_9042222856',
      doctorId: 'doctor_9876543210',
      date: new Date().toISOString().split('T')[0], // Today
      time: '15:00',
      consultationType: 'IN_PERSON',
      consultationFee: 500,
      reason: 'Database test appointment'
    };

    addResult('🔄 Creating test appointment...', 'info');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Test appointment created successfully!
📅 Appointment ID: ${data.id}
👨‍⚕️ Doctor: ${data.doctorName}
👤 Patient: ${data.patientName}
📍 Date: ${data.date} at ${data.time}`, 'success');
      } else {
        const errorData = await response.text();
        addResult(`❌ Failed to create appointment
Response: ${errorData}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error creating appointment: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const fetchDoctorAppointments = async (doctorId = 'doctor_9876543210') => {
    addResult(`🔄 Fetching appointments for doctor: ${doctorId}`, 'info');

    try {
      const response = await fetch(`/api/doctor/appointments?doctorId=${doctorId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Doctor appointments fetched successfully!
📊 Found ${data.total} appointments
📅 Appointments: ${JSON.stringify(data.data, null, 2)}`, 'success');
      } else {
        const errorData = await response.text();
        addResult(`❌ Failed to fetch appointments
Response: ${errorData}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error fetching appointments: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const fetchPatientAppointments = async (patientId = 'patient_9042222856') => {
    addResult(`🔄 Fetching appointments for patient: ${patientId}`, 'info');

    try {
      const response = await fetch(`/api/appointments?patientId=${patientId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Patient appointments fetched successfully!
📊 Found ${data.data.length} appointments
📅 Appointments: ${JSON.stringify(data.data, null, 2)}`, 'success');
      } else {
        const errorData = await response.text();
        addResult(`❌ Failed to fetch patient appointments
Response: ${errorData}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error fetching patient appointments: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const runAllTests = async () => {
    clearResults();
    addResult('🚀 Starting Database Tests...', 'info');
    addResult('==============================', 'info');

    await testDatabaseConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await createTestAppointment();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await fetchDoctorAppointments();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await fetchPatientAppointments();
    await new Promise(resolve => setTimeout(resolve, 1000));

    addResult('✅ All tests completed!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 CareHub Database Test</h1>
          <p className="text-gray-600 mb-6">This page helps you test your database connection and deployment.</p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <button 
              onClick={testDatabaseConnection}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              🔍 Test Database Connection
            </button>
            <button 
              onClick={createTestAppointment}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              📅 Create Test Appointment
            </button>
            <button 
              onClick={fetchDoctorAppointments}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              👨‍⚕️ Fetch Doctor Appointments
            </button>
            <button 
              onClick={fetchPatientAppointments}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              👤 Fetch Patient Appointments
            </button>
            <button 
              onClick={runAllTests}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              🎯 Run All Tests
            </button>
            <button 
              onClick={clearResults}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              🗑️ Clear Results
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-md font-mono text-sm whitespace-pre-wrap ${
                  result.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                  result.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                  'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                {result.message}
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Click any button above to start testing your database connection
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Database Setup Checklist</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">☐</span>
              <span>Deploy database schema to Supabase (run database-schema.sql)</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">☐</span>
              <span>Load sample data (run sample-data.sql)</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">☐</span>
              <span>Test database connection</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">☐</span>
              <span>Test appointment creation</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">☐</span>
              <span>Verify login with demo credentials</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-semibold text-yellow-800 mb-2">📝 Demo Login Credentials</h3>
            <div className="text-sm text-yellow-700">
              <p><strong>Doctors:</strong> 9876543210, 9876543211, 9876543212</p>
              <p><strong>Patients:</strong> 9042222856, 9042222857, 9042222858</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';

export default function BookingTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBookingFlow = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Step 1: Create a test appointment
      console.log('Step 1: Creating test appointment...');
      const bookingResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: 'patient_9042222856',
          doctorId: 'demo',
          date: new Date().toISOString().split('T')[0], // Today
          time: '2:30 PM',
          consultationType: 'IN_PERSON',
          consultationFee: 500,
          reason: 'Test booking to verify doctor-patient appointment flow'
        }),
      });

      const bookingResult = await bookingResponse.json();
      console.log('Booking result:', bookingResult);

      if (!bookingResult.success) {
        throw new Error(`Booking failed: ${bookingResult.error || 'Unknown error'}`);
      }

      // Step 2: Fetch doctor's appointments to verify it appears
      console.log('Step 2: Fetching doctor appointments...');
      const doctorAppointmentsResponse = await fetch('/api/doctor/appointments?doctorId=demo');
      const doctorAppointmentsResult = await doctorAppointmentsResponse.json();
      console.log('Doctor appointments result:', doctorAppointmentsResult);

      // Step 3: Fetch patient's appointments to verify it appears there too
      console.log('Step 3: Fetching patient appointments...');
      const patientAppointmentsResponse = await fetch('/api/appointments?userId=patient_9042222856&userType=PATIENT');
      const patientAppointmentsResult = await patientAppointmentsResponse.json();
      console.log('Patient appointments result:', patientAppointmentsResult);

      setResult({
        success: true,
        bookingData: bookingResult.data,
        doctorAppointments: doctorAppointmentsResult.data || [],
        patientAppointments: patientAppointmentsResult.data || [],
        summary: {
          appointmentCreated: bookingResult.success,
          visibleToDoctorCount: doctorAppointmentsResult.data?.length || 0,
          visibleToPatientCount: patientAppointmentsResult.data?.length || 0,
          appointmentId: bookingResult.data?.id
        }
      });

    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dynamic Booking System Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Doctor-Patient Appointment Flow
          </h2>
          <p className="text-gray-600 mb-6">
            This test will:
            <br />• Create an appointment for patient with doctor
            <br />• Verify it appears in doctor's appointment list
            <br />• Verify it appears in patient's appointment list
            <br />• Confirm the dynamic booking system is working
          </p>
          
          <button
            onClick={testBookingFlow}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
          >
            {loading ? 'Running Test...' : 'Test Booking Flow'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Test Results
            </h3>
            
            {result.success ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Test Passed!</h4>
                  <div className="text-green-700 text-sm space-y-1">
                    <p>• Appointment Created: {result.summary.appointmentCreated ? 'Yes' : 'No'}</p>
                    <p>• Appointment ID: {result.summary.appointmentId}</p>
                    <p>• Visible to Doctor: {result.summary.visibleToDoctorCount} appointments</p>
                    <p>• Visible to Patient: {result.summary.visibleToPatientCount} appointments</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Doctor's View</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      {result.doctorAppointments.length > 0 ? (
                        result.doctorAppointments.map((apt: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-3 mb-2 border">
                            <p className="font-medium">Patient: {apt.patientName || apt.patient?.name}</p>
                            <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                            <p className="text-sm text-gray-600">Status: {apt.status}</p>
                            <p className="text-sm text-gray-600">Reason: {apt.reason}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No appointments found</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Patient's View</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      {result.patientAppointments.length > 0 ? (
                        result.patientAppointments.map((apt: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-3 mb-2 border">
                            <p className="font-medium">Dr. {apt.doctorName}</p>
                            <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                            <p className="text-sm text-gray-600">Status: {apt.status}</p>
                            <p className="text-sm text-gray-600">Type: {apt.consultationType}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No appointments found</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">❌ Test Failed</h4>
                <p className="text-red-700 text-sm">{result.error}</p>
              </div>
            )}
            
            <details className="mt-6">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                View Raw Test Data
              </summary>
              <pre className="mt-3 bg-gray-100 rounded-lg p-4 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Quick Navigation to Test
          </h3>
          <div className="space-y-2">
            <a 
              href="/login" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Login as Doctor (to see appointments)
            </a>
            <a 
              href="/doctor-dashboard/appointments" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Doctor Appointments Page (direct)
            </a>
            <a 
              href="/patient-dashboard/appointments" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Patient Appointments Page (direct)
            </a>
            <a 
              href="/book-appointment/demo" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Book Appointment with Demo Doctor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
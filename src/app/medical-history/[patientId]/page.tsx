'use client';

import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  BellIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

// Mock patient data
const mockData = [
  {
    id: '123',
    name: 'John Doe',
    history: [
      {
        date: '2025-08-01',
        diagnosis: 'Fever',
        prescription: 'Paracetamol 500mg',
        notes: 'Take every 6 hours after food.',
        doctor: 'Dr. Smith',
      },
    ],
  },
  {
    id: '456',
    name: 'Alice Smith',
    history: [
      {
        date: '2025-08-05',
        diagnosis: 'Migraine',
        prescription: 'Pain relievers',
        notes: 'Avoid screen time, reduce caffeine.',
        doctor: 'Dr. Sharma',
      },
    ],
  },
  {
    id: '789',
    name: 'Robert Johnson',
    history: [
      {
        date: '2025-07-20',
        diagnosis: 'Sprained ankle',
        prescription: 'RICE method',
        notes: 'Use ankle brace if needed.',
        doctor: 'Dr. Patel',
      },
    ],
  },
];

// Mock reviews
const mockReviews = [
  { rating: 5, text: 'Excellent care!', patient: 'John Doe' },
  { rating: 4, text: 'Very helpful.', patient: 'Alice Smith' },
  { rating: 3, text: 'Good, but can improve.', patient: 'Robert Johnson' },
];

interface Props {
  params: {
    patientId: string;
  };
}

export default function PatientMedicalHistory({ params }: Props) {
  const { patientId } = params || { patientId: '123' }; // Default for demo
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    reviewText: ''
  });
  const [currentPath] = useState('/medical-history'); // Mock current path

  // Navigation Item Component
  const NavItem = ({ href, icon, label, active, badgeCount }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    badgeCount?: number;
  }) => (
    <a
      href={href}
      className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
        active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <div className="relative">
        {icon}
        {badgeCount && badgeCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {badgeCount}
          </span>
        )}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </a>
  );

  useEffect(() => {
    const found = mockData.find((p) => p.id === patientId);
    setPatient(found || mockData[0]); // Default to first patient for demo
  }, [patientId]);

  // Enhanced PDF generation with better formatting
  const downloadPDF = (entry: any) => {
    const currentDate = new Date().toLocaleDateString();
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Medical Prescription</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 40px; 
            color: #333; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #0891b2; 
            padding-bottom: 20px; 
          }
          .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #0891b2; 
            margin-bottom: 5px;
          }
          .clinic-info { 
            margin-top: 10px; 
            color: #666; 
            font-size: 14px;
          }
          .prescription-title { 
            font-size: 24px; 
            font-weight: bold; 
            margin: 30px 0; 
            text-align: center;
            color: #1f2937;
          }
          .info-section {
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            border-left: 4px solid #0891b2;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .info-item {
            margin-bottom: 8px;
          }
          .label {
            font-weight: bold;
            color: #374151;
          }
          .diagnosis-section {
            background: #ecfdf5; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #10b981;
          }
          .prescription-section {
            background: #fef3c7; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          .notes-section {
            background: #dbeafe; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .footer { 
            margin-top: 50px; 
            padding-top: 20px;
            text-align: center; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
          }
          .signature-section {
            margin-top: 60px;
            text-align: right;
          }
          .signature-line {
            margin-top: 40px;
            border-top: 1px solid #333;
            width: 200px;
            margin-left: auto;
            padding-top: 5px;
            text-align: center;
            font-size: 12px;
          }
          .warning {
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            color: #991b1b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏥 HealthCare Plus Clinic</div>
          <div class="clinic-info">
            123 Health Street, Wellness City, Tamil Nadu, India<br>
            Phone: +91-9876543210 | Email: contact@healthcareplus.com<br>
            License No: HC/TN/2025/001234
          </div>
        </div>
        
        <div class="prescription-title">MEDICAL PRESCRIPTION</div>
        
        <div class="info-section">
          <h3 style="margin-top: 0; color: #1f2937;">Patient & Appointment Information</h3>
          <div class="info-grid">
            <div>
              <div class="info-item"><span class="label">Patient Name:</span> ${patient.name}</div>
              <div class="info-item"><span class="label">Patient ID:</span> ${patientId}</div>
              <div class="info-item"><span class="label">Date of Consultation:</span> ${entry.date}</div>
            </div>
            <div>
              <div class="info-item"><span class="label">Attending Doctor:</span> ${entry.doctor || 'Dr. Not Specified'}</div>
              <div class="info-item"><span class="label">Prescription Date:</span> ${currentDate}</div>
              <div class="info-item"><span class="label">Prescription ID:</span> RX${patientId}_${Date.now()}</div>
            </div>
          </div>
        </div>
        
        <div class="diagnosis-section">
          <h3 style="margin-top: 0; color: #065f46;">Clinical Diagnosis</h3>
          <p style="margin: 0; font-size: 16px;">${entry.diagnosis}</p>
        </div>
        
        <div class="prescription-section">
          <h3 style="margin-top: 0; color: #92400e;">Prescribed Treatment</h3>
          <p style="margin: 0; font-size: 16px; font-weight: 500;">${entry.prescription}</p>
        </div>
        
        <div class="notes-section">
          <h3 style="margin-top: 0; color: #1e40af;">Instructions & Notes</h3>
          <p style="margin: 0; font-size: 14px;">${entry.notes}</p>
        </div>
        
        <div class="warning">
          <h4 style="margin-top: 0; color: #991b1b;">⚠️ Important Instructions</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Take medications as prescribed by the doctor</li>
            <li>Complete the full course of treatment</li>
            <li>Contact the clinic if you experience any adverse effects</li>
            <li>This prescription is valid for 30 days from the date of issue</li>
          </ul>
        </div>
        
        <div class="signature-section">
          <p><strong>Doctor's Signature</strong></p>
          <div class="signature-line">
            ${entry.doctor || 'Dr. Not Specified'}
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Disclaimer:</strong> This is a digitally generated prescription.</p>
          <p>For any queries or clarifications, please contact our clinic.</p>
          <p>Generated on: ${currentDate} | System: HealthCare Plus v2.0</p>
        </div>
      </body>
      </html>
    `;

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prescription_${patient.name.replace(/\s+/g, '_')}_${entry.date}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Prescription downloaded! You can convert the HTML file to PDF using your browser\'s print function (Ctrl+P → Save as PDF).');
  };

  // Review form functions
  const openReviewForm = (entry: any) => {
    setSelectedEntry(entry);
    setShowReviewForm(true);
    // Check if review already exists for this entry
    const existingReview = mockReviews.find(r => r.patient === patient.name);
    if (existingReview) {
      setReviewForm({
        rating: existingReview.rating,
        reviewText: existingReview.text
      });
    }
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleReviewSubmit = () => {
    if (reviewForm.rating === 0) {
      alert('Please provide a rating before submitting.');
      return;
    }

    // In a real app, this would send data to backend
    console.log('Review submitted:', {
      patientId,
      entryDate: selectedEntry.date,
      rating: reviewForm.rating,
      review: reviewForm.reviewText
    });

    alert('Thank you for your review! Your feedback has been submitted successfully.');
    setShowReviewForm(false);
    setReviewForm({ rating: 0, reviewText: '' });
    setSelectedEntry(null);
  };

  if (!patient) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🩺 Medical History</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-lg">❌ No patient found with ID: {patientId}</p>
          </div>
        </div>
      </main>
    );
  }

  const patientFeedback = mockReviews.filter(
    (review) => review.patient === patient.name
  );
  const averageRating =
    patientFeedback.reduce((sum, r) => sum + r.rating, 0) /
    (patientFeedback.length || 1);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🩺 Medical History</h1>
          <h2 className="text-lg text-gray-600">
            Patient: <span className="font-semibold text-blue-600">{patient.name}</span> (ID: {patientId})
          </h2>
        </div>

        <div className="space-y-6">
          {[...patient.history].reverse().map((entry: any, index: number) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 overflow-hidden"
            >
              <button
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Consultation - {entry.date}</h3>
                      <p className="text-sm text-gray-600">{entry.doctor}</p>
                    </div>
                  </div>
                  <div className="text-blue-500 font-medium">
                    {expandedIndex === index ? '▲ Collapse' : '▼ Expand'}
                  </div>
                </div>
              </button>

              {expandedIndex === index && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="mt-4 space-y-4">
                    {/* Medical Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">📋 Diagnosis</h4>
                        <p className="text-green-700">{entry.diagnosis}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">💊 Prescription</h4>
                        <p className="text-blue-700">{entry.prescription}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2">📝 Clinical Notes</h4>
                      <p className="text-yellow-700">{entry.notes}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <button
                        onClick={() => downloadPDF(entry)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>📄</span>
                        <span>Download PDF</span>
                      </button>
                      <button
                        onClick={() => openReviewForm(entry)}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <span>⭐</span>
                        <span>Rate Appointment</span>
                      </button>
                      <button
                        onClick={() => setShowFeedback(!showFeedback)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <span>🗣️</span>
                        <span>{showFeedback ? 'Hide Feedback' : 'View Feedback'}</span>
                      </button>
                    </div>

                    {/* Feedback Section */}
                    {showFeedback && patientFeedback.length > 0 && (
                      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="text-lg font-semibold mb-3 text-blue-700 flex items-center">
                          <span className="mr-2">📊</span>
                          Patient Feedback
                        </h4>
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-gray-700 font-medium">
                            Average Rating: <span className="text-blue-600 text-lg">{averageRating.toFixed(1)}/5</span>
                          </p>
                        </div>
                        <div className="space-y-3">
                          {patientFeedback.map((review, i) => (
                            <div key={i} className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                              <div className="flex items-center mb-2">
                                <div className="flex text-yellow-400 mr-2">
                                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                <span className="text-sm text-gray-600">({review.rating}/5)</span>
                              </div>
                              <p className="text-gray-800 text-sm italic">"{review.text}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showFeedback && patientFeedback.length === 0 && (
                      <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-4xl mb-3 block">📝</span>
                        <p className="text-gray-500 italic">No feedback submitted for this appointment yet.</p>
                        <button
                          onClick={() => openReviewForm(entry)}
                          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Be the first to review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Records Message */}
        {patient.history.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <span className="text-6xl mb-4 block">🏥</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical History</h3>
            <p className="text-gray-500">This patient has no recorded medical history yet.</p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-500 text-xl">✕</span>
                </button>
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">👨‍⚕️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{selectedEntry.doctor}</h3>
                    <p className="text-xs text-gray-600">Consultation Date</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{selectedEntry.date}</p>
              </div>

              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate this appointment? *
                </label>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className="transition-all duration-200 hover:scale-110"
                    >
                      <span
                        className={`text-3xl ${
                          star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-300`}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-600">
                    {reviewForm.rating === 0 && 'Click to rate'}
                    {reviewForm.rating === 1 && '😞 Poor'}
                    {reviewForm.rating === 2 && '😐 Fair'}
                    {reviewForm.rating === 3 && '🙂 Good'}
                    {reviewForm.rating === 4 && '😊 Very Good'}
                    {reviewForm.rating === 5 && '🤩 Excellent'}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share your experience (optional)
                </label>
                <textarea
                  value={reviewForm.reviewText}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                  placeholder="Tell us about your experience with this appointment..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {reviewForm.reviewText.length}/500 characters
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewForm.rating === 0}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-4">
          <NavItem 
            href="/doctor-dashboard" 
            icon={<HomeIcon className="w-5 h-5" />} 
            label="Home" 
            active={currentPath === "/doctor-dashboard"} 
          />
          <NavItem 
            href="/doctor-dashboard/appointments" 
            icon={<CalendarDaysIcon className="w-5 h-5" />} 
            label="Appointments" 
            active={currentPath === "/doctor-dashboard/appointments"} 
          />
          <NavItem 
            href="/doctor-dashboard/notifications" 
            icon={<BellIcon className="w-5 h-5" />} 
            label="Notifications" 
            active={currentPath === "/doctor-dashboard/notifications"} 
            badgeCount={2} 
          />
          <NavItem 
            href="/doctor-dashboard/profile" 
            icon={<UserIcon className="w-5 h-5" />} 
            label="Profile" 
            active={currentPath === "/doctor-dashboard/profile"} 
          />
        </div>
      </footer>

      {/* Bottom padding to account for fixed footer */}
      <div className="h-20"></div>
    </main>
  );
}

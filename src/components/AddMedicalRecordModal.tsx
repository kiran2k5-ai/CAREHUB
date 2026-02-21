'use client';

import React, { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';

interface AddMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  doctorId: string;
  onRecordAdded: () => void;
}

export default function AddMedicalRecordModal({
  isOpen,
  onClose,
  patientId,
  doctorId,
  onRecordAdded
}: AddMedicalRecordModalProps) {
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
    prescriptions: [{ 
      medication_name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '' 
    }],
    lab_reports: [{ 
      test_name: '', 
      results: '', 
      normal_range: '', 
      notes: '',
      test_date: new Date().toISOString().split('T')[0]
    }]
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) => 
        i === index ? { ...prescription, [field]: value } : prescription
      )
    }));
  };

  const handleLabReportChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      lab_reports: prev.lab_reports.map((report, i) => 
        i === index ? { ...report, [field]: value } : report
      )
    }));
  };

  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { 
        medication_name: '', 
        dosage: '', 
        frequency: '', 
        duration: '', 
        instructions: '' 
      }]
    }));
  };

  const removePrescription = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const addLabReport = () => {
    setFormData(prev => ({
      ...prev,
      lab_reports: [...prev.lab_reports, { 
        test_name: '', 
        results: '', 
        normal_range: '', 
        notes: '',
        test_date: new Date().toISOString().split('T')[0]
      }]
    }));
  };

  const removeLabReport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lab_reports: prev.lab_reports.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.diagnosis.trim()) {
      alert('Please enter a diagnosis');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty prescriptions and lab reports
      const validPrescriptions = formData.prescriptions.filter(p => p.medication_name.trim());
      const validLabReports = formData.lab_reports.filter(r => r.test_name.trim());

      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          doctor_id: doctorId,
          visit_date: formData.visit_date,
          diagnosis: formData.diagnosis,
          notes: formData.notes || null,
          prescriptions: validPrescriptions.length > 0 ? validPrescriptions : [],
          lab_reports: validLabReports.length > 0 ? validLabReports : []
        }),
      });

      const data = await response.json();
      if (data.success) {
        onRecordAdded();
        onClose();
        // Reset form
        setFormData({
          visit_date: new Date().toISOString().split('T')[0],
          diagnosis: '',
          notes: '',
          prescriptions: [{ 
            medication_name: '', 
            dosage: '', 
            frequency: '', 
            duration: '', 
            instructions: '' 
          }],
          lab_reports: [{ 
            test_name: '', 
            results: '', 
            normal_range: '', 
            notes: '',
            test_date: new Date().toISOString().split('T')[0]
          }]
        });
      } else {
        alert('Failed to add medical record: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding medical record:', error);
      alert('Failed to add medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-black">Add Medical Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-black mb-1.5 sm:mb-2">
                Visit Date
              </label>
              <input
                type="date"
                value={formData.visit_date}
                onChange={(e) => handleInputChange('visit_date', e.target.value)}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-black mb-1.5 sm:mb-2">
              Diagnosis *
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              placeholder="Enter diagnosis..."
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-black mb-1.5 sm:mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
              rows={3}
            />
          </div>

          {/* Prescriptions Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-black">Prescriptions</h3>
              <button
                type="button"
                onClick={addPrescription}
                className="bg-green-600 text-white px-3 py-1.5 sm:py-1 text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Prescription
              </button>
            </div>

            {formData.prescriptions.map((prescription, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="font-medium text-sm sm:text-base text-black">Prescription {index + 1}</h4>
                  {formData.prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrescription(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Medication Name
                    </label>
                    <input
                      type="text"
                      value={prescription.medication_name}
                      onChange={(e) => handlePrescriptionChange(index, 'medication_name', e.target.value)}
                      placeholder="Enter medication name"
                      className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={prescription.dosage}
                      onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                      className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={prescription.frequency}
                      onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                      placeholder="e.g., Twice daily"
                      className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={prescription.duration}
                      onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                      className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="mt-3 sm:mt-4">
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={prescription.instructions}
                    onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                    placeholder="Special instructions..."
                    className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Lab Reports Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-black">Lab Reports</h3>
              <button
                type="button"
                onClick={addLabReport}
                className="bg-blue-600 text-white px-3 py-1.5 sm:py-1 text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Lab Report
              </button>
            </div>

            {formData.lab_reports.map((report, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 bg-blue-50">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="font-medium text-sm sm:text-base text-black">Lab Report {index + 1}</h4>
                  {formData.lab_reports.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLabReport(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Test Name
                    </label>
                    <input
                      type="text"
                      value={report.test_name}
                      onChange={(e) => handleLabReportChange(index, 'test_name', e.target.value)}
                      placeholder="Enter test name"
                      className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Test Date
                    </label>
                    <input
                      type="date"
                      value={report.test_date}
                      onChange={(e) => handleLabReportChange(index, 'test_date', e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Results
                    </label>
                    <input
                      type="text"
                      value={report.results}
                      onChange={(e) => handleLabReportChange(index, 'results', e.target.value)}
                      placeholder="Enter results"
                      className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Normal Range
                    </label>
                    <input
                      type="text"
                      value={report.normal_range}
                      onChange={(e) => handleLabReportChange(index, 'normal_range', e.target.value)}
                      placeholder="e.g., 10-50 mg/dL"
                      className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="mt-3 sm:mt-4">
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                    Notes
                  </label>
                  <textarea
                    value={report.notes}
                    onChange={(e) => handleLabReportChange(index, 'notes', e.target.value)}
                    placeholder="Additional notes..."
                    className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black placeholder-gray-500"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-4 pt-3 sm:pt-4 border-t sticky bottom-0 bg-white pb-2 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-2 text-sm sm:text-base bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
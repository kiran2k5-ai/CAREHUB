'use client';

import React, { useState } from 'react';
import { 
  ChevronRightIcon, 
  ChevronLeftIcon,
  UserIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface StepByStepGuideProps {
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onShowButtons?: () => void;
}

const steps = [
  {
    id: 1,
    title: "Select a Patient",
    description: "Choose a patient from your patient list",
    icon: UserIcon,
    color: "blue",
    actions: [
      "Use the search bar to find a patient",
      "Click on a patient card to select them", 
      "Selected patient will be highlighted in cyan"
    ],
    screenshot: "👥 Patient List → Click Patient Card"
  },
  {
    id: 2,
    title: "Find the Add Button",
    description: "Multiple ways to add a medical record",
    icon: PlusIcon,
    color: "green",
    actions: [
      "📍 Floating button (bottom-right corner)",
      "🔝 Header button (top-right when patient selected)",
      "📋 Patient card button (appears after selection)",
      "📄 Empty state button (when no records exist)"
    ],
    screenshot: "➕ Click any Plus (+) button"
  },
  {
    id: 3,
    title: "Fill Medical Record Form",
    description: "Complete the comprehensive medical record",
    icon: DocumentTextIcon,
    color: "purple",
    actions: [
      "📅 Select visit date",
      "🩺 Enter diagnosis (required)",
      "📝 Add clinical notes",
      "💊 Add prescriptions (medication, dosage, frequency)",
      "🧪 Add lab reports (test name, results, normal range)"
    ],
    screenshot: "📋 Fill Form → Add Prescriptions & Lab Reports"
  },
  {
    id: 4,
    title: "Save to Database",
    description: "Submit and store the record",
    icon: CheckCircleIcon,
    color: "cyan",
    actions: [
      "✅ Review all information",
      "💾 Click 'Add Record' button",
      "🗄️ Data saves automatically to database",
      "👁️ Record appears immediately in patient history"
    ],
    screenshot: "💾 Submit → ✅ Saved to Database"
  }
];

export default function StepByStepGuide({ currentStep = 1, onStepChange, onShowButtons }: StepByStepGuideProps) {
  const [activeStep, setActiveStep] = useState(currentStep);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    onStepChange?.(step);
  };

  const currentStepData = steps.find(step => step.id === activeStep) || steps[0];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      cyan: 'bg-cyan-50 border-cyan-200 text-cyan-800'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      cyan: 'text-cyan-600 bg-cyan-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
          📋 How to Add Medical Records - Step by Step
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2">
          Follow these simple steps to add patient medical records to the database
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 px-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => handleStepChange(step.id)}
                className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full font-semibold transition-all text-sm sm:text-base flex-shrink-0 ${
                  activeStep === step.id
                    ? 'bg-cyan-600 text-white shadow-lg scale-110'
                    : activeStep > step.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {activeStep > step.id ? '✓' : step.id}
              </button>
              {index < steps.length - 1 && (
                <div className={`w-6 sm:w-8 h-0.5 sm:h-1 rounded flex-shrink-0 ${
                  activeStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className={`border rounded-lg p-3 sm:p-4 md:p-6 ${getColorClasses(currentStepData.color)}`}>
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className={`p-2 sm:p-3 rounded-full ${getIconColorClasses(currentStepData.color)} flex-shrink-0`}>
            <currentStepData.icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium opacity-75">Step {currentStepData.id} of {steps.length}</span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2">{currentStepData.title}</h3>
            <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4">{currentStepData.description}</p>
            
            {/* Screenshot/Visual */}
            <div className="bg-white/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 border border-white/50">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 break-words">{currentStepData.screenshot}</div>
              </div>
            </div>

            {/* Action Items */}
            <div className="space-y-1.5 sm:space-y-2">
              <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">What to do:</h4>
              {currentStepData.actions.map((action, index) => (
                <div key={index} className="flex items-start gap-2">
                  <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 sm:mt-1 opacity-60 flex-shrink-0" />
                  <span className="text-xs sm:text-sm leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6">
        <button
          onClick={() => handleStepChange(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border sm:border-0 rounded-lg sm:rounded-none"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </button>

        <div className="text-xs sm:text-sm text-gray-500 order-first sm:order-none">
          Step {activeStep} of {steps.length}
        </div>

        <button
          onClick={() => handleStepChange(Math.min(steps.length, activeStep + 1))}
          disabled={activeStep === steps.length}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border sm:border-0 rounded-lg sm:rounded-none"
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex-1 w-full">
            <h4 className="font-semibold text-amber-800 mb-2 text-sm sm:text-base">💡 Quick Tips:</h4>
            <ul className="text-xs sm:text-sm text-amber-700 space-y-1">
              <li>• You can add multiple prescriptions and lab reports in one record</li>
              <li>• All data is automatically saved to your Supabase database</li>
              <li>• Patients can view their records in their medical history</li>
              <li>• Use the floating ➕ button for quick access from anywhere</li>
            </ul>
          </div>
          {onShowButtons && (
            <button
              onClick={onShowButtons}
              className="w-full sm:w-auto bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-xs sm:text-sm flex-shrink-0"
            >
              👀 Show Me Where
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
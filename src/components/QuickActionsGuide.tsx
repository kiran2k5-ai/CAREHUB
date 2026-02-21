'use client';

import React from 'react';
import { Plus, FileText, Stethoscope, ClipboardList, User } from 'lucide-react';

interface QuickActionsGuideProps {
  hasSelectedPatient: boolean;
  onAddRecord: () => void;
}

export default function QuickActionsGuide({ hasSelectedPatient, onAddRecord }: QuickActionsGuideProps) {
  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-cyan-800 mb-3 sm:mb-4 flex items-center gap-2">
        <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
        Quick Actions for Medical Records
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Step 1 */}
        <div className="flex items-start gap-2 sm:gap-3 bg-white/50 p-3 rounded-lg">
          <div className="bg-cyan-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-cyan-800 text-sm sm:text-base">1. Select Patient</h4>
            <p className="text-xs sm:text-sm text-cyan-700">Choose a patient from your patient list</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-2 sm:gap-3 bg-white/50 p-3 rounded-lg">
          <div className="bg-cyan-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-cyan-800 text-sm sm:text-base">2. Add Record</h4>
            <p className="text-xs sm:text-sm text-cyan-700">Click any "+" button to add medical record</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-2 sm:gap-3 bg-white/50 p-3 rounded-lg sm:col-span-2 lg:col-span-1">
          <div className="bg-cyan-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-cyan-800 text-sm sm:text-base">3. Save to DB</h4>
            <p className="text-xs sm:text-sm text-cyan-700">Records are stored automatically in database</p>
          </div>
        </div>
      </div>

      {hasSelectedPatient && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-cyan-200">
          <button
            onClick={onAddRecord}
            className="w-full sm:w-auto bg-cyan-600 text-white px-6 py-2 sm:py-2.5 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            Add Medical Record Now
          </button>
        </div>
      )}
    </div>
  );
}
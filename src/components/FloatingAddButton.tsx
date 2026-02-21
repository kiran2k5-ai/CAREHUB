'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export default function FloatingAddButton({ 
  onClick, 
  disabled = false, 
  label = "Add Medical Record" 
}: FloatingAddButtonProps) {
  if (disabled) return null;

  return (
    <>
      {/* Desktop floating button */}
      <div className="hidden md:block">
        <button
          onClick={onClick}
          className="fixed bottom-8 right-8 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 hover:scale-110 z-50"
          title={label}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile floating button */}
      <div className="md:hidden">
        <button
          onClick={onClick}
          className="fixed bottom-20 right-4 bg-cyan-600 text-white p-3 rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 z-50 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium pr-2">Add</span>
        </button>
      </div>
    </>
  );
}
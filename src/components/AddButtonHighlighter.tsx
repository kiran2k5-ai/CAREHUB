'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, X } from 'lucide-react';

interface AddButtonHighlighterProps {
  isActive: boolean;
  onClose: () => void;
}

export default function AddButtonHighlighter({ isActive, onClose }: AddButtonHighlighterProps) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setStep(prev => prev >= 4 ? 1 : prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const highlights = [
    {
      step: 1,
      title: "Floating Button",
      description: "Bottom-right corner - always visible",
      position: "bottom-8 right-8",
      color: "ring-cyan-500"
    },
    {
      step: 2,
      title: "Header Button", 
      description: "Top-right when patient selected",
      position: "top-20 right-8",
      color: "ring-green-500"
    },
    {
      step: 3,
      title: "Patient Card Button",
      description: "Appears on selected patient card",
      position: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      color: "ring-purple-500"
    },
    {
      step: 4,
      title: "Empty State Button",
      description: "When no medical records exist",
      position: "top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      color: "ring-orange-500"
    }
  ];

  const currentHighlight = highlights.find(h => h.step === step) || highlights[0];

  return (
    <div className="fixed inset-0 bg-black/20 z-50 pointer-events-none">
      {/* Overlay with instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 max-w-md pointer-events-auto">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-800">Add Button Locations</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          <div className="font-medium text-gray-800">{currentHighlight.title}</div>
          <div>{currentHighlight.description}</div>
        </div>

        <div className="flex gap-1 justify-center">
          {highlights.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === index + 1 ? 'bg-cyan-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Highlight Ring */}
      <div 
        className={`absolute w-16 h-16 rounded-full ${currentHighlight.color} ring-4 animate-pulse ${currentHighlight.position}`}
        style={{
          animation: 'pulse 2s ease-in-out infinite'
        }}
      />

      {/* Arrow pointing to highlighted area */}
      <div 
        className={`absolute ${currentHighlight.position}`}
        style={{
          transform: `${currentHighlight.position.includes('transform') ? '' : 'translate(-50%, -50%)'}`
        }}
      >
        <div className="relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            ➕ Click here to add
          </div>
        </div>
      </div>
    </div>
  );
}
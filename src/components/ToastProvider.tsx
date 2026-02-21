'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircleIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastContext = createContext<{
  showToast: (notification: Omit<ToastNotification, 'id'>) => void;
} | null>(null);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, newToast.duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onRemove }: { toast: ToastNotification; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(onRemove, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-600" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${getTextColor()}`}>
              {toast.title}
            </h3>
            <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleRemove}
              className={`inline-flex ${getTextColor()} hover:opacity-75 transition-opacity`}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
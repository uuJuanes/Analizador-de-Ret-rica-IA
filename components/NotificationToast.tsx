import React, { useEffect, useState } from 'react';
import { Notification } from '../types';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);


const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Trigger fade-in
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow fade-out animation to complete
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isWarning = notification.type === 'warning';
  const Icon = isWarning ? WarningIcon : InfoIcon;
  const colors = {
    bg: isWarning ? 'bg-amber-50 dark:bg-amber-900/40' : 'bg-blue-50 dark:bg-blue-900/40',
    border: isWarning ? 'border-amber-400 dark:border-amber-600' : 'border-blue-400 dark:border-blue-600',
    icon: isWarning ? 'text-amber-500' : 'text-blue-500',
  };

  return (
    <div 
      className={`fixed top-24 right-5 w-full max-w-sm ${colors.bg} shadow-lg rounded-lg border-l-4 ${colors.border} p-4 transition-all duration-300 ease-in-out transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">
          <p>{notification.message}</p>
        </div>
        <button onClick={onClose} className="p-1 -m-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
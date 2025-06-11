import React from 'react';

interface AlertProps {
  message: string | null;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  if (!message) return null;

  let bgColor = '';
  let textColor = '';
  let borderColor = '';
  let iconPath = '';
  let ringColor = '';

  switch (type) {
    case 'success':
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-400';
      ringColor = 'focus:ring-green-600 focus:ring-offset-green-50';
      iconPath = "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z";
      break;
    case 'error':
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
      borderColor = 'border-red-400';
      ringColor = 'focus:ring-red-600 focus:ring-offset-red-50';
      iconPath = "M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0 4a1 1 0 100 2 1 1 0 000-2z";
      break;
    case 'warning':
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-400';
      ringColor = 'focus:ring-yellow-600 focus:ring-offset-yellow-50';
      iconPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z";
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-400';
      ringColor = 'focus:ring-blue-600 focus:ring-offset-blue-50';
      iconPath = "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
      break;
  }

  return (
    <div className={`${bgColor} ${borderColor} ${textColor} border-l-4 p-4 rounded-md shadow-md`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d={iconPath} clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`${bgColor} inline-flex rounded-md p-1.5 ${textColor} hover:bg-opacity-75 focus:outline-none focus:ring-2 ${ringColor}`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
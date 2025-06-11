import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  children,
  variant = 'primary',
  className = '',
}) => {
  const baseStyle = "px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out transform hover:scale-105";
  const disabledStyle = "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none";

  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = "text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 focus:ring-blue-500";
      break;
    case 'secondary':
      variantStyle = "text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500";
      break;
    case 'danger':
      variantStyle = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500";
      break;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className} flex items-center justify-center`}
    >
      {children}
    </button>
  );
};
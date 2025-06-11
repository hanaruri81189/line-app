import React from 'react';

interface NumberInputProps {
  id: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  id,
  value,
  onChange,
  min,
  max,
  disabled = false,
}) => {
  return (
    <input
      type="number"
      id={id}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      disabled={disabled}
      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none sm:text-sm transition-colors duration-150"
    />
  );
};
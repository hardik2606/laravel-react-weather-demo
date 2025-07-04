import React from 'react';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

interface Field {
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  autoComplete?: string;
  error?: string;
}

interface AuthFormProps {
  fields: Field[];
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
  loading?: boolean;
  errors?: Record<string, string>;
  children?: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({ fields, onSubmit, buttonText, loading, errors, children }) => {
  return (
    <form className="w-full space-y-5" onSubmit={onSubmit} aria-label="Authentication form">
      {Object.values(errors || {}).length > 0 && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md text-center">
          {Object.values(errors || {}).map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}
      {fields.map((field) => (
        <div className="relative" key={field.name}>
          {field.icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
              {field.icon}
            </span>
          )}
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required
            aria-label={field.label}
            className={`pl-12 pr-4 py-3 w-full rounded-lg border ${field.error ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white text-gray-900 placeholder-gray-400 text-base transition shadow-sm`}
            placeholder={field.label}
            value={field.value}
            onChange={field.onChange}
            aria-invalid={!!field.error}
            aria-describedby={field.error ? `${field.name}-error` : undefined}
          />
          {field.error && (
            <span id={`${field.name}-error`} className="text-xs text-red-500 mt-1 block ml-1">{field.error}</span>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold text-lg shadow-md hover:from-indigo-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? 'Please wait...' : buttonText}
      </button>
      {children}
    </form>
  );
};

export default AuthForm; 
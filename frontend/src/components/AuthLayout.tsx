import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  brandName?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, imageUrl, imageAlt, brandName }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Image/Brand Section */}
      <div className="md:w-1/2 flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 relative">
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8">
          {imageUrl ? (
            <img src={imageUrl} alt={imageAlt || 'Brand'} className="w-48 h-48 object-contain rounded-2xl shadow-2xl mb-6" />
          ) : null}
          {brandName ? (
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg text-center">{brandName}</h1>
          ) : null}
        </div>
      </div>
      {/* Form Section */}
      <div className="md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 md:p-12 lg:p-16">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 
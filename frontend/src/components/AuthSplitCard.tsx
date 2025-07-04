import React from 'react';

interface AuthSplitCardProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

const AuthSplitCard: React.FC<AuthSplitCardProps> = ({ left, right }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
      <div className="relative w-full max-w-4xl flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/30">
        {/* Left Panel */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10 bg-gradient-to-br from-indigo-500 to-pink-500 text-white relative z-10">
          {left}
        </div>
        {/* Right Panel (Form) */}
        <div className="md:w-1/2 flex items-center justify-center p-10 bg-white/80 relative z-10">
          {right}
        </div>
        {/* Glass shine effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-2/3 h-2/3 bg-white opacity-20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default AuthSplitCard; 
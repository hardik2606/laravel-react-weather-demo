import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiLogOut } from 'react-icons/fi';

interface SidebarProps {
  userName?: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onLogout }) => {
  const location = useLocation();
  return (
    <nav className="h-full w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4 shadow-lg" aria-label="Sidebar">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-2">
          {userName ? userName[0]?.toUpperCase() : <FiUser size={32} />}
        </div>
        <span className="text-lg font-semibold text-gray-800">{userName || 'User'}</span>
      </div>
      <ul className="flex-1 space-y-2">
        <li>
          <Link to="/dashboard" className={`flex items-center px-4 py-3 rounded-lg transition font-medium ${location.pathname === '/dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            aria-current={location.pathname === '/dashboard' ? 'page' : undefined}>
            <FiHome className="mr-3" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/profile" className={`flex items-center px-4 py-3 rounded-lg transition font-medium ${location.pathname === '/profile' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            aria-current={location.pathname === '/profile' ? 'page' : undefined}>
            <FiUser className="mr-3" /> Profile
          </Link>
        </li>
      </ul>
      <button
        onClick={onLogout}
        className="flex items-center px-4 py-3 rounded-lg text-red-600 font-medium hover:bg-red-50 transition mt-8"
        aria-label="Logout"
      >
        <FiLogOut className="mr-3" /> Logout
      </button>
    </nav>
  );
};

export default Sidebar; 
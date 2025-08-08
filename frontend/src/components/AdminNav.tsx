import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings } from 'lucide-react';

const AdminNav: React.FC = () => {
  const { user } = useAuth();

  // Only show admin nav if user is admin
  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="bg-blue-600 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/admin"
            className="flex items-center space-x-1 text-sm hover:text-blue-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminNav; 

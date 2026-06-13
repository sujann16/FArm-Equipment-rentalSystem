import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FarmerDashboard from './FarmerDashboard';
import OwnerDashboard from './OwnerDashboard';
import AdminDashboard from './AdminDashboard';
import { Sparkles, Tractor, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-850 rounded-2xl w-1/4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-850 rounded-3xl w-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-24 text-gray-500 font-semibold">
        Please log in to view your dashboard portal.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-darkbg-200 text-gray-900 dark:text-white pb-16 transition-colors duration-300">
      
      {/* Dashboard Brand Header */}
      <div className="bg-white dark:bg-darkbg-100 border-b border-gray-100 dark:border-gray-800 py-8 mb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Manage Profile & Bookings
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Welcome, {user.firstName}!
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">Registered Role</span>
              <span className="text-[10px] font-bold text-brand-500 mt-1 uppercase tracking-wider">{t(`role${user.role}`)}</span>
            </div>
            
            <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 text-brand-500 rounded-2xl border border-brand-100/50 dark:border-brand-900">
              {user.role === 'Farmer' ? <Tractor size={20} /> : <UserCheck size={20} />}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {user.role === 'Farmer' && <FarmerDashboard />}
        {user.role === 'Owner' && <OwnerDashboard />}
        {user.role === 'Admin' && <AdminDashboard />}
      </div>

    </div>
  );
};

export default Dashboard;

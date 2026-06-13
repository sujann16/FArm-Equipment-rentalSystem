import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { BarChart3, Users, Landmark, AlertTriangle, ShieldAlert, Check, Map, LandmarkIcon, Compass } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useLanguage();

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      // 1. Fetch analytics
      const aRes = await api.get('/ai/admin/analytics');
      if (aRes.data?.success) {
        setAnalytics(aRes.data.analytics);
      }

      // 2. Fetch heatmap
      const hRes = await api.get('/ai/heatmap');
      if (hRes.data?.success) {
        setHeatmap(hRes.data.heatmap);
      }

      // 3. Fetch disputes/reports (mock log list for support ticket resolution)
      setDisputes([
        { _id: '1', type: 'Report', reason: 'Fake owner profile listing', description: 'Listing John Deere tractor seems to be listed by a duplicate broker profile.', status: 'Open', reporter: { firstName: 'Ramesh', email: 'farmer@agrishare.com' } },
        { _id: '2', type: 'Dispute', reason: 'Scheduling calendar errors', description: 'Tractor was returned on Sunday but calendar still shows locked.', status: 'Open', reporter: { firstName: 'Suresh', email: 'owner@agrishare.com' } }
      ]);

    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveDispute = (disputeId) => {
    if (window.confirm('Mark this support ticket as resolved?')) {
      setDisputes(disputes.map(d => d._id === disputeId ? { ...d, status: 'Resolved' } : d));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-850 rounded-2xl"></div>)}
        </div>
        <div className="h-96 bg-gray-100 dark:bg-gray-850 rounded-3xl w-full"></div>
      </div>
    );
  }

  const totalRevenue = analytics?.totalRevenue || 0;
  const totalRentals = analytics?.totalRentals || 0;
  const completedRentals = analytics?.completedRentals || 0;

  return (
    <div className="space-y-8">
      {/* Top dashboard KPI summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-darkbg-100 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <p className="text-xl font-extrabold text-brand-600 mt-1">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 text-brand-500 rounded-2xl">
            <LandmarkIcon size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkbg-100 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Rentals</span>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{totalRentals}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl">
            <BarChart3 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkbg-100 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Rentals</span>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{completedRentals}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-2xl">
            <Check size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkbg-100 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Support Tickets</span>
            <p className="text-xl font-extrabold text-red-500 mt-1">{disputes.filter(d => d.status === 'Open').length}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Analytics progress charts & Heatmaps split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Analytics bar charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Category distribution charts */}
          <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-400 border-b border-gray-50 dark:border-gray-850 pb-2">Rentals by Equipment Category</h3>
            
            <div className="space-y-4">
              {analytics?.rentalsByCategory?.map((item, idx) => {
                // Find percentage share
                const maxCount = Math.max(...analytics.rentalsByCategory.map(c => c.count), 1);
                const percent = (item.count / maxCount) * 100;
                
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-200">
                      <span>{item.category}</span>
                      <span>{item.count} bookings &bull; Rs. {item.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-50 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${idx === 0 ? 'bg-brand-500' : idx === 1 ? 'bg-blue-500' : 'bg-teal-500'}`}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {(!analytics?.rentalsByCategory || analytics.rentalsByCategory.length === 0) && (
                <p className="text-xs font-semibold text-gray-400 text-center py-4">No categories rental stats recorded.</p>
              )}
            </div>
          </div>

          {/* Regional Demand heatmap hotspots summary list */}
          <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 dark:border-gray-850 pb-3">
              <Map className="text-brand-500" size={18} />
              <h3 className="text-xs font-extrabold uppercase text-gray-900 dark:text-white leading-none">
                {t('demandHeatmap')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {heatmap.map((item) => (
                <div key={item.pincode} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-brand-500 leading-none block mb-2">Pincode {item.pincode}</span>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">{item.bookingCount} Rentals</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-1">Volume Revenue: Rs. {item.totalRevenue.toLocaleString()}</p>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 rounded-full border border-brand-100 dark:border-brand-900 truncate">
                      Top category: {item.topEquipmentCategory}
                    </span>
                  </div>
                </div>
              ))}

              {heatmap.length === 0 && (
                <p className="text-xs font-semibold text-gray-400 text-center py-4">No demand heatmap points generated yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* Support Tickets resolution queue (right side) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-400 border-b border-gray-50 dark:border-gray-850 pb-2">Support Tickets</h3>

            <div className="space-y-4">
              {disputes.map((ticket) => {
                const isOpen = ticket.status === 'Open';
                return (
                  <div key={ticket._id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-lg border ${
                        ticket.type === 'Dispute' ? 'border-orange-200 text-orange-500 bg-orange-50' : 'border-red-200 text-red-500 bg-red-50'
                      }`}>
                        {ticket.type}: {ticket.reason}
                      </span>
                      <span className={`text-[9px] font-bold uppercase ${isOpen ? 'text-orange-500' : 'text-gray-400'}`}>
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-850 text-[10px] font-semibold text-gray-400">
                      <span>By: {ticket.reporter.firstName} ({ticket.reporter.email})</span>
                      {isOpen && (
                        <button
                          onClick={() => handleResolveDispute(ticket._id)}
                          className="px-2 py-1 bg-brand-500 text-white rounded-lg font-bold shadow-sm"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

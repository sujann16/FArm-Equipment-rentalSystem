import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Clock, CheckCircle2, XCircle, BrainCircuit, Sprout, ShieldAlert, Sparkles, Navigation, CloudRain } from 'lucide-react';

const FarmerDashboard = () => {
  const { t } = useLanguage();

  // Bookings list
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Recommendations form state
  const [cropType, setCropType] = useState('Paddy');
  const [landArea, setLandArea] = useState('4');
  const [farmingActivity, setFarmingActivity] = useState('Land Preparation');
  const [recs, setRecs] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState('');

  // Local notifications list
  const [notifications, setNotifications] = useState([]);

  const fetchBookingsAndNotifications = async () => {
    try {
      const bRes = await api.get('/bookings/history');
      if (bRes.data?.success) {
        setBookings(bRes.data.bookings);
      }
      
      // Pull alerts/notifications list (optional fallback logs)
      // We will mock notification lists
      setNotifications([
        { id: '1', message: 'Your booking request for John Deere 5050D has been submitted.', type: 'system', date: new Date().toLocaleDateString() },
        { id: '2', message: 'Heavy rain warning: check weather alerts before soil ploughing.', type: 'reminder', date: new Date().toLocaleDateString() }
      ]);
    } catch (err) {
      console.error('Error fetching dashboard bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndNotifications();
  }, []);

  const handleGetRec = async (e) => {
    e.preventDefault();
    setRecsError('');
    setRecs(null);
    setLoadingRecs(true);

    try {
      const res = await api.post('/ai/recommend', {
        cropType,
        landArea,
        farmingActivity
      });

      if (res.data?.success) {
        setRecs(res.data);
      }
    } catch (err) {
      setRecsError('Failed to generate AI recommendations.');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await api.post(`/bookings/${bookingId}/cancel`);
        if (res.data?.success) {
          fetchBookingsAndNotifications();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-50 dark:bg-green-950/20 text-green-600 border-green-200';
      case 'Cancelled':
        return 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200';
      case 'Completed':
        return 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 border-yellow-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Upper grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Active bookings logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-base font-extrabold uppercase text-gray-900 dark:text-white mb-6">
              {t('bookingHistory')}
            </h3>

            {loadingBookings ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 dark:bg-gray-850 rounded-2xl"></div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-xs font-bold text-gray-400">
                You have not booked any agricultural equipment yet.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isPendingOrConfirmed = ['Pending', 'Confirmed'].includes(booking.status);
                  return (
                    <div
                      key={booking._id}
                      className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/10 flex flex-col sm:flex-row justify-between gap-4"
                    >
                      <div className="flex gap-4">
                        <img
                          src={booking.equipment.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=200'}
                          alt={booking.equipment.name}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                        />
                        <div>
                          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{booking.equipment.name}</h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Dates: {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs font-extrabold text-brand-600 mt-1.5">Total: Rs. {booking.totalCost.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>

                        {isPendingOrConfirmed && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            className="text-xs font-bold text-red-500 hover:text-red-650 cursor-pointer"
                          >
                            Cancel Rental
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side: AI Recommender widget card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-50 dark:border-gray-850 pb-3">
              <BrainCircuit className="text-brand-500 animate-pulse" size={24} />
              <div>
                <h3 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white leading-none">
                  {t('recommendationTitle')}
                </h3>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">Google Gemini Powered</span>
              </div>
            </div>

            <form onSubmit={handleGetRec} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('cropLabel')}</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white"
                >
                  <option value="Paddy">Paddy / Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Maize">Maize</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('areaLabel')}</label>
                <input
                  type="number"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('activityLabel')}</label>
                <select
                  value={farmingActivity}
                  onChange={(e) => setFarmingActivity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white"
                >
                  <option value="Land Preparation">Land Preparation / Tillage</option>
                  <option value="Sowing">Sowing / Planting</option>
                  <option value="Crop Protection">Crop Protection / Spraying</option>
                  <option value="Harvesting">Harvesting</option>
                </select>
              </div>

              {recsError && <p className="text-xs text-red-500 font-semibold">{recsError}</p>}

              <button
                type="submit"
                disabled={loadingRecs}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BrainCircuit size={14} />
                {loadingRecs ? 'Generating suggestions...' : t('getRecBtn')}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* AI Suggestions Results Overlay/View */}
      {recs && (
        <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-brand-200 dark:border-brand-900 shadow-xl shadow-brand-500/5 space-y-5 animate-slide-up">
          <div className="flex items-center gap-2 border-b border-brand-50 dark:border-brand-950 pb-3">
            <Sparkles className="text-brand-500" size={20} />
            <h4 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white">AI Recommendations Output</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recs.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20">
                <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 text-[10px] font-extrabold uppercase rounded-lg">
                  {rec.equipmentType}
                </span>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-3">Estimated Timeline: <span className="font-extrabold text-gray-700 dark:text-gray-300">{rec.durationDays} Days</span></p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Est. Daily Rate: <span className="font-extrabold text-brand-600">Rs. {rec.dailyEstimate.toLocaleString()}</span></p>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-350 mt-3 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {rec.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-brand-50/20 dark:bg-brand-950/10 p-5 rounded-2xl border border-brand-100/30 dark:border-brand-950 space-y-2">
            <h5 className="text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase">Estimated Budget</h5>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white">{recs.totalEstimatedCostRange}</p>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-350 leading-relaxed pt-2 border-t border-brand-100/30 dark:border-brand-950">
              {recs.generalAdvice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;

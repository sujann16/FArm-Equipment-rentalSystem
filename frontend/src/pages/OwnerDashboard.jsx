import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { Tractor, Calendar, DollarSign, Plus, Check, X, ShieldAlert, Sparkles, Trash2, Gauge, AlertCircle } from 'lucide-react';

const OwnerDashboard = () => {
  const { t } = useLanguage();

  // Data states
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    equipCount: 0,
    bookingCount: 0,
    totalRevenue: 0
  });

  // Modal forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tractor');
  const [dailyPrice, setDailyPrice] = useState('');
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Specifications
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [horsepower, setHorsepower] = useState('');
  const [condition, setCondition] = useState('Excellent');

  const [formError, setFormError] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);

  const fetchOwnerData = async () => {
    try {
      // 1. Fetch bookings
      const bRes = await api.get('/bookings/history');
      let bookingsList = [];
      if (bRes.data?.success) {
        bookingsList = bRes.data.bookings;
        setBookings(bookingsList);
      }

      // 2. Fetch all equipments and filter where owner is self (handled in frontend or backend)
      const eRes = await api.get('/equipment');
      if (eRes.data?.success) {
        // Since getEquipments is general, we will filter listings matching owner ID. We can extract owner ID from one of the bookings or auth profile.
        // Wait, to be robust, we filter matching the owner profile
        const profileRes = await api.get('/auth/profile');
        if (profileRes.data?.success) {
          const ownerId = profileRes.data.user._id || profileRes.data.user.id;
          const ownerListings = eRes.data.equipments.filter((eq) => eq.owner._id === ownerId || eq.owner === ownerId);
          setListings(ownerListings);

          // Calculate stats
          const activeBookings = bookingsList.filter((b) => b.status !== 'Cancelled');
          const revenue = activeBookings.reduce((sum, b) => sum + b.totalCost, 0);

          setStats({
            equipCount: ownerListings.length,
            bookingCount: bookingsList.length,
            totalRevenue: revenue
          });
        }
      }
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/status`, { status });
      if (res.data?.success) {
        fetchOwnerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const res = await api.delete(`/equipment/${listingId}`);
        if (res.data?.success) {
          fetchOwnerData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !dailyPrice || !hourlyPrice || !description || !address || !pincode || !manufacturer || !model || !horsepower) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmittingForm(true);
    try {
      const res = await api.post('/equipment', {
        name,
        category,
        hourlyPrice: Number(hourlyPrice),
        dailyPrice: Number(dailyPrice),
        description,
        address,
        pincode,
        specifications: {
          manufacturer,
          model,
          year: Number(year),
          horsepower: Number(horsepower),
          condition
        }
      });

      if (res.data?.success) {
        setShowAddModal(false);
        // Reset form
        setName('');
        setCategory('Tractor');
        setDailyPrice('');
        setHourlyPrice('');
        setDescription('');
        setAddress('');
        setPincode('');
        setManufacturer('');
        setModel('');
        setHorsepower('');
        setCondition('Excellent');
        fetchOwnerData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create equipment listing.');
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Earnings and machinery overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-darkbg-100 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Listings</span>
            <p className="text-2xl font-extrabold text-gray-950 dark:text-white mt-1">{stats.equipCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl">
            <Tractor size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkbg-100 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('totalRentals')}</span>
            <p className="text-2xl font-extrabold text-gray-950 dark:text-white mt-1">{stats.bookingCount}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkbg-100 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('totalRevenue')}</span>
            <p className="text-2xl font-extrabold text-brand-600 mt-1">Rs. {stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 text-brand-500 rounded-2xl">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Booking Requests List (left/middle) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-base font-extrabold uppercase text-gray-900 dark:text-white mb-6">
              Incoming Booking Requests
            </h3>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-24 bg-gray-100 dark:bg-gray-850 rounded-2xl"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-xs font-bold text-gray-400">
                No active bookings requests received.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isPending = booking.status === 'Pending';
                  const isConfirmed = booking.status === 'Confirmed';
                  
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
                            Renter: <span className="font-bold text-gray-600 dark:text-gray-300">{booking.renter.firstName} {booking.renter.lastName}</span> &bull; {booking.renter.phoneNumber}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Timeline: {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Request status actions */}
                      <div className="flex items-center gap-2 sm:self-center">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                              className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md cursor-pointer"
                              title="Accept request"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                              className="p-2 bg-red-500 hover:bg-red-650 text-white rounded-xl shadow-md cursor-pointer"
                              title="Reject request"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : isConfirmed ? (
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                            className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                          >
                            Mark Complete
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-lg border ${
                            booking.status === 'Completed' ? 'border-gray-200 text-gray-400 bg-gray-50' : 'border-red-200 text-red-500 bg-red-50'
                          }`}>
                            {booking.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Listings Portfolio list (right side) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-850 pb-3">
              <h3 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white">Your Machinery</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md flex items-center justify-center cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {listings.map((equip) => (
                <div key={equip._id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-950/20">
                  <div className="flex items-center gap-3">
                    <img src={equip.images?.[0]} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{equip.name}</h4>
                      <p className="text-[10px] text-brand-500 font-extrabold">Rs. {equip.dailyPrice.toLocaleString()}/day</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteListing(equip._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {listings.length === 0 && (
                <p className="text-xs font-semibold text-gray-400 text-center py-4">You have no machinery listings published yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add Listing slide-out modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-2xl animate-scale-up space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-gray-750">
              <h3 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white">Publish New Machine listing</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-bold">
                X
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {formError && (
                <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-950 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Deere 5050D"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-150 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-150 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-500 outline-none"
                  >
                    {['Tractor', 'Harvester', 'Seeder', 'Rotavator', 'Sprayer', 'Thresher', 'Cultivator', 'Plough'].map(c => (
                      <option key={c} value={c} className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-500">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Daily Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-150 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Hourly Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 800"
                    value={hourlyPrice}
                    onChange={(e) => setHourlyPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-150 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed specifications, attachments included, transport details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-150 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-500 outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 560001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-150 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Address / Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nazarbad, Mysore"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-150 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-500 outline-none"
                  />
                </div>
              </div>

              {/* Machinery specs */}
              <div className="bg-gray-50 dark:bg-gray-900/10 p-4 rounded-2xl border border-gray-100 dark:border-gray-750/50 space-y-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Machinery Technical Specifications</span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Manufacturer *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Deere"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5050D"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Year *</label>
                    <input
                      type="number"
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">HP *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50"
                      value={horsepower}
                      onChange={(e) => setHorsepower(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Condition *</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none"
                    >
                      {['New', 'Excellent', 'Good', 'Fair'].map(cond => (
                        <option key={cond} value={cond} className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">{cond}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex gap-3 pt-3 border-t border-gray-50 dark:border-gray-750">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-250 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-brand-500/10 cursor-pointer"
                >
                  {submittingForm ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;

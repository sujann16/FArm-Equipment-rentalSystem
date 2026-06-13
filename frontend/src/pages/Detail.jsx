import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { Star, MapPin, Gauge, ShieldAlert, Calendar, Flag, MessageSquare, AlertCircle, Sparkles, Send } from 'lucide-react';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Data states
  const [data, setData] = useState(null);
  const [reservedDates, setReservedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking picker states
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Dispute / Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Damaged equipment specifications');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Cost estimation details
  const [costEstimate, setCostEstimate] = useState(null);

  const fetchData = async () => {
    try {
      const detailRes = await api.get(`/equipment/${id}`);
      if (detailRes.data?.success) {
        setData(detailRes.data);
      }

      const datesRes = await api.get(`/bookings/${id}/invalid-dates`);
      if (datesRes.data?.success) {
        setReservedDates(datesRes.data.reservedDates);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Recalculate price estimate when dates change
  useEffect(() => {
    if (startDateStr && endDateStr && data?.equipment) {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      if (start <= end) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Call backend cost estimator
        api.post('/ai/estimate-cost', {
          equipmentType: data.equipment.category,
          durationDays: diffDays,
          pincode: data.equipment.location.pincode
        }).then((res) => {
          if (res.data?.success) {
            setCostEstimate(res.data.estimate);
          }
        }).catch(() => {
          // Fallback manual estimate
          const baseCost = diffDays * data.equipment.dailyPrice;
          setCostEstimate({
            baseCost,
            demandMultiplier: 1.0,
            locationSurcharge: 0,
            volumeDiscount: diffDays > 3 ? Math.round(baseCost * 0.05) : 0,
            estimatedTotal: diffDays > 3 ? Math.round(baseCost * 0.95) : baseCost
          });
        });
      }
    } else {
      setCostEstimate(null);
    }
  }, [startDateStr, endDateStr, data]);

  const handleBookNow = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!user) {
      navigate('/login', { state: { from: { pathname: `/equipment/${id}` } } });
      return;
    }

    if (user.role !== 'Farmer') {
      setBookingError('Only users registered with the Farmer role can rent equipment.');
      return;
    }

    if (!startDateStr || !endDateStr) {
      setBookingError('Please choose start and end dates.');
      return;
    }

    setSubmittingBooking(true);
    try {
      const res = await api.post('/bookings', {
        equipmentId: id,
        startDate: startDateStr,
        endDate: endDateStr
      });
      if (res.data?.success) {
        setBookingSuccess(true);
        // Refresh disabled dates
        const datesRes = await api.get(`/bookings/${id}/invalid-dates`);
        setReservedDates(datesRes.data.reservedDates);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post('/ai/reviews', {
        equipmentId: id,
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data?.success) {
        setReviewComment('');
        // Refresh details
        fetchData();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSuccess(false);

    try {
      const res = await api.post('/ai/disputes', {
        type: 'Report',
        equipmentId: id,
        reason: reportReason,
        description: reportDesc
      });

      if (res.data?.success) {
        setReportSuccess(true);
        setReportDesc('');
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl w-full"></div>
        </div>
      </div>
    );
  }

  if (!data?.equipment) {
    return (
      <div className="text-center py-24 text-gray-500">
        Listing not found.
      </div>
    );
  }

  const { equipment, reviews, similarEquipment } = data;
  const mainImage = equipment.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600';

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-darkbg-200 text-gray-900 dark:text-white pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Listing Photos Header */}
        <div className="relative h-96 rounded-3xl overflow-hidden shadow-md">
          <img
            src={mainImage}
            alt={equipment.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <span className="px-2.5 py-1 bg-brand-500 text-white rounded-full text-[10px] font-extrabold uppercase shadow-sm mb-2 inline-block">
              {equipment.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold">{equipment.name}</h1>
            <p className="flex items-center gap-1 text-xs font-semibold text-gray-200 mt-2">
              <MapPin size={12} />
              {equipment.location.address}, {equipment.location.pincode}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Info details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-sm font-extrabold uppercase text-gray-500 dark:text-gray-400 mb-3">Description</h3>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 leading-relaxed">
                {equipment.description}
              </p>
            </div>

            {/* Specifications matrix */}
            <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                {t('specifications')}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Manufacturer</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{equipment.specifications.manufacturer}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Model</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{equipment.specifications.model}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Horsepower</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1">
                    <Gauge size={14} className="text-brand-500" />
                    {equipment.specifications.horsepower} HP
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Condition</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{equipment.specifications.condition}</span>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={equipment.owner.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${equipment.owner.firstName}`}
                  alt="Owner"
                  className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-brand-100 dark:border-brand-950"
                />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Listed by</span>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    {equipment.owner.firstName} {equipment.owner.lastName}
                  </h4>
                  <p className="text-xs font-semibold text-brand-500">Pincode: {equipment.owner.pinCode}</p>
                </div>
              </div>
              <a
                href={`tel:${equipment.owner.phoneNumber}`}
                className="px-4 py-2 border border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-brand-500 text-xs font-extrabold rounded-xl transition-colors"
              >
                Call Owner
              </a>
            </div>

            {/* Reviews and rating logs */}
            <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                {t('ratings')}
              </h3>

              {/* Add a review */}
              {user && user.role === 'Farmer' && (
                <form onSubmit={handleReviewSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Write a Review</h4>
                  {reviewError && <p className="text-xs text-red-500 font-semibold">{reviewError}</p>}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <Star
                          key={stars}
                          size={18}
                          onClick={() => setReviewRating(stars)}
                          className={`cursor-pointer ${
                            stars <= reviewRating ? 'text-yellow-500 fill-current' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Share your experience renting this machine..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm text-gray-950 dark:text-white outline-none focus:border-brand-500"
                    />
                    <button type="submit" className="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-md">
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews Feed */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-gray-50 dark:border-gray-800 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={rev.reviewer.avatar} className="w-8 h-8 rounded-lg" alt="Reviewer" />
                        <div>
                          <p className="text-xs font-bold text-gray-950 dark:text-white">{rev.reviewer.firstName} {rev.reviewer.lastName}</p>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-50 dark:bg-brand-950/20 text-brand-500 text-xs font-bold rounded-lg border border-brand-100/50 dark:border-brand-900">
                        <Star size={10} fill="currentColor" />
                        {rev.rating}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-2 leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <p className="text-xs font-semibold text-gray-400 text-center py-4">No reviews yet for this equipment.</p>
                )}
              </div>

            </div>

          </div>

          {/* Right: Booking Checkout Panel */}
          <div className="space-y-4 sticky top-24">
            <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
              
              <div className="flex items-baseline justify-between border-b border-gray-50 dark:border-gray-800 pb-4">
                <span className="text-xs font-bold text-gray-400 uppercase">Daily Rate</span>
                <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  Rs. {equipment.dailyPrice.toLocaleString()}{' '}
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">/ day</span>
                </p>
              </div>

              {/* Date Input selectors */}
              <form onSubmit={handleBookNow} className="space-y-4">
                {bookingError && (
                  <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-950 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {bookingSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/10 border border-green-100 dark:border-green-950 rounded-xl text-green-600 dark:text-green-400 text-xs font-semibold">
                    Booking request submitted successfully! Redirecting...
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">From Date</label>
                    <input
                      type="date"
                      value={startDateStr}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">To Date</label>
                    <input
                      type="date"
                      value={endDateStr}
                      min={startDateStr || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDateStr(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>

                {/* Local MOCK reserved dates reference list */}
                {reservedDates.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Unavailable Dates:</span>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 line-clamp-2">
                      {reservedDates.map(d => new Date(d).toLocaleDateString()).join(', ')}
                    </p>
                  </div>
                )}

                {/* Stripe-like checkout cost breakdown */}
                {costEstimate && (
                  <div className="bg-brand-50/20 dark:bg-brand-950/10 border border-brand-100/30 dark:border-brand-950 rounded-2xl p-4 space-y-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-brand-600 dark:text-brand-400 tracking-wider flex items-center gap-1">
                      <Sparkles size={12} />
                      AI Price Breakdown
                    </span>
                    
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <span>Base rent ({costEstimate.durationDays || 'days'})</span>
                      <span>Rs. {costEstimate.baseCost.toLocaleString()}</span>
                    </div>

                    {costEstimate.locationSurcharge > 0 && (
                      <div className="flex justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
                        <span>High regional demand surcharge</span>
                        <span>+Rs. {costEstimate.locationSurcharge.toLocaleString()}</span>
                      </div>
                    )}

                    {costEstimate.volumeDiscount > 0 && (
                      <div className="flex justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                        <span>Volume discount applied</span>
                        <span>-Rs. {costEstimate.volumeDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-extrabold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-850">
                      <span>Total Estimated Cost</span>
                      <span>Rs. {costEstimate.estimatedTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingBooking || bookingSuccess}
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar size={16} />
                  {submittingBooking ? 'Submitting request...' : t('bookNow')}
                </button>

              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-xs font-semibold text-red-500 dark:hover:text-red-400 flex items-center gap-1.5 mx-auto border-none outline-none bg-transparent cursor-pointer"
                >
                  <Flag size={12} />
                  {t('disputeReport')}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Similar equipment feed */}
        {similarEquipment.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              {t('similarEquipment')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {similarEquipment.map((equip) => (
                <ProductCard key={equip._id} equipment={equip} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Ticket Report Modal Popup */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-2xl animate-scale-up space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-gray-700">
              <h3 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white flex items-center gap-1">
                <Flag size={16} className="text-red-500" />
                Submit support ticket / report
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-bold">
                X
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 rounded-2xl text-green-600 dark:text-green-400 text-xs font-semibold text-center">
                Report logged successfully. Support will contact you.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Reason for Ticket</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white outline-none"
                  >
                    <option value="Damaged equipment specifications">Damaged equipment specifications</option>
                    <option value="Inaccurate pricing listing">Inaccurate pricing listing</option>
                    <option value="Fake owner profile listing">Fake owner profile listing</option>
                    <option value="Scheduling calendar errors">Scheduling calendar errors</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about the issue..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white outline-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-extrabold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-500/10"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Detail;

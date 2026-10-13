import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import MapViewer from '../components/MapViewer';
import { useLanguage } from '../context/LanguageContext';
import { SlidersHorizontal, Map, List, Search as SearchIcon, Calendar, X } from 'lucide-react';

const SearchPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [pincode, setPincode] = useState(searchParams.get('pincode') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // UI state
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Categories list
  const categories = ['Tractor', 'Harvester', 'Seeder', 'Rotavator', 'Sprayer', 'Thresher', 'Cultivator', 'Plough'];

  const fetchListings = async () => {
    setLoading(true);
    try {
      // Read directly from searchParams so we always get fresh values
      // even when the URL changes externally (e.g. coming from Home search)
      const params = {};
      const _category  = searchParams.get('category')  || '';
      const _pincode   = searchParams.get('pincode')   || '';
      const _search    = searchParams.get('search')    || '';
      const _minPrice  = searchParams.get('minPrice')  || '';
      const _maxPrice  = searchParams.get('maxPrice')  || '';
      const _startDate = searchParams.get('startDate') || '';
      const _endDate   = searchParams.get('endDate')   || '';

      if (_category)  params.category  = _category;
      if (_pincode)   params.pincode   = _pincode;
      if (_search)    params.search    = _search;
      if (_minPrice)  params.minPrice  = _minPrice;
      if (_maxPrice)  params.maxPrice  = _maxPrice;
      if (_startDate) params.startDate = _startDate;
      if (_endDate)   params.endDate   = _endDate;

      // Also sync local filter UI state so inputs stay in sync with URL
      setSearchQuery(_search);
      setPincode(_pincode);
      setCategory(_category);
      setMinPrice(_minPrice);
      setMaxPrice(_maxPrice);
      setStartDate(_startDate);
      setEndDate(_endDate);

      const res = await api.get('/equipment', { params });
      if (res.data?.success) {
        setEquipments(res.data.equipments);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const newParams = {};
    if (searchQuery) newParams.search = searchQuery;
    if (pincode) newParams.pincode = pincode;
    if (category) newParams.category = category;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    if (startDate) newParams.startDate = startDate;
    if (endDate) newParams.endDate = endDate;

    setSearchParams(newParams);
    setShowFiltersMobile(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPincode('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setStartDate('');
    setEndDate('');
    setSearchParams({});
    setShowFiltersMobile(false);
  };

  const handleSelectCard = (equip) => {
    navigate(`/equipment/${equip._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-darkbg-200 transition-colors duration-300">
      
      {/* Desktop Search Filters Bar */}
      <div className="bg-white dark:bg-darkbg-100 border-b border-gray-100 dark:border-gray-800 py-4 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleApplyFilters} className="flex flex-wrap items-center gap-3">
            
            {/* Search Input */}
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-brand-500 w-52 text-gray-800 dark:text-white"
            />

            {/* Pincode Input */}
            <input
              type="text"
              placeholder={t('pincodePlaceholder')}
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-brand-500 w-32 text-gray-800 dark:text-white"
            />

            {/* Category Select */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-brand-500 text-gray-700 dark:text-gray-200"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Price Inputs */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Min Rs."
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-brand-500 w-24 text-gray-800 dark:text-white"
              />
              <span className="text-gray-400 dark:text-gray-600">-</span>
              <input
                type="number"
                placeholder="Max Rs."
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-brand-500 w-24 text-gray-800 dark:text-white"
              />
            </div>

            {/* Date Picker Range */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-brand-500 text-gray-600 dark:text-gray-300"
              />
              <span className="text-gray-400 dark:text-gray-600">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-brand-500 text-gray-600 dark:text-gray-300"
              />
            </div>

            <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer">
              Apply
            </button>
            
            <button type="button" onClick={handleClearFilters} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-extrabold rounded-xl hover:bg-gray-50 cursor-pointer">
              Clear
            </button>

          </form>
        </div>
      </div>

      {/* Mobile Filters Trigger */}
      <div className="md:hidden p-4 bg-white dark:bg-darkbg-100 border-b border-gray-100 dark:border-gray-800 flex justify-between gap-3">
        <button
          onClick={() => setShowFiltersMobile(true)}
          className="flex-1 py-2.5 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-extrabold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2"
        >
          <SlidersHorizontal size={14} />
          Filters & Search
        </button>
      </div>

      {/* Main Split Screen container (Airbnb Layout) */}
      <div className="flex h-[calc(100vh-64px)] relative overflow-hidden">
        
        {/* Left Side: Listings Grid */}
        <div className={`flex-1 overflow-y-auto px-4 py-6 md:px-8 ${showMapMobile ? 'hidden md:block' : 'block'}`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                {t('allListings')}
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {loading ? 'Finding assets...' : `${equipments.length} agricultural machines match your search criteria.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {loading
                ? [1, 2, 3, 4].map((i) => <ProductCard key={i} isLoading={true} />)
                : equipments.map((equip) => (
                    <ProductCard key={equip._id} equipment={equip} />
                  ))}
            </div>

            {!loading && equipments.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-darkbg-100 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No equipment matching this description is available.</p>
                <button onClick={handleClearFilters} className="mt-4 px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Reset Search Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map Viewer */}
        <div className={`w-full md:w-[45%] h-full border-l border-gray-100 dark:border-gray-800 ${showMapMobile ? 'block' : 'hidden md:block'}`}>
          <MapViewer equipments={equipments} onSelect={handleSelectCard} />
        </div>
      </div>

      {/* Floating Mobile Toggle Button (Map / List) */}
      <button
        onClick={() => setShowMapMobile(!showMapMobile)}
        className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-3.5 bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 font-extrabold text-xs rounded-full shadow-2xl backdrop-blur-sm flex items-center gap-2 z-30 animate-bounce cursor-pointer hover:scale-105 transition-transform"
      >
        {showMapMobile ? (
          <>
            <List size={16} />
            Show List
          </>
        ) : (
          <>
            <Map size={16} />
            Show Map
          </>
        )}
      </button>

      {/* Mobile Filters Drawer Modal */}
      {showFiltersMobile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="w-full max-h-[85vh] bg-white dark:bg-gray-800 rounded-t-3xl p-6 overflow-y-auto animate-slide-up space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white">Filter Equipment</h3>
              <button onClick={() => setShowFiltersMobile(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleApplyFilters} className="space-y-4">
              {/* Search query */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Search Keywords</label>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white"
                />
              </div>

              {/* Location pincode */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder={t('pincodePlaceholder')}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(category === cat ? '' : cat)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        category === cat
                          ? 'border-brand-500 text-brand-500 bg-brand-50/20'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price limits */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Daily Price Limits (Rs.)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-850 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-850 dark:text-white"
                  />
                </div>
              </div>

              {/* Date Ranges */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Rental Timeline</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-650 dark:text-white"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-650 dark:text-white"
                  />
                </div>
              </div>

              {/* Apply / Clear CTA */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-750">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="py-3 px-4 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-extrabold rounded-xl"
                >
                  Clear All
                </button>
                <button
                  type="submit"
                  className="py-3 px-4 bg-brand-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-brand-500/10"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;

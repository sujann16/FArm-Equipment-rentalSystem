import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import WeatherWidget from '../components/WeatherWidget';
import { Search, MapPin, Tractor, Compass, ArrowRight, ShieldAlert, Sparkles, Sprout } from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [pincode, setPincode] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  // Core Categories List
  const categoriesList = [
    { name: 'Tractor', icon: <Tractor size={28} />, desc: 'Draft power & tillage', color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' },
    { name: 'Harvester', icon: <Compass size={28} />, desc: 'Multi-crop harvesting', color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' },
    { name: 'Seeder', icon: <Sprout size={28} />, desc: 'Uniform sowing drills', color: 'bg-green-50 dark:bg-green-950/20 text-green-600' },
    { name: 'Rotavator', icon: <Sparkles size={28} />, desc: 'Seedbed puddling', color: 'bg-teal-50 dark:bg-teal-950/20 text-teal-600' },
    { name: 'Sprayer', icon: <ShieldAlert size={28} />, desc: 'Crop protection booms', color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' }
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/equipment');
        if (res.data?.success) {
          // Display top 3 equipments
          setFeatured(res.data.equipments.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching equipments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?search=${searchQuery}&pincode=${pincode}`);
  };

  const selectCategory = (categoryName) => {
    navigate(`/search?category=${categoryName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-darkbg-200 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Hero Section with glassmorphic cards */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50/40 dark:from-darkbg-100 dark:via-darkbg-200 dark:to-brand-950/10 py-16 sm:py-24 transition-colors duration-300">
        
        {/* Decorative background shapes */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="px-3.5 py-1.5 bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-fit mx-auto mb-4 border border-brand-200/50 dark:border-brand-950">
              <Sparkles size={14} className="animate-spin-slow" />
              Empowered by AI & Weather Forecasting
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="mt-4 text-base sm:text-lg font-semibold text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Airbnb Search bar Overlay */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-2 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl shadow-brand-500/5 flex flex-col md:flex-row gap-2 transition-all">
            
            <form onSubmit={handleSearchSubmit} className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
              {/* Keyword query */}
              <div className="flex items-center px-4 py-2.5">
                <Search className="text-brand-500 mr-2 flex-shrink-0" size={20} />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full font-semibold"
                />
              </div>

              {/* Pincode query */}
              <div className="flex items-center px-4 py-2.5">
                <MapPin className="text-brand-500 mr-2 flex-shrink-0" size={20} />
                <input
                  type="text"
                  placeholder={t('pincodePlaceholder')}
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full font-semibold"
                />
              </div>
            </form>

            <button
              onClick={handleSearchSubmit}
              className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search size={16} />
              {t('searchBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-16">
        
        {/* Categories Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-center">
            {t('categories')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {categoriesList.map((cat) => (
              <div
                key={cat.name}
                onClick={() => selectCategory(cat.name)}
                className="group cursor-pointer bg-white dark:bg-darkbg-100 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 text-center hover:border-brand-500 dark:hover:border-brand-400 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`p-4 rounded-2xl mx-auto w-fit ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <h4 className="text-sm font-extrabold text-gray-800 dark:text-white mt-4">{cat.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Weather & Farming advisories Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <WeatherWidget />
          </div>
          
          {/* Quick AI recommendation prompt card */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-900/40 dark:to-brand-950/20 text-white rounded-3xl p-6 border border-brand-500/10 shadow-lg relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            
            <div className="space-y-4">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit block">
                Artificial Intelligence
              </span>
              <h3 className="text-lg font-extrabold leading-tight">
                {t('recommendationTitle')}
              </h3>
              <p className="text-xs font-semibold text-brand-100 leading-relaxed">
                Need optimal machine advice? Provide crop details and acreage inside your Farmer Dashboard to forecast rental assets and workloads instantly.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/ai-recommender')}
              className="mt-8 px-5 py-3 bg-white text-brand-700 font-extrabold text-xs rounded-xl hover:bg-brand-50 transition-colors flex items-center justify-center gap-1.5 w-full shadow-md"
            >
              Open AI Recommender
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Featured Equipments Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              {t('featuredListings')}
            </h3>
            <button
              onClick={() => navigate('/search')}
              className="text-xs font-extrabold text-brand-500 hover:text-brand-600 flex items-center gap-1"
            >
              View All Equipment
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {loading
              ? [1, 2, 3].map((i) => <ProductCard key={i} isLoading={true} />)
              : featured.map((equip) => (
                  <ProductCard key={equip._id} equipment={equip} />
                ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;

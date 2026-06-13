import React, { useState } from 'react';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import WeatherWidget from '../components/WeatherWidget';
import { 
  BrainCircuit, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Info, 
  Calculator, 
  CloudSun,
  Tractor,
  Cpu,
  Clock,
  Coins
} from 'lucide-react';

const AiHub = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('recommend'); // 'recommend', 'estimate', 'weather'

  // Recommendation Form State
  const [cropType, setCropType] = useState('Paddy');
  const [landArea, setLandArea] = useState('4');
  const [farmingActivity, setFarmingActivity] = useState('Land Preparation');
  const [recs, setRecs] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState('');

  // Cost Estimator State
  const [estimateEquipType, setEstimateEquipType] = useState('Tractor');
  const [estimateDuration, setEstimateDuration] = useState('5');
  const [estimatePincode, setEstimatePincode] = useState('560001');
  const [costEstimate, setCostEstimate] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [estimateError, setEstimateError] = useState('');

  // Submit Crop Recommender
  const handleGetRec = async (e) => {
    e.preventDefault();
    setRecsError('');
    setRecs(null);
    setLoadingRecs(true);

    try {
      const res = await api.post('/ai/recommend', {
        cropType,
        landArea: Number(landArea),
        farmingActivity
      });

      if (res.data?.success) {
        setRecs(res.data);
      } else {
        setRecsError('Failed to generate suggestions. Please try again.');
      }
    } catch (err) {
      setRecsError(err.response?.data?.message || 'Failed to generate AI recommendations.');
    } finally {
      setLoadingRecs(false);
    }
  };

  // Submit Cost Estimator
  const handleEstimateCost = async (e) => {
    e.preventDefault();
    setEstimateError('');
    setCostEstimate(null);

    if (estimatePincode.trim().length !== 6) {
      setEstimateError('Pincode must be exactly 6 digits.');
      return;
    }

    setLoadingEstimate(true);
    try {
      const res = await api.post('/ai/estimate-cost', {
        equipmentType: estimateEquipType,
        durationDays: Number(estimateDuration),
        pincode: estimatePincode
      });

      if (res.data?.success) {
        setCostEstimate(res.data.estimate);
      } else {
        setEstimateError('Failed to estimate costs. Please try again.');
      }
    } catch (err) {
      setEstimateError(err.response?.data?.message || 'Failed to compute dynamic pricing estimate.');
    } finally {
      setLoadingEstimate(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20">
              <Cpu size={24} className="animate-pulse" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              AgriShare AI Hub
            </h1>
          </div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Harness machine learning recommendation grids, dynamic market rates, and weather forecasting advisories.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700/60 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('recommend')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recommend'
                ? 'bg-white dark:bg-darkbg-100 text-brand-600 dark:text-brand-400 shadow-sm border border-gray-100/40 dark:border-gray-800'
                : 'text-gray-600 dark:text-gray-450 hover:text-brand-500'
            }`}
          >
            <BrainCircuit size={14} />
            Equipment Matcher
          </button>
          <button
            onClick={() => setActiveTab('estimate')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'estimate'
                ? 'bg-white dark:bg-darkbg-100 text-brand-600 dark:text-brand-400 shadow-sm border border-gray-100/40 dark:border-gray-800'
                : 'text-gray-600 dark:text-gray-450 hover:text-brand-500'
            }`}
          >
            <Calculator size={14} />
            Price Estimator
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'weather'
                ? 'bg-white dark:bg-darkbg-100 text-brand-600 dark:text-brand-400 shadow-sm border border-gray-100/40 dark:border-gray-800'
                : 'text-gray-600 dark:text-gray-450 hover:text-brand-500'
            }`}
          >
            <CloudSun size={14} />
            Weather Planner
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: EQUIPMENT RECOMMENDER */}
        {activeTab === 'recommend' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Input Form */}
            <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-50 dark:border-gray-850 pb-3">
                <BrainCircuit className="text-brand-500" size={20} />
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white leading-none">
                    Get Recommendations
                  </h3>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-1">Google Gemini Powered</span>
                </div>
              </div>

              <form onSubmit={handleGetRec} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {t('cropLabel')}
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white outline-none"
                  >
                    <option value="Paddy">Paddy / Rice</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Maize">Maize</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Sugarcane">Sugarcane</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {t('areaLabel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {t('activityLabel')}
                  </label>
                  <select
                    value={farmingActivity}
                    onChange={(e) => setFarmingActivity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white outline-none"
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
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles size={14} />
                  {loadingRecs ? 'Generating suggestions...' : 'Get AI Recommendation'}
                </button>
              </form>
            </div>

            {/* Recommendations Output */}
            <div className="lg:col-span-2 space-y-6">
              {loadingRecs ? (
                <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse space-y-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-850 rounded-lg w-1/3"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-40 bg-gray-200 dark:bg-gray-850 rounded-2xl"></div>
                    <div className="h-40 bg-gray-200 dark:bg-gray-850 rounded-2xl"></div>
                  </div>
                  <div className="h-24 bg-gray-200 dark:bg-gray-850 rounded-2xl w-full"></div>
                </div>
              ) : recs ? (
                <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-brand-200 dark:border-brand-900 shadow-xl shadow-brand-500/5 space-y-6 animate-slide-up">
                  <div className="flex items-center gap-2 border-b border-brand-50 dark:border-brand-950 pb-3">
                    <Sparkles className="text-brand-500" size={20} />
                    <h4 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white">AI Recommendations Output</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recs.recommendations?.map((rec, idx) => (
                      <div key={idx} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 space-y-3">
                        <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 text-[10px] font-extrabold uppercase rounded-lg">
                          {rec.equipmentType}
                        </span>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Estimated Timeline: <span className="font-extrabold text-gray-700 dark:text-gray-300">{rec.durationDays} Days</span>
                          </p>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Est. Daily Rate: <span className="font-extrabold text-brand-600">Rs. {rec.dailyEstimate.toLocaleString()}</span>
                          </p>
                        </div>
                        
                        <p className="text-xs font-semibold text-gray-650 dark:text-gray-350 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                          {rec.reason}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-brand-50/20 dark:bg-brand-950/10 p-5 rounded-2xl border border-brand-100/30 dark:border-brand-950 space-y-2">
                    <h5 className="text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase">Estimated Budget</h5>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">{recs.totalEstimatedCostRange}</p>
                    <p className="text-xs font-semibold text-gray-650 dark:text-gray-350 leading-relaxed pt-2 border-t border-brand-100/30 dark:border-brand-950">
                      {recs.generalAdvice}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-12 border border-gray-100 dark:border-gray-800 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 text-brand-500 rounded-3xl border border-brand-100/30 dark:border-brand-900">
                    <BrainCircuit size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">AI Suggestion System Ready</h4>
                    <p className="text-xs text-gray-500 font-semibold max-w-sm">
                      Input your land profile and farming activity on the left to receive dynamic machinery matching details and crop guides.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SMART COST ESTIMATOR */}
        {activeTab === 'estimate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Input Form */}
            <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-50 dark:border-gray-850 pb-3">
                <Calculator className="text-brand-500" size={20} />
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white leading-none">
                    Smart Cost Calculator
                  </h3>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-1">Dynamic Surcharges & Discounts</span>
                </div>
              </div>

              <form onSubmit={handleEstimateCost} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Equipment Category
                  </label>
                  <select
                    value={estimateEquipType}
                    onChange={(e) => setEstimateEquipType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white outline-none"
                  >
                    {['Tractor', 'Harvester', 'Seeder', 'Rotavator', 'Sprayer', 'Thresher', 'Cultivator', 'Plough'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={estimateDuration}
                    onChange={(e) => setEstimateDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Location Pincode (6 digits)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 560001"
                    value={estimatePincode}
                    onChange={(e) => setEstimatePincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white outline-none"
                  />
                </div>

                {estimateError && <p className="text-xs text-red-500 font-semibold">{estimateError}</p>}

                <button
                  type="submit"
                  disabled={loadingEstimate}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calculator size={14} />
                  {loadingEstimate ? 'Calculating...' : 'Compute Price Quote'}
                </button>
              </form>
            </div>

            {/* Cost Estimate Output */}
            <div className="lg:col-span-2 space-y-6">
              {loadingEstimate ? (
                <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse space-y-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-850 rounded-lg w-1/3"></div>
                  <div className="h-44 bg-gray-200 dark:bg-gray-850 rounded-2xl"></div>
                </div>
              ) : costEstimate ? (
                <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-brand-200 dark:border-brand-900 shadow-xl shadow-brand-500/5 space-y-6 animate-slide-up">
                  <div className="flex items-center gap-2 border-b border-brand-50 dark:border-brand-950 pb-3">
                    <Calculator className="text-brand-500" size={20} />
                    <h4 className="text-sm font-extrabold uppercase text-gray-900 dark:text-white">AI Dynamic Rental Valuation</h4>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Base Machinery Cost</span>
                      <p className="text-xl font-extrabold text-gray-800 dark:text-white mt-2">Rs. {costEstimate.baseCost.toLocaleString()}</p>
                      <span className="text-[10px] text-gray-500 dark:text-gray-450 mt-1">Rs. {costEstimate.baseRate}/day for {costEstimate.durationDays} days</span>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Demand Surcharges & Discounts</span>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs font-bold text-red-500">Local Demand: x{costEstimate.demandMultiplier.toFixed(2)} (+Rs. {costEstimate.locationSurcharge.toLocaleString()})</p>
                        <p className="text-xs font-bold text-green-500">Volume Discount: -Rs. {costEstimate.volumeDiscount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-brand-50/20 dark:bg-brand-950/10 border border-brand-100/30 dark:border-brand-950 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Total Est. Quote</span>
                      <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-2">Rs. {costEstimate.estimatedTotal.toLocaleString()}</p>
                      <span className="text-[10px] font-extrabold text-brand-500/80 mt-1">Confidence Score: {(costEstimate.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex gap-3">
                    <Info className="text-brand-500 flex-shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1">
                      <h5 className="text-xs font-extrabold text-gray-950 dark:text-white uppercase">Calculation Rationale</h5>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-350 leading-relaxed">
                        {costEstimate.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-12 border border-gray-100 dark:border-gray-800 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 text-brand-500 rounded-3xl border border-brand-100/30 dark:border-brand-900">
                    <Coins size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Smart Pricing Engine Offline</h4>
                    <p className="text-xs text-gray-500 font-semibold max-w-sm">
                      Input the machine category, rental duration, and regional pincode on the left to compute live market-rate estimates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WEATHER PLANNING */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-darkbg-100 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">Weather-Aware Farm Operations</h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Weather patterns heavily dictate tillage and harvesting success. Use the weather utility below to review 5-day crop compatibility ratings based on your target region.
              </p>
            </div>
            
            <WeatherWidget defaultPincode="560001" />
          </div>
        )}

      </div>
    </div>
  );
};

export default AiHub;

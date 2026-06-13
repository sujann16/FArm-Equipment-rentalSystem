import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { CloudRain, Sun, Cloud, Wind, AlertTriangle, Search, CheckCircle2 } from 'lucide-react';

const WeatherWidget = ({ defaultPincode = '560001' }) => {
  const { t } = useLanguage();
  const [pincode, setPincode] = useState(defaultPincode);
  const [inputPincode, setInputPincode] = useState(defaultPincode);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/ai/weather-suggestions?pincode=${pincode}`);
        if (res.data?.success) {
          setWeatherData(res.data);
        }
      } catch (err) {
        setError('Failed to fetch weather forecast.');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [pincode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputPincode.trim().length === 6) {
      setPincode(inputPincode);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Rain':
      case 'Thunderstorm':
        return <CloudRain className="w-8 h-8 text-blue-500 animate-bounce" />;
      case 'Clear':
        return <Sun className="w-8 h-8 text-yellow-500 animate-spin-slow" />;
      case 'Windy':
        return <Wind className="w-8 h-8 text-teal-500" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900';
  };

  return (
    <div className="bg-white dark:bg-darkbg-100 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CloudRain size={20} className="text-brand-500" />
            {t('weatherTitle')}
          </h3>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">5-Day Tillage & Harvesting Compatibility</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-1.5 w-full sm:w-56">
          <input
            type="text"
            placeholder={t('pincodePlaceholder')}
            maxLength={6}
            value={inputPincode}
            onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
            className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
          />
          <button type="submit" className="text-gray-400 hover:text-brand-500 transition-colors">
            <Search size={16} />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-6 text-sm font-semibold text-red-500">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Main Weather Alert Warning */}
          {weatherData?.warningAlert && (
            <div className="flex gap-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950 rounded-2xl p-4 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">{weatherData.warningAlert.title}</h4>
                <p className="text-xs font-semibold mt-1 leading-relaxed">{weatherData.warningAlert.message}</p>
              </div>
            </div>
          )}

          {/* 5-Day Forecast Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {weatherData?.forecast?.map((day, idx) => {
              const formattedDate = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <div
                  key={day.date}
                  className={`flex flex-col items-center justify-between p-4 border rounded-2xl transition-all duration-300 ${
                    idx === 0 ? 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{formattedDate}</span>
                  <div className="my-2">{getWeatherIcon(day.condition)}</div>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{day.temp}°C</span>
                  
                  <span className="text-[10px] font-bold text-gray-400 mt-1">Rain: {day.rainProbability}%</span>
                  
                  <div className={`mt-3 w-full py-1 text-center text-[10px] font-extrabold uppercase rounded-lg border ${getScoreColor(day.farmingScore)}`}>
                    Score: {day.farmingScore}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today's Farm Recommendations */}
          {weatherData?.forecast?.[0] && (
            <div className="bg-brand-50/20 dark:bg-brand-950/10 border border-brand-100/30 dark:border-brand-950 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-brand-500" />
                Farming Operational Advisories (Today)
              </h4>
              <ul className="space-y-2">
                {weatherData.forecast[0].suggestions.map((sug, i) => (
                  <li key={i} className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed pl-3 border-l-2 border-brand-500">
                    {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;

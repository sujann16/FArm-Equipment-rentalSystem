import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, Globe, Menu, X, Tractor, User as UserIcon, LogOut, LayoutDashboard, BrainCircuit } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-darkbg-100/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20">
              <Tractor size={24} className="animate-pulse" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              AGRISHARE <span className="text-gray-900 dark:text-white">AI</span>
            </span>
          </Link>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400">
              {t('navSearch')}
            </Link>
            
            {user && (
              <>
                <Link to="/ai-recommender" className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 flex items-center gap-1.5">
                  <BrainCircuit size={16} />
                  AI Tools
                </Link>
                <Link to="/dashboard" className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 flex items-center gap-1.5">
                  <LayoutDashboard size={16} />
                  {t('navDashboard')}
                </Link>
              </>
            )}

            {/* Language Selector */}
            <div className="relative group">
              <button className="p-2 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-colors">
                <Globe size={18} />
                <span className="text-xs font-bold uppercase">{lang}</span>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                <button onClick={() => setLang('en')} className={`w-full text-left px-4 py-2 text-xs font-semibold ${lang === 'en' ? 'text-brand-500 bg-brand-50/50 dark:bg-brand-950/20' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-700`}>English</button>
                <button onClick={() => setLang('hi')} className={`w-full text-left px-4 py-2 text-xs font-semibold ${lang === 'hi' ? 'text-brand-500 bg-brand-50/50 dark:bg-brand-950/20' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-700`}>Hindi (हिन्दी)</button>
                <button onClick={() => setLang('kn')} className={`w-full text-left px-4 py-2 text-xs font-semibold ${lang === 'kn' ? 'text-brand-500 bg-brand-50/50 dark:bg-brand-950/20' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-700`}>Kannada (ಕನ್ನಡ)</button>
                <button onClick={() => setLang('te')} className={`w-full text-left px-4 py-2 text-xs font-semibold ${lang === 'te' ? 'text-brand-500 bg-brand-50/50 dark:bg-brand-950/20' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-700`}>Telugu (తెలుగు)</button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Account Controls */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">{user.firstName}</span>
                  <span className="text-[10px] font-semibold text-brand-500">{t(`role${user.role}`)}</span>
                </div>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.firstName}`}
                  alt="Avatar"
                  className="w-9 h-9 rounded-xl border border-brand-100 dark:border-brand-950 object-cover shadow-sm bg-gray-50"
                />
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  title={t('navLogout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-brand-500">
                  {t('navLogin')}
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all">
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 dark:text-gray-400 rounded-lg"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-darkbg-100 px-4 pt-2 pb-4 space-y-3 transition-colors duration-300">
          <Link
            to="/search"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('navSearch')}
          </Link>
          
          {user && (
            <>
              <Link
                to="/ai-recommender"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                AI Tools
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t('navDashboard')}
              </Link>
            </>
          )}

          {/* Mobile Language options */}
          <div className="px-3 py-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">{t('lang')}</span>
            <div className="grid grid-cols-4 gap-2">
              {['en', 'hi', 'kn', 'te'].map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setIsOpen(false);
                  }}
                  className={`py-1 text-xs font-bold rounded-lg border ${
                    lang === l 
                      ? 'border-brand-500 text-brand-500 bg-brand-50/50 dark:bg-brand-950/20' 
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-1">
                  <img src={user.avatar} className="w-10 h-10 rounded-xl" alt="avatar" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs font-semibold text-brand-500">{t(`role${user.role}`)}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 rounded-xl"
                >
                  <LogOut size={16} />
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 text-center text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 text-center text-sm font-bold text-white bg-brand-500 rounded-xl"
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

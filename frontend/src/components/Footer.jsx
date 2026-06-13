import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Tractor, Shield, HeartHandshake, PhoneCall } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-darkbg-200 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-brand-500 rounded-lg text-white">
                <Tractor size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                AGRISHARE <span className="text-brand-500">AI</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Empowering farmers with modern agricultural machinery rental solutions, backed by AI and weather forecast optimization.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-xl">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase">Verified Assets</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">All equipments are quality checked</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-xl">
              <HeartHandshake size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase">Fair Price Guarantee</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">AI dynamic estimates prevent price gouging</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-xl">
              <PhoneCall size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase">24/7 Farmer Care</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Reach support via disputes logs instantly</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} AgriShare AI. Built for Sustainable Farming. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

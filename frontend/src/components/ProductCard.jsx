import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Gauge } from 'lucide-react';

const ProductCard = ({ equipment, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-darkbg-100 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 w-full"></div>
        <div className="p-5 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const {
    _id,
    name,
    category,
    images,
    dailyPrice,
    averageRating,
    location,
    specifications,
    owner
  } = equipment;

  const displayImage = images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600';

  return (
    <div className="group bg-white dark:bg-darkbg-100 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg dark:hover:border-gray-750 transition-all duration-350 flex flex-col h-full">
      {/* Listing Image */}
      <div className="relative overflow-hidden h-48 bg-gray-50">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-extrabold uppercase bg-white/90 dark:bg-gray-900/90 text-brand-600 dark:text-brand-400 rounded-full shadow-sm backdrop-blur-sm">
          {category}
        </span>
        {/* Rating Badge */}
        {averageRating > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-brand-500 text-white rounded-full shadow-sm">
            <Star size={12} fill="white" />
            <span>{averageRating}</span>
          </div>
        )}
      </div>

      {/* Listing details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
            {specifications?.manufacturer || 'Generic'}
          </span>
          <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
            {name}
          </h4>
          
          {/* Geolocation Pincode */}
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
            <MapPin size={12} className="text-gray-400" />
            <span>{location?.address ? `${location.address.split(',')[0]}, ${location.pincode}` : location?.pincode}</span>
          </div>

          {/* Horsepower Info */}
          {specifications?.horsepower && (
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1.5">
              <Gauge size={12} className="text-gray-400" />
              <span>{specifications.horsepower} HP &bull; {specifications.condition}</span>
            </div>
          )}
        </div>

        {/* Price & Book CTA */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Daily Price</span>
            <p className="text-base font-extrabold text-brand-600 dark:text-brand-400 leading-none">
              Rs. {dailyPrice.toLocaleString()}
            </p>
          </div>
          <Link
            to={`/equipment/${_id}`}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-md shadow-brand-500/10"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

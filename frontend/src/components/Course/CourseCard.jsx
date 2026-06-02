import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../Common/StarRating';
import { BookOpen, User, ArrowRight } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
  if (url.startsWith('/uploads')) {
    return `${BACKEND_URL}${url}`;
  }
  return url;
};

export default function CourseCard({ course }) {
  const { _id, title, subtitle, thumbnail, price, level, category, rating, ratingsCount, instructor } = course;

  const isFeatured = title.includes('Algoritmos Genéticos');

  // Format level text
  const levelLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  const levelColors = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className={`group flex flex-col glass-panel glass-panel-hover rounded-2xl overflow-hidden h-full ${
      isFeatured ? 'ring-2 ring-indigo-500/50 relative' : ''
    }`}>
      {/* Featured Badge */}
      {isFeatured && (
        <span className="absolute top-4 left-4 z-10 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
          Curso Destacado ★
        </span>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={getImageUrl(thumbnail)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Category & Level Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 rounded-md uppercase tracking-wider">
              {category}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 border rounded-md uppercase tracking-wider ${levelColors[level]}`}>
              {levelLabels[level]}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {subtitle}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-2 pt-1">
            <StarRating rating={rating} />
            <span className="text-xs font-bold text-amber-400">{rating}</span>
            <span className="text-xs text-slate-500">({ratingsCount})</span>
          </div>
        </div>

        {/* Footer / Pricing / Action */}
        <div className="border-t border-slate-800/60 mt-6 pt-4 flex items-center justify-between">
          {/* Instructor profile */}
          <div className="flex items-center space-x-2">
            <img
              src={instructor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
              alt={instructor?.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-700"
            />
            <span className="text-xs text-slate-400 truncate max-w-[100px]">{instructor?.name?.split(' ')[0]} {instructor?.name?.split(' ')[2] || ''}</span>
          </div>

          {/* Pricing */}
          <div className="flex items-center space-x-3">
            <span className="font-display font-bold text-xl text-white">
              {price > 0 ? `$${price.toFixed(2)}` : 'Gratis'}
            </span>
            <Link
              to={`/courses/${_id}`}
              className="p-2 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-white hover:translate-x-0.5 transition-all"
              title="Ver detalles del curso"
            >
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 5, totalStars = 5, size = 16, className = "" }) {
  // Generate array [1..5]
  const stars = Array.from({ length: totalStars }, (_, i) => i + 1);

  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {stars.map((star) => {
        // Determine fill level
        const isFilled = rating >= star;
        const isHalf = !isFilled && rating >= star - 0.5;

        return (
          <div key={star} className="relative">
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-600'
              }`}
            />
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star
                  size={size}
                  className="text-amber-400 fill-amber-400"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

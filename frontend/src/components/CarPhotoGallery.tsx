import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

interface CarPhotoGalleryProps {
  imageUrls: string[];
  carName: string;
}

export default function CarPhotoGallery({ imageUrls, carName }: CarPhotoGalleryProps) {
  const [current, setCurrent] = useState(0);
  const images = imageUrls.length > 0 ? imageUrls : ['/assets/generated/car-placeholder.dim_600x400.png'];

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative rounded-lg overflow-hidden bg-secondary aspect-[16/9]">
        <img
          src={images[current]}
          alt={`${carName} - ${current + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/car-placeholder.dim_600x400.png';
          }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-charcoal/80 border border-gold/40 flex items-center justify-center text-gold hover:bg-charcoal transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-charcoal/80 border border-gold/40 flex items-center justify-center text-gold hover:bg-charcoal transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-gold' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${
                i === current ? 'border-gold' : 'border-transparent'
              }`}
            >
              <img
                src={url}
                alt={`${carName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/generated/car-placeholder.dim_600x400.png';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

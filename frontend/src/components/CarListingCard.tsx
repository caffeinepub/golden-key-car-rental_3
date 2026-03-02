import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Car, CarCategory, TransmissionType } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StarRating from './StarRating';
import { Gauge, Settings2 } from 'lucide-react';

interface CarListingCardProps {
  car: Car;
  averageRating?: number;
  reviewCount?: number;
}

function getCategoryLabel(category: CarCategory, t: (k: string) => string): string {
  switch (category) {
    case CarCategory.economy: return t('cars.filter.economy');
    case CarCategory.suv: return t('cars.filter.suv');
    case CarCategory.luxury: return t('cars.filter.luxury');
    case CarCategory.van: return t('cars.filter.van');
    default: return String(category);
  }
}

function getTransmissionLabel(transmission: TransmissionType, t: (k: string) => string): string {
  switch (transmission) {
    case TransmissionType.automatic: return t('cars.filter.automatic');
    case TransmissionType.manual: return t('cars.filter.manual');
    default: return String(transmission);
  }
}

export default function CarListingCard({ car, averageRating, reviewCount }: CarListingCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const imageUrl = car.imageUrls.length > 0 ? car.imageUrls[0] : '/assets/generated/car-placeholder.dim_600x400.png';

  return (
    <div className="luxury-card overflow-hidden group hover:border-gold/40 transition-all duration-300 hover:shadow-gold flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={imageUrl}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/car-placeholder.dim_600x400.png';
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge
            className={car.availability
              ? 'bg-green-600/90 text-white border-0'
              : 'bg-destructive/90 text-white border-0'
            }
          >
            {car.availability ? t('cars.available') : t('cars.unavailable')}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-charcoal/80 text-gold border-gold/30">
            {getCategoryLabel(car.category, t)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif font-bold text-lg text-foreground mb-1 group-hover:text-gold transition-colors">
          {car.name}
        </h3>

        {averageRating !== undefined && averageRating > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={Math.round(averageRating)} size="sm" />
            <span className="text-xs text-muted-foreground">
              {averageRating.toFixed(1)} ({reviewCount || 0})
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5" />
            {getTransmissionLabel(car.transmission, t)}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5" />
            {getCategoryLabel(car.category, t)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gold">${car.dailyRateUSD.toFixed(0)}</span>
            <span className="text-sm text-muted-foreground">{t('cars.perDay')}</span>
          </div>
          <Button
            onClick={() => navigate({ to: '/cars/$carId', params: { carId: car.id.toString() } })}
            disabled={!car.availability}
            className="bg-gold text-charcoal hover:bg-gold-light font-semibold disabled:opacity-50"
            size="sm"
          >
            {t('cars.bookNow')}
          </Button>
        </div>
      </div>
    </div>
  );
}

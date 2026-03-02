import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetCar, useGetCarReviews } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { CarCategory, TransmissionType } from '../backend';
import CarPhotoGallery from '../components/CarPhotoGallery';
import PricingCalculator from '../components/PricingCalculator';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import StarRating from '../components/StarRating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Settings2, Gauge, DollarSign } from 'lucide-react';

function getCategoryLabel(category: CarCategory): string {
  const map: Record<string, string> = {
    [CarCategory.economy]: 'Economy',
    [CarCategory.suv]: 'SUV',
    [CarCategory.luxury]: 'Luxury',
    [CarCategory.van]: 'Van',
  };
  return map[String(category)] || String(category);
}

function getTransmissionLabel(transmission: TransmissionType): string {
  return transmission === TransmissionType.automatic ? 'Automatic' : 'Manual';
}

export default function CarDetail() {
  const { carId } = useParams({ from: '/cars/$carId' });
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { identity } = useInternetIdentity();

  const carIdBigInt = carId ? BigInt(carId) : null;
  const { data: car, isLoading: carLoading } = useGetCar(carIdBigInt);
  const { data: reviews = [] } = useGetCarReviews(carIdBigInt);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  const isAuthenticated = !!identity;

  const handleBookNow = () => {
    if (!startDate || !endDate) return;
    navigate({
      to: '/booking',
      search: {
        carId: carId,
        startDate,
        endDate,
      } as Record<string, string>,
    });
  };

  if (carLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Car not found.</p>
        <Button onClick={() => navigate({ to: '/cars' })} className="mt-4 bg-gold text-charcoal">
          Back to Fleet
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate({ to: '/cars' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')} to Fleet
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery + Info */}
        <div className="lg:col-span-2 space-y-6">
          <CarPhotoGallery imageUrls={car.imageUrls} carName={car.name} />

          {/* Car title & rating */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">{car.name}</h1>
                {avgRating > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={Math.round(avgRating)} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {avgRating.toFixed(1)} ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Badge className={car.availability ? 'bg-green-600/20 text-green-400 border-green-600/30' : 'bg-destructive/20 text-destructive border-destructive/30'}>
                  {car.availability ? t('cars.available') : t('cars.unavailable')}
                </Badge>
                <Badge variant="outline" className="border-gold/40 text-gold">
                  {getCategoryLabel(car.category)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="specs">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="specs" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
                {t('cars.specs')}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
                {t('cars.reviews')} ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-4">
              <div className="luxury-card p-5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('cars.category')}</p>
                    <p className="font-semibold text-foreground">{getCategoryLabel(car.category)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('cars.transmission')}</p>
                    <p className="font-semibold text-foreground">{getTransmissionLabel(car.transmission)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('cars.dailyRate')}</p>
                    <p className="font-semibold text-gold">${car.dailyRateUSD}/day</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4 space-y-4">
              {isAuthenticated && <ReviewForm carId={car.id} />}
              {!isAuthenticated && (
                <div className="luxury-card p-4 text-center text-muted-foreground text-sm">
                  {t('reviews.loginRequired')}
                </div>
              )}
              <ReviewsList reviews={reviews} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Booking panel */}
        <div className="space-y-4">
          {/* Date selection */}
          <div className="luxury-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground">{t('cars.availability')}</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('booking.pickupDate')}</Label>
                <Input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('booking.returnDate')}</Label>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <Button
              onClick={handleBookNow}
              disabled={!car.availability || !startDate || !endDate}
              className="w-full bg-gold text-charcoal hover:bg-gold-light font-bold"
            >
              {t('cars.bookNow')}
            </Button>
          </div>

          {/* Pricing calculator */}
          <PricingCalculator
            dailyRateUSD={car.dailyRateUSD}
            startDate={startDate}
            endDate={endDate}
            requiresAuth={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}

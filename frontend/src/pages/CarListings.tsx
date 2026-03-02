import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetAvailableCars } from '../hooks/useQueries';
import CarListingCard from '../components/CarListingCard';
import CarFilterPanel, { FilterState } from '../components/CarFilterPanel';
import { CarCategory, TransmissionType } from '../backend';
import { Loader2, Car } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'all',
  transmission: 'all',
  maxPrice: 500,
  pickupDate: '',
  returnDate: '',
};

export default function CarListings() {
  const { t } = useLanguage();
  const { data: cars = [], isLoading, error } = useGetAvailableCars();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (filters.search && !car.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category !== 'all' && String(car.category) !== filters.category) return false;
      if (filters.transmission !== 'all' && String(car.transmission) !== filters.transmission) return false;
      if (car.dailyRateUSD > filters.maxPrice) return false;
      return true;
    });
  }, [cars, filters]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">{t('cars.title')}</h1>
        <div className="w-16 h-0.5 bg-gold" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Panel */}
        <aside className="lg:w-72 shrink-0">
          <CarFilterPanel filters={filters} onChange={setFilters} />
        </aside>

        {/* Car Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
              <span className="ml-3 text-muted-foreground">{t('cars.loading')}</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive">
              <p>{t('common.error')}</p>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Car className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">{t('cars.noResults')}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map(car => (
                  <CarListingCard key={car.id.toString()} car={car} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

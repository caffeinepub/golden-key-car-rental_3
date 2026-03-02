import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CarCategory, TransmissionType } from '../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

export interface FilterState {
  search: string;
  category: string;
  transmission: string;
  maxPrice: number;
  pickupDate: string;
  returnDate: string;
}

interface CarFilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  maxPriceLimit?: number;
}

export default function CarFilterPanel({ filters, onChange, maxPriceLimit = 500 }: CarFilterPanelProps) {
  const { t } = useLanguage();

  const update = (key: keyof FilterState, value: string | number) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      category: 'all',
      transmission: 'all',
      maxPrice: maxPriceLimit,
      pickupDate: '',
      returnDate: '',
    });
  };

  return (
    <div className="luxury-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gold font-semibold">
          <SlidersHorizontal className="w-4 h-4" />
          <span>{t('common.filter')}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground h-7 px-2">
          <X className="w-3.5 h-3.5 mr-1" />
          {t('common.clear')}
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('common.search')}</Label>
        <Input
          placeholder={t('cars.search')}
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="bg-secondary border-border"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('booking.pickupDate')}</Label>
          <Input
            type="date"
            value={filters.pickupDate}
            onChange={e => update('pickupDate', e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('booking.returnDate')}</Label>
          <Input
            type="date"
            value={filters.returnDate}
            onChange={e => update('returnDate', e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('cars.filter.category')}</Label>
        <Select value={filters.category} onValueChange={v => update('category', v)}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('cars.filter.all')}</SelectItem>
            <SelectItem value={CarCategory.economy}>{t('cars.filter.economy')}</SelectItem>
            <SelectItem value={CarCategory.suv}>{t('cars.filter.suv')}</SelectItem>
            <SelectItem value={CarCategory.luxury}>{t('cars.filter.luxury')}</SelectItem>
            <SelectItem value={CarCategory.van}>{t('cars.filter.van')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transmission */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('cars.filter.transmission')}</Label>
        <Select value={filters.transmission} onValueChange={v => update('transmission', v)}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('cars.filter.all')}</SelectItem>
            <SelectItem value={TransmissionType.automatic}>{t('cars.filter.automatic')}</SelectItem>
            <SelectItem value={TransmissionType.manual}>{t('cars.filter.manual')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Max Price */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('cars.filter.price')}</Label>
          <span className="text-sm font-semibold text-gold">${filters.maxPrice}</span>
        </div>
        <Slider
          min={0}
          max={maxPriceLimit}
          step={10}
          value={[filters.maxPrice]}
          onValueChange={([v]) => update('maxPrice', v)}
          className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
        />
      </div>
    </div>
  );
}

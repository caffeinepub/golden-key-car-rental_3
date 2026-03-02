import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CURRENCY_RATES, CURRENCY_SYMBOLS, EARLY_PAYMENT_DISCOUNT } from '../constants/contact';
import PromoCodeInput from './PromoCodeInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tag, DollarSign } from 'lucide-react';

interface PricingCalculatorProps {
  dailyRateUSD: number;
  startDate: string;
  endDate: string;
  addOnsCostUSD?: number;
  onCurrencyChange?: (currency: string) => void;
  requiresAuth?: boolean;
}

export default function PricingCalculator({
  dailyRateUSD,
  startDate,
  endDate,
  addOnsCostUSD = 0,
  onCurrencyChange,
  requiresAuth = false,
}: PricingCalculatorProps) {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState('USD');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [earlyPayment, setEarlyPayment] = useState(false);

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const days = start && end && end > start
    ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const rate = CURRENCY_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const baseCostUSD = dailyRateUSD * days;
  const addOnsTotal = addOnsCostUSD * days;
  const subtotal = baseCostUSD + addOnsTotal;
  const promoAmount = subtotal * (promoDiscount / 100);
  const afterPromo = subtotal - promoAmount;
  const earlyPaymentAmount = earlyPayment ? afterPromo * EARLY_PAYMENT_DISCOUNT : 0;
  const totalUSD = afterPromo - earlyPaymentAmount;
  const totalConverted = totalUSD * rate;

  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    onCurrencyChange?.(val);
  };

  return (
    <div className="luxury-card p-5 space-y-4">
      <div className="flex items-center gap-2 text-gold font-semibold">
        <DollarSign className="w-4 h-4" />
        <span>{t('pricing.title')}</span>
      </div>

      {/* Currency selector */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground shrink-0">{t('pricing.currency')}:</Label>
        <Select value={currency} onValueChange={handleCurrencyChange}>
          <SelectTrigger className="w-28 bg-secondary border-border h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="AED">AED</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Breakdown */}
      {days > 0 ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t('pricing.perDay')} × {days} {t('pricing.days')}</span>
            <span>{symbol}{(baseCostUSD * rate).toFixed(2)}</span>
          </div>
          {addOnsTotal > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t('booking.addonsCost')}</span>
              <span>{symbol}{(addOnsTotal * rate).toFixed(2)}</span>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-400">
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{t('booking.discount')} ({promoDiscount}%)</span>
              <span>-{symbol}{(promoAmount * rate).toFixed(2)}</span>
            </div>
          )}
          {earlyPayment && (
            <div className="flex justify-between text-green-400">
              <span>{t('booking.earlyPayment')}</span>
              <span>-{symbol}{(earlyPaymentAmount * rate).toFixed(2)}</span>
            </div>
          )}
          <Separator className="bg-border" />
          <div className="flex justify-between font-bold text-base">
            <span className="text-foreground">{t('pricing.total')}</span>
            <span className="text-gold text-lg">{symbol}{totalConverted.toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Select dates to see pricing</p>
      )}

      {/* Promo code */}
      {requiresAuth && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {t('pricing.promoCode')}
          </Label>
          <PromoCodeInput onDiscountApplied={setPromoDiscount} />
        </div>
      )}

      {/* Early payment */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="early-payment"
          checked={earlyPayment}
          onCheckedChange={(v) => setEarlyPayment(!!v)}
          className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
        />
        <Label htmlFor="early-payment" className="text-sm cursor-pointer">
          {t('pricing.earlyPayment')} <span className="text-green-400">(10% off)</span>
        </Label>
      </div>
    </div>
  );
}

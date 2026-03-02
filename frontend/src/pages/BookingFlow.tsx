import React, { useState } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCar, useBookCar, useCreateCheckoutSession } from '../hooks/useQueries';
import { AddOn } from '../backend';
import BookingStepIndicator from '../components/BookingStepIndicator';
import AddOnsSelector, { SelectedAddOn } from '../components/AddOnsSelector';
import CustomerInfoForm, { CustomerInfo } from '../components/CustomerInfoForm';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, LogIn, Car, AlertCircle } from 'lucide-react';
import { EARLY_PAYMENT_DISCOUNT } from '../constants/contact';

const DEFAULT_ADDONS: SelectedAddOn[] = [
  { name: 'Child Seat', dailyCostUSD: 5, selected: false },
  { name: 'Additional Driver', dailyCostUSD: 10, selected: false },
  { name: 'Unlimited KM', dailyCostUSD: 15, selected: false },
];

const DEFAULT_CUSTOMER: CustomerInfo = { name: '', email: '', phone: '', license: '' };

function validateCustomerInfo(info: CustomerInfo): Partial<CustomerInfo> {
  const errors: Partial<CustomerInfo> = {};
  if (!info.name.trim()) errors.name = 'Name is required';
  if (!info.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errors.email = 'Invalid email format';
  if (!info.phone.trim()) errors.phone = 'Phone is required';
  if (!info.license.trim()) errors.license = "Driver's license is required";
  return errors;
}

export default function BookingFlow() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const search = useSearch({ strict: false }) as Record<string, string>;

  const carId = search.carId ? BigInt(search.carId) : null;
  const startDate = search.startDate || '';
  const endDate = search.endDate || '';

  const { data: car, isLoading: carLoading } = useGetCar(carId);
  const bookCar = useBookCar();
  const createCheckout = useCreateCheckoutSession();

  const [addOns, setAddOns] = useState<SelectedAddOn[]>(DEFAULT_ADDONS);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(DEFAULT_CUSTOMER);
  const [customerErrors, setCustomerErrors] = useState<Partial<CustomerInfo>>({});
  const [earlyPayment] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const days = start && end && end > start
    ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const selectedAddOns = addOns.filter(a => a.selected);
  const addOnsDailyCost = selectedAddOns.reduce((sum, a) => sum + a.dailyCostUSD, 0);
  const baseCost = (car?.dailyRateUSD || 0) * days;
  const addOnsCost = addOnsDailyCost * days;
  const subtotal = baseCost + addOnsCost;
  const earlyDiscount = earlyPayment ? subtotal * EARLY_PAYMENT_DISCOUNT : 0;
  const total = subtotal - earlyDiscount;

  const currentStep = !isAuthenticated ? 1 : 2;

  const handleProceedToPayment = async () => {
    const errors = validateCustomerInfo(customerInfo);
    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors);
      return;
    }
    setCustomerErrors({});
    setBookingError('');

    if (!carId || !startDate || !endDate || !car) return;

    try {
      const startMs = BigInt(new Date(startDate).getTime()) * BigInt(1_000_000);
      const endMs = BigInt(new Date(endDate).getTime()) * BigInt(1_000_000);

      const addOnsPayload: AddOn[] = selectedAddOns.map(a => ({
        name: a.name,
        dailyCostUSD: a.dailyCostUSD,
      }));

      const booking = await bookCar.mutateAsync({
        carId,
        startDate: startMs,
        endDate: endMs,
        addOns: addOnsPayload,
      });

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const session = await createCheckout.mutateAsync({
        items: [{
          productName: car.name,
          currency: 'usd',
          quantity: BigInt(1),
          priceInCents: BigInt(Math.round(total * 100)),
          productDescription: `Car rental: ${startDate} to ${endDate}`,
        }],
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failure`,
      });

      if (!session?.url) throw new Error('Stripe session missing url');
      window.location.href = session.url;
    } catch (err: unknown) {
      const error = err as Error;
      setBookingError(error.message || 'Booking failed. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <LogIn className="w-16 h-16 text-gold mx-auto mb-6" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-3">{t('booking.loginRequired')}</h2>
        <p className="text-muted-foreground mb-8">You need to be logged in to complete a booking.</p>
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          className="bg-gold text-charcoal hover:bg-gold-light font-bold px-8"
        >
          {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
          {t('booking.login')}
        </Button>
      </div>
    );
  }

  if (carLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!car || !carId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No car selected. Please go back and select a car.</p>
        <Button onClick={() => navigate({ to: '/cars' })} className="mt-4 bg-gold text-charcoal">
          Browse Fleet
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl animate-fade-in">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{t('booking.title')}</h1>
      <div className="w-16 h-0.5 bg-gold mb-8" />

      <BookingStepIndicator currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Rental Details */}
          <section className="luxury-card p-6">
            <h2 className="font-serif font-bold text-lg text-gold mb-4">
              1. {t('booking.step1')}
            </h2>
            <div className="flex items-center gap-4">
              <img
                src={car.imageUrls[0] || '/assets/generated/car-placeholder.dim_600x400.png'}
                alt={car.name}
                className="w-24 h-16 object-cover rounded"
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/generated/car-placeholder.dim_600x400.png'; }}
              />
              <div>
                <p className="font-bold text-foreground">{car.name}</p>
                <p className="text-sm text-muted-foreground">${car.dailyRateUSD}/day</p>
                <p className="text-sm text-muted-foreground">
                  {startDate} → {endDate} ({days} days)
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: Add-ons */}
          <section className="luxury-card p-6">
            <h2 className="font-serif font-bold text-lg text-gold mb-4">
              2. {t('booking.step2')}
            </h2>
            <AddOnsSelector addOns={addOns} onChange={setAddOns} />
          </section>

          {/* Step 3: Customer Info */}
          <section className="luxury-card p-6">
            <h2 className="font-serif font-bold text-lg text-gold mb-4">
              3. {t('booking.step3')}
            </h2>
            <CustomerInfoForm
              data={customerInfo}
              onChange={setCustomerInfo}
              errors={customerErrors}
            />
          </section>

          {/* Step 4: Payment */}
          <section className="luxury-card p-6">
            <h2 className="font-serif font-bold text-lg text-gold mb-4">
              4. {t('booking.step4')}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Secure payment powered by Stripe. You will be redirected to complete payment.
            </p>

            {bookingError && (
              <div className="flex items-center gap-2 text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded border border-destructive/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {bookingError}
              </div>
            )}

            <Button
              onClick={handleProceedToPayment}
              disabled={bookCar.isPending || createCheckout.isPending || days === 0}
              className="w-full bg-gold text-charcoal hover:bg-gold-light font-bold text-base py-3 h-auto"
            >
              {(bookCar.isPending || createCheckout.isPending)
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                : `${t('booking.proceed')} — $${total.toFixed(2)}`
              }
            </Button>
          </section>
        </div>

        {/* Summary sidebar */}
        <div className="luxury-card p-5 h-fit space-y-3">
          <h3 className="font-semibold text-foreground">{t('booking.summary')}</h3>
          <Separator className="bg-border" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('booking.baseCost')}</span>
              <span>${baseCost.toFixed(2)}</span>
            </div>
            {addOnsCost > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('booking.addonsCost')}</span>
                <span>${addOnsCost.toFixed(2)}</span>
              </div>
            )}
            {earlyDiscount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>{t('booking.earlyPayment')}</span>
                <span>-${earlyDiscount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="bg-border" />
            <div className="flex justify-between font-bold text-base">
              <span>{t('booking.total')}</span>
              <span className="text-gold">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

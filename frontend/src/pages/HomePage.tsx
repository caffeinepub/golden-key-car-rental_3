import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetAvailableCars } from '../hooks/useQueries';
import CarListingCard from '../components/CarListingCard';
import { Button } from '@/components/ui/button';
import { ChevronRight, Shield, Clock, Star, MapPin } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: cars = [], isLoading } = useGetAvailableCars();

  const featuredCars = cars.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-banner.dim_1400x600.png"
            alt="Golden Key Car Rental"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/70 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-3.5 h-3.5 text-gold fill-gold" />
              <span className="text-sm text-gold font-medium">Premium Car Rental UAE</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate({ to: '/cars' })}
                className="bg-gold text-charcoal hover:bg-gold-light font-bold text-base px-8 py-3 h-auto"
              >
                {t('hero.cta')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                onClick={() => navigate({ to: '/cars' })}
                variant="outline"
                className="border-gold/50 text-gold hover:bg-gold/10 font-semibold text-base px-8 py-3 h-auto"
              >
                {t('hero.cta2')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-charcoal-light/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-8 h-8 text-gold" />, title: 'Fully Insured', desc: 'All vehicles come with comprehensive insurance coverage' },
              { icon: <Clock className="w-8 h-8 text-gold" />, title: '24/7 Support', desc: 'Round-the-clock customer support via WhatsApp' },
              { icon: <MapPin className="w-8 h-8 text-gold" />, title: 'UAE Wide', desc: 'Pickup and delivery across all UAE emirates' },
            ].map((feature, i) => (
              <div key={i} className="luxury-card p-6 text-center hover:border-gold/40 transition-all">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">{t('cars.title')}</h2>
              <div className="w-16 h-0.5 bg-gold" />
            </div>
            <Button
              onClick={() => navigate({ to: '/cars' })}
              variant="ghost"
              className="text-gold hover:text-gold-light"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="luxury-card h-72 animate-pulse bg-secondary" />
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCars.map(car => (
                <CarListingCard key={car.id.toString()} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No cars available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-charcoal-light/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Ready to Drive in Luxury?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Browse our premium fleet and book your perfect vehicle today. Competitive rates, exceptional service.
          </p>
          <Button
            onClick={() => navigate({ to: '/cars' })}
            className="bg-gold text-charcoal hover:bg-gold-light font-bold text-base px-10 py-3 h-auto"
          >
            Browse Our Fleet
          </Button>
        </div>
      </section>
    </div>
  );
}

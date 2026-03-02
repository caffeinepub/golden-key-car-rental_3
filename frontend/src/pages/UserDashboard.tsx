import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetMyBookings } from '../hooks/useQueries';
import { Booking } from '../backend';
import ProfileSection from '../components/ProfileSection';
import BookingHistoryList from '../components/BookingHistoryList';
import InvoiceView from '../components/InvoiceView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, User, Calendar, FileText } from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: bookings = [], isLoading: bookingsLoading } = useGetMyBookings();
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <LogIn className="w-16 h-16 text-gold mx-auto mb-6" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Login Required</h2>
        <p className="text-muted-foreground mb-8">Please login to access your dashboard.</p>
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          className="bg-gold text-charcoal hover:bg-gold-light font-bold px-8"
        >
          {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
          {t('nav.login')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src="/assets/generated/logo.dim_320x100.png"
          alt="Golden Key"
          className="h-10 w-auto object-contain hidden sm:block"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          {profile?.name && (
            <p className="text-muted-foreground">Welcome back, <span className="text-gold font-semibold">{profile.name}</span></p>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-secondary border border-border mb-6">
          <TabsTrigger value="profile" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-2">
            <User className="w-4 h-4" />{t('dashboard.profile')}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-2">
            <Calendar className="w-4 h-4" />{t('dashboard.bookings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="bookings">
          {bookingsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('common.loading')}
            </div>
          ) : (
            <BookingHistoryList
              bookings={bookings}
              onViewInvoice={(booking) => setSelectedInvoice(booking)}
            />
          )}
        </TabsContent>
      </Tabs>

      {selectedInvoice && (
        <InvoiceView
          booking={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

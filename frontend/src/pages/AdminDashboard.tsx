import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import CarManagementTable from '../components/admin/CarManagementTable';
import BookingManagementTable from '../components/admin/BookingManagementTable';
import UserManagementTable from '../components/admin/UserManagementTable';
import PromotionsManagementPanel from '../components/admin/PromotionsManagementPanel';
import RevenueReportPanel from '../components/admin/RevenueReportPanel';
import StripeConfigPanel from '../components/admin/StripeConfigPanel';
import BlogManagementPanel from '../components/admin/BlogManagementPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, Car, Calendar, Users, Tag, BarChart2, CreditCard, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <LogIn className="w-16 h-16 text-gold mx-auto mb-6" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Admin Login Required</h2>
        <p className="text-muted-foreground mb-8">Please login to access the admin dashboard.</p>
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

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <img
          src="/assets/generated/logo.dim_320x100.png"
          alt="Golden Key"
          className="h-10 w-auto object-contain hidden sm:block"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">{t('admin.title')}</h1>
          <p className="text-muted-foreground text-sm">Manage your car rental platform</p>
        </div>
      </div>

      <Tabs defaultValue="cars">
        <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="cars" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-1.5 text-xs">
            <Car className="w-3.5 h-3.5" />{t('admin.cars')}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5" />{t('admin.bookings')}
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" />{t('admin.users')}
          </TabsTrigger>
          <TabsTrigger value="promotions" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-1.5 text-xs">
            <Tag className="w-3.5 h-3.5" />{t('admin.promotions')}
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-1.5 text-xs">
            <BarChart2 className="w-3.5 h-3.5" />{t('admin.revenue')}
          </TabsTrigger>
          <TabsTrigger value="stripe" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-1.5 text-xs">
            <CreditCard className="w-3.5 h-3.5" />{t('admin.stripe')}
          </TabsTrigger>
          <TabsTrigger value="blog" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal gap-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5" />{t('admin.blog')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cars"><CarManagementTable /></TabsContent>
        <TabsContent value="bookings"><BookingManagementTable /></TabsContent>
        <TabsContent value="users"><UserManagementTable /></TabsContent>
        <TabsContent value="promotions"><PromotionsManagementPanel /></TabsContent>
        <TabsContent value="revenue"><RevenueReportPanel /></TabsContent>
        <TabsContent value="stripe"><StripeConfigPanel /></TabsContent>
        <TabsContent value="blog"><BlogManagementPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

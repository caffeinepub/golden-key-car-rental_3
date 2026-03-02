import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGetRevenue, useGetAvailableCars } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, TrendingUp, DollarSign } from 'lucide-react';

export default function RevenueReportPanel() {
  const { t } = useLanguage();
  const { totalRevenue, revenuePerCar } = useGetRevenue();
  const { data: cars = [] } = useGetAvailableCars();

  const isLoading = totalRevenue.isLoading || revenuePerCar.isLoading;

  const getCarName = (carId: bigint) => {
    const car = cars.find(c => c.id === carId);
    return car?.name || `Car #${carId}`;
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground py-8"><Loader2 className="w-5 h-5 animate-spin" />{t('common.loading')}</div>;
  }

  const revenueData = revenuePerCar.data || [];
  const total = totalRevenue.data || 0;

  return (
    <div className="space-y-6">
      <h2 className="font-serif font-bold text-xl text-foreground">{t('admin.revenue')}</h2>

      {/* Total Revenue Card */}
      <div className="luxury-card p-6 border-gold/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-gold" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">{t('admin.totalRevenue')}</p>
            <p className="text-4xl font-bold text-gold">${total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">From completed bookings</p>
          </div>
        </div>
      </div>

      {/* Per-car breakdown */}
      {revenueData.length > 0 && (
        <div className="luxury-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" />
            <h3 className="font-semibold text-foreground">Revenue by Vehicle</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Vehicle</TableHead>
                <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                <TableHead className="text-muted-foreground text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueData.sort((a, b) => b[1] - a[1]).map(([carId, revenue]) => (
                <TableRow key={carId.toString()} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-medium">{getCarName(carId)}</TableCell>
                  <TableCell className="text-right text-gold font-semibold">${revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {total > 0 ? ((revenue / total) * 100).toFixed(1) : '0'}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {revenueData.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No revenue data yet. Complete some bookings to see reports.</p>
        </div>
      )}
    </div>
  );
}

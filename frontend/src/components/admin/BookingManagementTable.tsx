import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGetAllBookings, useSetBookingStatus } from '../../hooks/useQueries';
import { BookingStatus } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.pending: return 'text-yellow-400';
    case BookingStatus.confirmed: return 'text-blue-400';
    case BookingStatus.cancelled: return 'text-destructive';
    case BookingStatus.completed: return 'text-green-400';
    default: return 'text-muted-foreground';
  }
}

export default function BookingManagementTable() {
  const { t } = useLanguage();
  const { data: bookings = [], isLoading } = useGetAllBookings();
  const setStatus = useSetBookingStatus();
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, BookingStatus>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    setPendingStatuses(prev => ({ ...prev, [bookingId]: status }));
  };

  const handleSave = async (bookingId: bigint) => {
    const key = bookingId.toString();
    const newStatus = pendingStatuses[key];
    if (!newStatus) return;
    setSavingId(key);
    try {
      await setStatus.mutateAsync({ bookingId, status: newStatus });
      setPendingStatuses(prev => { const n = { ...prev }; delete n[key]; return n; });
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground py-8"><Loader2 className="w-5 h-5 animate-spin" />{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif font-bold text-xl text-foreground">{t('admin.bookings')}</h2>
      <div className="luxury-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Car ID</TableHead>
              <TableHead className="text-muted-foreground">User</TableHead>
              <TableHead className="text-muted-foreground">Dates</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map(booking => {
              const key = booking.id.toString();
              const currentStatus = pendingStatuses[key] || booking.status;
              const isDirty = !!pendingStatuses[key];
              return (
                <TableRow key={key} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-mono text-xs">#{key}</TableCell>
                  <TableCell>#{booking.carId.toString()}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[100px] truncate">{booking.user.toString().slice(0, 12)}...</TableCell>
                  <TableCell className="text-xs">
                    {new Date(Number(booking.startDate) / 1_000_000).toLocaleDateString()} →{' '}
                    {new Date(Number(booking.endDate) / 1_000_000).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gold font-semibold">${booking.totalAmountUSD.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select value={currentStatus} onValueChange={v => handleStatusChange(key, v as BookingStatus)}>
                      <SelectTrigger className={`w-32 bg-secondary border-border h-7 text-xs ${getStatusColor(currentStatus)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BookingStatus.pending}>Pending</SelectItem>
                        <SelectItem value={BookingStatus.confirmed}>Confirmed</SelectItem>
                        <SelectItem value={BookingStatus.completed}>Completed</SelectItem>
                        <SelectItem value={BookingStatus.cancelled}>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {isDirty && (
                      <Button size="sm" onClick={() => handleSave(booking.id)} disabled={savingId === key} className="h-7 bg-gold text-charcoal hover:bg-gold-light text-xs">
                        {savingId === key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {bookings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No bookings found.</div>
        )}
      </div>
    </div>
  );
}

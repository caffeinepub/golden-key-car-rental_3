import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Booking, BookingStatus } from '../backend';
import { useCancelBooking } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Loader2, FileText, XCircle } from 'lucide-react';

interface BookingHistoryListProps {
  bookings: Booking[];
  onViewInvoice: (booking: Booking) => void;
}

function getStatusBadge(status: BookingStatus) {
  switch (status) {
    case BookingStatus.pending: return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case BookingStatus.confirmed: return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case BookingStatus.cancelled: return 'bg-destructive/20 text-destructive border-destructive/30';
    case BookingStatus.completed: return 'bg-green-600/20 text-green-400 border-green-600/30';
    default: return 'bg-secondary text-muted-foreground';
  }
}

function getStatusLabel(status: BookingStatus, t: (k: string) => string) {
  switch (status) {
    case BookingStatus.pending: return t('dashboard.status.pending');
    case BookingStatus.confirmed: return t('dashboard.status.confirmed');
    case BookingStatus.cancelled: return t('dashboard.status.cancelled');
    case BookingStatus.completed: return t('dashboard.status.completed');
    default: return String(status);
  }
}

export default function BookingHistoryList({ bookings, onViewInvoice }: BookingHistoryListProps) {
  const { t } = useLanguage();
  const cancelBooking = useCancelBooking();
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);

  const handleCancel = async (bookingId: bigint) => {
    setCancellingId(bookingId);
    try {
      await cancelBooking.mutateAsync(bookingId);
    } finally {
      setCancellingId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>{t('dashboard.noBookings')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map(booking => (
        <div key={booking.id.toString()} className="luxury-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Booking #{booking.id.toString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(booking.status)}`}>
                  {getStatusLabel(booking.status, t)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(Number(booking.startDate) / 1_000_000).toLocaleDateString()} →{' '}
                {new Date(Number(booking.endDate) / 1_000_000).toLocaleDateString()}
              </p>
              {booking.addOns.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add-ons: {booking.addOns.map(a => a.name).join(', ')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gold">${booking.totalAmountUSD.toFixed(2)}</span>

              {booking.status === BookingStatus.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewInvoice(booking)}
                  className="border-gold/40 text-gold hover:bg-gold/10 h-8"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  {t('dashboard.downloadInvoice')}
                </Button>
              )}

              {(booking.status === BookingStatus.pending || booking.status === BookingStatus.confirmed) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 h-8"
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <XCircle className="w-3.5 h-3.5 mr-1" />
                      }
                      {t('dashboard.cancelBooking')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancel(booking.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Cancel Booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

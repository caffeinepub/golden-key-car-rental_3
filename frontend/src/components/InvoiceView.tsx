import React from 'react';
import { Booking } from '../backend';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface InvoiceViewProps {
  booking: Booking;
  onClose: () => void;
}

export default function InvoiceView({ booking, onClose }: InvoiceViewProps) {
  const startDate = new Date(Number(booking.startDate) / 1_000_000).toLocaleDateString();
  const endDate = new Date(Number(booking.endDate) / 1_000_000).toLocaleDateString();
  const days = Math.ceil((Number(booking.endDate) - Number(booking.startDate)) / (1_000_000 * 1000 * 60 * 60 * 24));

  const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - Booking #${booking.id}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #C9A84C; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #C9A84C; }
    .invoice-title { font-size: 18px; color: #666; margin-top: 5px; }
    .section { margin-bottom: 20px; }
    .section h3 { color: #C9A84C; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; }
    .total { font-size: 18px; font-weight: bold; color: #C9A84C; border-top: 2px solid #C9A84C; padding-top: 10px; }
    .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🔑 Golden Key Car Rental L.L.C</div>
    <div class="invoice-title">INVOICE</div>
    <div>Booking #${booking.id} | ${new Date().toLocaleDateString()}</div>
  </div>
  <div class="section">
    <h3>Booking Details</h3>
    <div class="row"><span>Car ID:</span><span>#${booking.carId}</span></div>
    <div class="row"><span>Pickup Date:</span><span>${startDate}</span></div>
    <div class="row"><span>Return Date:</span><span>${endDate}</span></div>
    <div class="row"><span>Duration:</span><span>${days} days</span></div>
    <div class="row"><span>Status:</span><span>${String(booking.status)}</span></div>
  </div>
  ${booking.addOns.length > 0 ? `
  <div class="section">
    <h3>Add-ons</h3>
    ${booking.addOns.map(a => `<div class="row"><span>${a.name}</span><span>$${a.dailyCostUSD}/day</span></div>`).join('')}
  </div>` : ''}
  <div class="section">
    <h3>Payment</h3>
    <div class="row"><span>Payment Method:</span><span>Stripe</span></div>
    <div class="row total"><span>Total Amount:</span><span>$${booking.totalAmountUSD.toFixed(2)}</span></div>
  </div>
  <div class="footer">
    <p>Thank you for choosing Golden Key Car Rental L.L.C</p>
    <p>For support, contact us via WhatsApp: +971 50 123 4567</p>
  </div>
</body>
</html>`;

  const handleDownload = () => {
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-booking-${booking.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="luxury-card w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-gold">Invoice #{booking.id.toString()}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Car ID:</span><span>#{booking.carId.toString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pickup:</span><span>{startDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Return:</span><span>{endDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span><span>{days} days</span></div>
            {booking.addOns.map((a, i) => (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span>{a.name}</span><span>+${a.dailyCostUSD}/day</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span><span className="text-gold">${booking.totalAmountUSD.toFixed(2)}</span>
            </div>
          </div>
          <Button onClick={handleDownload} className="w-full bg-gold text-charcoal hover:bg-gold-light font-semibold">
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

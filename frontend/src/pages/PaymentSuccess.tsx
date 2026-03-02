import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center animate-fade-in">
      <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
      <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Payment Successful!</h1>
      <p className="text-muted-foreground mb-8">
        Your booking has been confirmed. You will receive a confirmation shortly.
        Thank you for choosing Golden Key Car Rental!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => navigate({ to: '/dashboard' })}
          className="bg-gold text-charcoal hover:bg-gold-light font-semibold"
        >
          View My Bookings
        </Button>
        <Button
          onClick={() => navigate({ to: '/' })}
          variant="outline"
          className="border-border hover:border-gold/40"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}

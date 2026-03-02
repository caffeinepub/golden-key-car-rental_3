import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center animate-fade-in">
      <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
      <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Payment Failed</h1>
      <p className="text-muted-foreground mb-8">
        Your payment was not completed. No charges have been made.
        Please try again or contact us via WhatsApp for assistance.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => navigate({ to: '/cars' })}
          className="bg-gold text-charcoal hover:bg-gold-light font-semibold"
        >
          Try Again
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

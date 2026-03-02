import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useValidatePromoCode } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PromoCodeInputProps {
  onDiscountApplied: (percentage: number) => void;
  disabled?: boolean;
}

export default function PromoCodeInput({ onDiscountApplied, disabled }: PromoCodeInputProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [appliedCode, setAppliedCode] = useState('');
  const validatePromo = useValidatePromoCode();

  const handleApply = async () => {
    if (!code.trim()) return;
    try {
      const result = await validatePromo.mutateAsync(code.trim().toUpperCase());
      if (result) {
        setStatus('success');
        setAppliedCode(code.trim().toUpperCase());
        onDiscountApplied(Number(result.percentage));
      } else {
        setStatus('error');
        onDiscountApplied(0);
      }
    } catch {
      setStatus('error');
      onDiscountApplied(0);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder={t('pricing.promoCode')}
          value={code}
          onChange={e => { setCode(e.target.value); setStatus('idle'); }}
          className="bg-secondary border-border uppercase"
          disabled={disabled || status === 'success'}
        />
        <Button
          onClick={handleApply}
          disabled={disabled || !code.trim() || validatePromo.isPending || status === 'success'}
          className="bg-gold text-charcoal hover:bg-gold-light font-semibold shrink-0"
          size="sm"
        >
          {validatePromo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('pricing.apply')}
        </Button>
      </div>
      {status === 'success' && (
        <p className="text-sm text-green-400 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          {t('pricing.promoApplied')} ({appliedCode})
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          {t('pricing.promoInvalid')}
        </p>
      )}
    </div>
  );
}

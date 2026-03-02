import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';

const COMMON_COUNTRIES = ['US', 'GB', 'AE', 'SA', 'DE', 'FR', 'CA', 'AU', 'JP', 'SG'];

export default function StripeConfigPanel() {
  const { t } = useLanguage();
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US', 'AE', 'GB']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const handleSave = async () => {
    if (!secretKey.trim()) { setError('Stripe secret key is required'); return; }
    if (selectedCountries.length === 0) { setError('Select at least one country'); return; }
    setError('');
    try {
      await setConfig.mutateAsync({ secretKey: secretKey.trim(), allowedCountries: selectedCountries });
      setSuccess(true);
      setSecretKey('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save Stripe configuration');
    }
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground py-8"><Loader2 className="w-5 h-5 animate-spin" />{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-serif font-bold text-xl text-foreground">{t('admin.stripe')}</h2>

      {isConfigured && !success ? (
        <div className="luxury-card p-5 flex items-center gap-3 border-green-600/30">
          <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Stripe is configured</p>
            <p className="text-sm text-muted-foreground">Payment processing is active. You can update the configuration below.</p>
          </div>
        </div>
      ) : success ? (
        <div className="luxury-card p-5 flex items-center gap-3 border-green-600/30">
          <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
          <p className="font-semibold text-green-400">Stripe configuration saved successfully!</p>
        </div>
      ) : (
        <div className="luxury-card p-5 flex items-center gap-3 border-yellow-600/30">
          <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Stripe not configured</p>
            <p className="text-sm text-muted-foreground">Configure Stripe to enable payment processing.</p>
          </div>
        </div>
      )}

      <div className="luxury-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-gold font-semibold">
          <CreditCard className="w-4 h-4" />
          <span>Stripe Configuration</span>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">Stripe Secret Key *</Label>
          <Input
            type="password"
            value={secretKey}
            onChange={e => setSecretKey(e.target.value)}
            placeholder="sk_live_..."
            className="bg-secondary border-border font-mono"
          />
          <p className="text-xs text-muted-foreground">Your Stripe secret key from the Stripe Dashboard.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Allowed Countries</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_COUNTRIES.map(country => (
              <button
                key={country}
                onClick={() => toggleCountry(country)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedCountries.includes(country)
                    ? 'bg-gold/20 border-gold text-gold'
                    : 'bg-secondary border-border text-muted-foreground hover:border-gold/40'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />{error}
          </p>
        )}

        <Button onClick={handleSave} disabled={setConfig.isPending} className="bg-gold text-charcoal hover:bg-gold-light font-semibold w-full">
          {setConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
          Save Stripe Configuration
        </Button>
      </div>
    </div>
  );
}

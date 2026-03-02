import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <ShieldX className="w-16 h-16 text-destructive mb-6" />
      <h1 className="font-serif text-3xl font-bold text-foreground mb-3">{t('common.accessDenied')}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{t('common.accessDeniedMsg')}</p>
      <Button
        onClick={() => navigate({ to: '/' })}
        className="bg-gold text-charcoal hover:bg-gold-light font-semibold"
      >
        {t('common.goHome')}
      </Button>
    </div>
  );
}

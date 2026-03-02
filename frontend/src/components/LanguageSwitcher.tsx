import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="font-semibold text-sm border border-gold/40 hover:border-gold hover:text-gold transition-all px-3 py-1 h-8"
    >
      {language === 'en' ? 'عربي' : 'EN'}
    </Button>
  );
}

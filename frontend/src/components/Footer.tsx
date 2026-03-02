import React from 'react';
import { Link } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Key, Heart } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'golden-key-car-rental');

  return (
    <footer className="bg-charcoal border-t border-gold/20 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-6 h-6 text-gold" />
              <span className="font-serif font-bold text-xl text-gold">Golden Key Car Rental</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Premium car rental experience in the UAE. Drive in luxury with our curated fleet of exceptional vehicles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/cars" className="text-sm text-muted-foreground hover:text-gold transition-colors">{t('footer.fleet')}</Link></li>
              <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-gold transition-colors">{t('footer.blog')}</Link></li>
              <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-gold transition-colors">{t('nav.dashboard')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gold mb-4 text-sm uppercase tracking-wider">{t('footer.contact')}</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://wa.me/971501234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-gold transition-colors flex items-center gap-2"
                >
                  <span className="w-4 h-4 text-green-500">📱</span>
                  {t('footer.whatsapp')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} Golden Key Car Rental L.L.C. {t('footer.rights')}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-gold fill-gold" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

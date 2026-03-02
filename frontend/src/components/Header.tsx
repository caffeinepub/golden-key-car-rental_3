import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Menu, X, Key } from 'lucide-react';

export default function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/cars', label: t('nav.cars') },
    { to: '/blog', label: t('nav.blog') },
    ...(isAuthenticated ? [{ to: '/dashboard', label: t('nav.dashboard') }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-charcoal/95 backdrop-blur-sm border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/assets/generated/logo.dim_320x100.png"
              alt="Golden Key Car Rental"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden items-center gap-2">
              <Key className="w-6 h-6 text-gold" />
              <span className="font-serif font-bold text-lg text-gold">Golden Key</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  isActive(link.to)
                    ? 'text-gold'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              className={isAuthenticated
                ? 'bg-secondary text-foreground hover:bg-secondary/80'
                : 'bg-gold text-charcoal hover:bg-gold-light font-semibold'
              }
            >
              {isLoggingIn ? t('common.loading') : isAuthenticated ? t('nav.logout') : t('nav.login')}
            </Button>
            {!isAuthenticated && (
              <Button
                onClick={() => navigate({ to: '/cars' })}
                size="sm"
                variant="outline"
                className="border-gold/50 text-gold hover:bg-gold/10"
              >
                {t('nav.booking')}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-2 text-sm font-medium hover:text-gold transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-4 pt-2">
              <LanguageSwitcher />
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                size="sm"
                className="bg-gold text-charcoal hover:bg-gold-light font-semibold"
              >
                {isLoggingIn ? t('common.loading') : isAuthenticated ? t('nav.logout') : t('nav.login')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

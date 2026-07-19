'use client';

import { LanguageProvider } from '@/lib/i18n/context';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import StandardsSection from '@/components/home/StandardsSection';
import ManufacturersSection from '@/components/home/ManufacturersSection';
import {
  Sun,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';

function Header() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/calculator', label: t('nav.calculator') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sun className="w-5 h-5 text-gray-950" />
            </div>
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">
              Solar PV Engineer
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.1] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <Link
              href="/calculator"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
            >
              {t('home.hero.cta')}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-gray-950/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/calculator"
              className="block px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 text-sm font-semibold text-center mt-2"
              onClick={() => setMobileOpen(false)}
            >
              {t('home.hero.cta')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative py-12 bg-gray-950 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
              <Sun className="w-4 h-4 text-gray-950" />
            </div>
            <span className="text-sm font-bold text-white">Solar PV Engineer</span>
          </div>
          <p className="text-xs text-gray-600">
            Professional solar photovoltaic system design and engineering tool
          </p>
          <div className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Solar PV Engineer
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <div
      dir="ltr"
      className="min-h-screen bg-gray-950 text-white font-sans antialiased"
    >
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <StandardsSection />
        <ManufacturersSection />
      </main>
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  );
}

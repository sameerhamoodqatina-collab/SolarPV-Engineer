'use client';

import { Zap, ExternalLink, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

const quickLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/calculator', labelKey: 'nav.calculator' },
  { href: '/standards', labelKey: 'nav.about' },
  { href: '/manufacturers', labelKey: 'nav.projects' },
];

const standards = [
  { name: 'IEC 61215', url: '#' },
  { name: 'IEC 61730', url: '#' },
  { name: 'NEC 690', url: '#' },
  { name: 'UL 1741', url: '#' },
  { name: 'IEEE 1547', url: '#' },
];

const socialLinks = [
  { icon: ExternalLink, href: '#', label: 'GitHub' },
  { icon: ExternalLink, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
];

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-solar-sky to-solar-sun shadow-md shadow-solar-sky/20">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold gradient-text-solar">SolarPV Engineer</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Professional solar photovoltaic system design and engineering tool
              for residential, commercial, and industrial applications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              {t('nav.home')}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-text-muted hover:text-solar-sky transition-colors"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Standards */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              {t('home.standards.title')}
            </h4>
            <ul className="space-y-2.5">
              {standards.map((std) => (
                <li key={std.name}>
                  <a
                    href={std.url}
                    className="text-sm text-text-muted hover:text-solar-sky transition-colors inline-flex items-center gap-1"
                  >
                    {std.name}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-alt text-text-muted hover:text-solar-sky hover:bg-solar-sky/10 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            &copy; {year} SolarPV Engineer. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Designed for professional solar engineers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}

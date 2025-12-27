"use client";

import { Locale, locales, Messages } from "@/lib/i18n";

interface NavbarProps {
  locale: Locale;
  messages: Messages;
}

export default function Navbar({ locale, messages }: NavbarProps) {
  const { nav } = messages;

  return (
    <nav className="navbar">
      <div className="glass-nav navbar-inner">
        <a href={`/${locale}`} className="navbar-logo">
          <span className="navbar-logo-icon">M</span>
          MedDiscover
        </a>

        <div className="navbar-menu">
          <a href={`/${locale}#treatments`} className="navbar-link">{nav.treatments}</a>
          <a href={`/${locale}#clinics`} className="navbar-link">{nav.clinics}</a>
          <a href={`/${locale}#flights`} className="navbar-link">{nav.flights}</a>
          <a href={`/${locale}#contact`} className="navbar-link">{nav.contact}</a>
        </div>

        <div className="navbar-actions">
          <select
            className="lang-select"
            defaultValue={locale.toUpperCase()}
            onChange={(e) => {
              const newLocale = e.target.value.toLowerCase();
              window.location.href = `/${newLocale}`;
            }}
          >
            {locales.map((l) => (
              <option key={l} value={l.toUpperCase()}>{l.toUpperCase()}</option>
            ))}
          </select>
          <a href={`/${locale}/apply`} className="btn-outline">{nav.getStarted}</a>
        </div>
      </div>
    </nav>
  );
}

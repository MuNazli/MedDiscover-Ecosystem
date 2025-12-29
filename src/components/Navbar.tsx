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
          <a href={`/${locale}#steps`} className="navbar-link">{nav.steps}</a>
          <a href={`/${locale}#verified`} className="navbar-link">{nav.verified}</a>
          <a href={`/${locale}#faq`} className="navbar-link">{nav.faq}</a>
          <a href={`/${locale}#lead`} className="navbar-link">{nav.leadCta}</a>
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
          <a href={`/${locale}#lead`} className="btn-outline">{nav.getStarted}</a>
        </div>
      </div>
    </nav>
  );
}

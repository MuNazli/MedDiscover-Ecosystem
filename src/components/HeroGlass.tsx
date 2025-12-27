import { FeaturedClinic, BADGE_STYLES } from "@/lib/placeholderData";
import { Locale, Messages } from "@/lib/i18n";
import Navbar from "./Navbar";

interface HeroGlassProps {
  locale: Locale;
  messages: Messages;
  featuredClinic: FeaturedClinic;
}

/**
 * HeroGlass Component
 * TODO: Replace placeholder data with real partner clinic data from API
 */
export default function HeroGlass({ locale, messages, featuredClinic }: HeroGlassProps) {
  const { hero, featuredClinic: clinicLabels } = messages;

  return (
    <div className="hero-section">
      {/* Navbar */}
      <Navbar locale={locale} messages={messages} />

      {/* Hero Content */}
      <div className="hero-content container">
        <div className="hero-grid">
          {/* Left: Text */}
          <div className="hero-text">
            <h1>
              {hero.title}
              <br />
              <span className="text-gradient">{hero.titleAccent}</span>
            </h1>
            <p>{hero.subtitle}</p>
            <a href={`/${locale}/apply`} className="btn-primary">
              {hero.ctaPrimary}
            </a>
          </div>

          {/* Right: Featured Clinic Card */}
          {/* TODO: Replace with real partner clinic data */}
          <div className="glass-card clinic-card">
            <div className="clinic-card-label">{clinicLabels.label}</div>
            <div className="clinic-card-header">
              <div className="clinic-avatar">{featuredClinic.shortName}</div>
              <div className="clinic-info">
                <h3 className="clinic-name">{featuredClinic.name}</h3>
                <span className="clinic-location">
                  📍 {featuredClinic.location}, {featuredClinic.country}
                </span>
              </div>
            </div>
            
            <div className="clinic-badges">
              {featuredClinic.badges.map((badge) => (
                <span
                  key={badge}
                  className={`badge ${BADGE_STYLES[badge] === "gold" ? "badge-gold" : ""}`}
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="clinic-rating">
              <span className="rating-stars">★★★★★</span>
              <span className="rating-value">{featuredClinic.rating}</span>
              <span className="rating-count">({featuredClinic.reviewCount} {clinicLabels.reviews})</span>
            </div>
            
            <div className="clinic-note">{clinicLabels.note}</div>
          </div>
        </div>
      </div>

    </div>
  );
}

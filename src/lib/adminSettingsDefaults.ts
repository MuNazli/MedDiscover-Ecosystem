/**
 * MedDiscover CMS - Default Settings
 * These defaults are used when no saved settings exist
 */

export interface I18nField {
  tr: string;
  de: string;
  en: string;
}

export interface HeroSettings {
  title: I18nField;
  subtitle: I18nField;
  ctaLabel: I18nField;
  ctaUrl: string;
  backgroundImage: string;
  overlayOpacity: number;
}

export interface TrustStatItem {
  id: string;
  label: I18nField;
  value: string;
  icon?: string;
  active: boolean;
}

export interface TrustSettings {
  stats: TrustStatItem[];
}

export interface SectionHeading {
  id: string;
  enabled: boolean;
  order: number;
  title: I18nField;
  subtitle: I18nField;
}

export interface CTAItem {
  id: string;
  label: I18nField;
  url: string;
  visible: boolean;
}

export interface BannerSettings {
  enabled: boolean;
  startDate: string;
  endDate: string;
  content: I18nField;
}

export interface SEOSettings {
  metaTitle: I18nField;
  metaDescription: I18nField;
  ogTitle: I18nField;
  ogDescription: I18nField;
  ogImageUrl: string;
  canonicalBaseUrl: string;
  indexing: "index" | "noindex";
}

export interface FooterSettings {
  companyText: I18nField;
  imprintText: I18nField;
  privacyUrl: string;
  termsUrl: string;
  imprintUrl: string;
}

export interface LocaleSettings {
  defaultLocale: "tr" | "de" | "en";
  localeOrder: ("tr" | "de" | "en")[];
  fallbackLocale: "tr" | "de" | "en";
}

export interface FeaturedClinicItem {
  id: string;
  name: I18nField;
  city: I18nField;
  country: I18nField;
  specialty: I18nField;
  shortDescription: I18nField;
  imageUrl: string;
  ctaLabel: I18nField;
  ctaUrl: string;
  active: boolean;
}

export interface AdminSettings {
  hero: HeroSettings;
  trust: TrustSettings;
  sectionHeadings: SectionHeading[];
  ctas: CTAItem[];
  banner: BannerSettings;
  seo: SEOSettings;
  footer: FooterSettings;
  locale: LocaleSettings;
  featuredClinics: FeaturedClinicItem[];
  _version: number;
  _lastSaved: string | null;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  hero: {
    title: {
      tr: "Kaliteli Sağlık Hizmetleri,",
      de: "Premium-Gesundheitsversorgung,",
      en: "Quality Healthcare,",
    },
    subtitle: {
      tr: "MedDiscover, sizi güvenilir ve uluslararası standartlara sahip kliniklerle buluşturur.",
      de: "Wir verbinden Patientinnen und Patienten mit geprüften internationalen Kliniken.",
      en: "We help you access trusted clinics and guide you through your treatment journey.",
    },
    ctaLabel: {
      tr: "Başvurumu Başlat →",
      de: "Antrag starten →",
      en: "Start Your Application →",
    },
    ctaUrl: "/apply",
    backgroundImage: "/images/meddiscover-modern-hospital-corridor-medical-tourism.webp",
    overlayOpacity: 50,
  },

  trust: {
    stats: [
      {
        id: "verified-clinics",
        label: {
          de: "GeprǬfte Kliniken",
          en: "Verified Clinics",
          tr: "Onayli Klinikler",
        },
        value: "120+",
        icon: "check",
        active: true,
      },
      {
        id: "countries",
        label: {
          de: "L��nder",
          en: "Countries",
          tr: "Ulkeler",
        },
        value: "15",
        icon: "globe",
        active: true,
      },
      {
        id: "patients",
        label: {
          de: "Begleitete Patient:innen",
          en: "Supported Patients",
          tr: "Desteklenen Hastalar",
        },
        value: "8.000+",
        icon: "users",
        active: true,
      },
      {
        id: "gdpr",
        label: {
          de: "DSGVO",
          en: "GDPR",
          tr: "KVKK",
        },
        value: "Datenschutz & Sicherheit",
        icon: "lock",
        active: true,
      },
    ],
  },

  sectionHeadings: [
    {
      id: "treatments",
      enabled: true,
      order: 1,
      title: {
        tr: "Tedaviler",
        de: "Behandlungen",
        en: "Treatments",
      },
      subtitle: {
        tr: "Sunduğumuz tedavi seçenekleri",
        de: "Unsere Behandlungsoptionen",
        en: "Our treatment options",
      },
    },
    {
      id: "clinics",
      enabled: true,
      order: 2,
      title: {
        tr: "Partner Klinikler",
        de: "Partnerkliniken",
        en: "Partner Clinics",
      },
      subtitle: {
        tr: "Güvenilir sağlık kuruluşları",
        de: "Vertrauenswürdige Gesundheitseinrichtungen",
        en: "Trusted healthcare facilities",
      },
    },
  ],

  ctas: [
    {
      id: "hero-primary",
      label: {
        tr: "Başvurumu Başlat",
        de: "Antrag starten",
        en: "Start Application",
      },
      url: "/apply",
      visible: true,
    },
    {
      id: "hero-secondary",
      label: {
        tr: "Klinikleri İncele",
        de: "Kliniken entdecken",
        en: "Explore Clinics",
      },
      url: "#clinics",
      visible: true,
    },
  ],

  banner: {
    enabled: false,
    startDate: "",
    endDate: "",
    content: {
      tr: "Özel kampanya: İlk danışmanlık ücretsiz!",
      de: "Sonderaktion: Erste Beratung kostenlos!",
      en: "Special offer: First consultation free!",
    },
  },

  seo: {
    metaTitle: {
      tr: "MedDiscover – Kaliteli Sağlık Hizmetleri",
      de: "MedDiscover – Premium-Gesundheitsversorgung",
      en: "MedDiscover – Quality Healthcare",
    },
    metaDescription: {
      tr: "Güvenilir kliniklere erişim sağlayın. Tedavi sürecinizi profesyonelce yönetiyoruz.",
      de: "Zugang zu vertrauenswürdigen Kliniken. Wir begleiten Sie professionell.",
      en: "Access trusted clinics. We guide you through your treatment journey.",
    },
    ogTitle: {
      tr: "",
      de: "",
      en: "",
    },
    ogDescription: {
      tr: "",
      de: "",
      en: "",
    },
    ogImageUrl: "/images/og-default.webp",
    canonicalBaseUrl:
      process.env.NEXT_PUBLIC_CANONICAL_BASE_URL || "",
    indexing: "index",
  },

  footer: {
    companyText: {
      tr: "© 2025 MedDiscover",
      de: "© 2025 MedDiscover",
      en: "© 2025 MedDiscover",
    },
    imprintText: {
      de: "Forellstr. 59\n45663 Recklinghausen",
      en: "Forellstr. 59\n45663 Recklinghausen",
      tr: "Forellstr. 59\n45663 Recklinghausen",
    },
    privacyUrl: "/privacy",
    termsUrl: "/terms",
    imprintUrl: "/impressum",
  },

  locale: {
    defaultLocale: "de",
    localeOrder: ["de", "en", "tr"],
    fallbackLocale: "en",
  },
  featuredClinics: [
    {
      id: "clinic-1",
      name: {
        de: "Berlin Med Center",
        en: "Berlin Med Center",
        tr: "Berlin Med Center",
      },
      city: {
        de: "Berlin",
        en: "Berlin",
        tr: "Berlin",
      },
      country: {
        de: "Deutschland",
        en: "Germany",
        tr: "Almanya",
      },
      specialty: {
        de: "Orthopaedie & Rehabilitation",
        en: "Orthopedics & Rehabilitation",
        tr: "Ortopedi ve Rehabilitasyon",
      },
      shortDescription: {
        de: "Modernes Zentrum fuer Orthopaedie mit internationaler Patientenerfahrung.",
        en: "Modern orthopedic center with international patient experience.",
        tr: "Uluslararasi deneyimli modern ortopedi merkezi.",
      },
      imageUrl: "/images/featured-clinic-1.webp",
      ctaLabel: {
        de: "Mehr erfahren",
        en: "Learn more",
        tr: "Detaylari gor",
      },
      ctaUrl: "/apply",
      active: true,
    },
    {
      id: "clinic-2",
      name: {
        de: "Alanya Smile Clinic",
        en: "Alanya Smile Clinic",
        tr: "Alanya Smile Clinic",
      },
      city: {
        de: "Alanya",
        en: "Alanya",
        tr: "Alanya",
      },
      country: {
        de: "Tuerkei",
        en: "Turkey",
        tr: "Turkiye",
      },
      specialty: {
        de: "Zahnmedizin & Aesthetik",
        en: "Dental & Aesthetics",
        tr: "Dis ve Estetik",
      },
      shortDescription: {
        de: "Ganzheitliche Zahnmedizin mit Fokus auf Aesthetik und Komfort.",
        en: "Comprehensive dental care focused on aesthetics and comfort.",
        tr: "Estetik ve konfora odakli kapsamli dis bakimi.",
      },
      imageUrl: "/images/featured-clinic-2.webp",
      ctaLabel: {
        de: "Jetzt anfragen",
        en: "Request info",
        tr: "Bilgi al",
      },
      ctaUrl: "/apply",
      active: true,
    },
    {
      id: "clinic-3",
      name: {
        de: "Istanbul Heart Institute",
        en: "Istanbul Heart Institute",
        tr: "Istanbul Heart Institute",
      },
      city: {
        de: "Istanbul",
        en: "Istanbul",
        tr: "Istanbul",
      },
      country: {
        de: "Tuerkei",
        en: "Turkey",
        tr: "Turkiye",
      },
      specialty: {
        de: "Kardiologie & Check-ups",
        en: "Cardiology & Check-ups",
        tr: "Kardiyoloji ve Kontroller",
      },
      shortDescription: {
        de: "Schnelle Diagnostik und persoenliche Betreuung fuer internationale Gaeste.",
        en: "Fast diagnostics and personalized care for international guests.",
        tr: "Uluslararasi hastalar icin hizli teshis ve kisisel destek.",
      },
      imageUrl: "/images/featured-clinic-3.webp",
      ctaLabel: {
        de: "Beratung starten",
        en: "Start consultation",
        tr: "Danismayi baslat",
      },
      ctaUrl: "/apply",
      active: true,
    },
  ],
  _version: 1,
  _lastSaved: null,
};

export const STORAGE_KEY = "md_admin_settings_v1";





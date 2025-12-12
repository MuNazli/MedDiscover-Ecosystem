'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Language = 'de' | 'tr' | 'en'

const translations = {
  de: {
    title: 'Kostenlose Beratung anfordern',
    subtitle: 'Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden bei Ihnen.',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    phone: 'Telefon',
    treatment: 'Gewünschte Behandlung',
    selectTreatment: 'Behandlung auswählen',
    message: 'Ihre Nachricht (optional)',
    messagePlaceholder: 'Beschreiben Sie kurz Ihr Anliegen...',
    language: 'Bevorzugte Sprache',
    privacyConsent: 'Ich habe die Datenschutzerklärung gelesen und stimme zu',
    agbConsent: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen',
    marketingConsent: 'Ich möchte Newsletter und Angebote erhalten (optional)',
    captcha: 'Sicherheitscode',
    captchaPlaceholder: 'Code eingeben',
    refreshCaptcha: 'Neuer Code',
    submit: 'Anfrage absenden',
    submitting: 'Wird gesendet...',
    required: 'Pflichtfeld',
    viewPrivacy: 'Datenschutzerklärung lesen',
    viewAGB: 'AGB lesen'
  },
  tr: {
    title: 'Ücretsiz Danışmanlık İsteyin',
    subtitle: 'Formu doldurun, 24 saat içinde sizinle iletişime geçelim.',
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    treatment: 'İstenen Tedavi',
    selectTreatment: 'Tedavi seçin',
    message: 'Mesajınız (opsiyonel)',
    messagePlaceholder: 'Talebinizi kısaca açıklayın...',
    language: 'Tercih Edilen Dil',
    privacyConsent: 'Gizlilik politikasını okudum ve kabul ediyorum',
    agbConsent: 'Şartlar ve koşulları kabul ediyorum',
    marketingConsent: 'Bülten ve teklifler almak istiyorum (opsiyonel)',
    captcha: 'Güvenlik Kodu',
    captchaPlaceholder: 'Kodu girin',
    refreshCaptcha: 'Yeni Kod',
    submit: 'Başvuru Gönder',
    submitting: 'Gönderiliyor...',
    required: 'Zorunlu alan',
    viewPrivacy: 'Gizlilik politikasını oku',
    viewAGB: 'Şartları oku'
  },
  en: {
    title: 'Request Free Consultation',
    subtitle: 'Fill out the form and we will contact you within 24 hours.',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    treatment: 'Desired Treatment',
    selectTreatment: 'Select treatment',
    message: 'Your Message (optional)',
    messagePlaceholder: 'Briefly describe your request...',
    language: 'Preferred Language',
    privacyConsent: 'I have read and agree to the Privacy Policy',
    agbConsent: 'I accept the Terms and Conditions',
    marketingConsent: 'I want to receive newsletters and offers (optional)',
    captcha: 'Security Code',
    captchaPlaceholder: 'Enter code',
    refreshCaptcha: 'New Code',
    submit: 'Submit Request',
    submitting: 'Submitting...',
    required: 'Required',
    viewPrivacy: 'Read Privacy Policy',
    viewAGB: 'Read Terms'
  }
}

const treatmentOptions = {
  de: [
    { value: 'dental', label: 'Zahnbehandlung' },
    { value: 'hair_transplant', label: 'Haartransplantation' },
    { value: 'plastic_surgery', label: 'Plastische Chirurgie' },
    { value: 'eye_surgery', label: 'Augenoperation' },
    { value: 'bariatric', label: 'Adipositaschirurgie' },
    { value: 'orthopedic', label: 'Orthopädie' },
    { value: 'cardiology', label: 'Kardiologie' },
    { value: 'oncology', label: 'Onkologie' },
    { value: 'fertility', label: 'Fruchtbarkeitsbehandlung' },
    { value: 'other', label: 'Sonstiges' }
  ],
  tr: [
    { value: 'dental', label: 'Diş Tedavisi' },
    { value: 'hair_transplant', label: 'Saç Ekimi' },
    { value: 'plastic_surgery', label: 'Plastik Cerrahi' },
    { value: 'eye_surgery', label: 'Göz Ameliyatı' },
    { value: 'bariatric', label: 'Obezite Cerrahisi' },
    { value: 'orthopedic', label: 'Ortopedi' },
    { value: 'cardiology', label: 'Kardiyoloji' },
    { value: 'oncology', label: 'Onkoloji' },
    { value: 'fertility', label: 'Tüp Bebek' },
    { value: 'other', label: 'Diğer' }
  ],
  en: [
    { value: 'dental', label: 'Dental Treatment' },
    { value: 'hair_transplant', label: 'Hair Transplant' },
    { value: 'plastic_surgery', label: 'Plastic Surgery' },
    { value: 'eye_surgery', label: 'Eye Surgery' },
    { value: 'bariatric', label: 'Bariatric Surgery' },
    { value: 'orthopedic', label: 'Orthopedic' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'fertility', label: 'Fertility Treatment' },
    { value: 'other', label: 'Other' }
  ]
}

export default function LeadForm() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('de')
  const t = translations[lang]
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    treatmentType: '',
    message: '',
    preferredLanguage: 'de' as Language,
    consentPrivacy: false,
    acceptAGB: false,
    consentMarketing: false,
    captchaInput: ''
  })
  
  const [captcha, setCaptcha] = useState({ token: '', svg: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/captcha')
      const data = await res.json()
      if (data.success) {
        setCaptcha({ token: data.token, svg: data.svg })
        setFormData(prev => ({ ...prev, captchaInput: '' }))
      }
    } catch (err) {
      console.error('Failed to fetch captcha:', err)
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    setFormData(prev => ({ ...prev, preferredLanguage: newLang }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = t.required
    if (!formData.lastName.trim()) newErrors.lastName = t.required
    if (!formData.email.trim()) newErrors.email = t.required
    if (!formData.phone.trim()) newErrors.phone = t.required
    if (!formData.treatmentType) newErrors.treatmentType = t.required
    if (!formData.consentPrivacy) newErrors.consentPrivacy = t.required
    if (!formData.acceptAGB) newErrors.acceptAGB = t.required
    if (!formData.captchaInput.trim()) newErrors.captchaInput = t.required
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    
    if (!validate()) return
    
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captchaToken: captcha.token,
          legalLocale: lang
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push(`/lead/success?lang=${lang}`)
      } else {
        setSubmitError(data.error || 'An error occurred')
        if (data.error?.toLowerCase().includes('captcha')) {
          fetchCaptcha()
        }
      }
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Language Selector */}
      <div className="flex justify-end gap-2 mb-6">
        {(['de', 'tr', 'en'] as const).map((l) => (
          <button
            key={l}
            onClick={() => handleLanguageChange(l)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              lang === l 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600 mb-8">{t.subtitle}</p>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t.firstName} *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.firstName && <p className="form-error">{errors.firstName}</p>}
            </div>
            <div>
              <label className="form-label">{t.lastName} *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.lastName && <p className="form-error">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t.email} *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <div>
              <label className="form-label">{t.phone} *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+49 123 456789"
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>
          </div>

          {/* Treatment */}
          <div>
            <label className="form-label">{t.treatment} *</label>
            <select
              name="treatmentType"
              value={formData.treatmentType}
              onChange={handleChange}
              className={`form-input ${errors.treatmentType ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">{t.selectTreatment}</option>
              {treatmentOptions[lang].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.treatmentType && <p className="form-error">{errors.treatmentType}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="form-label">{t.message}</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder={t.messagePlaceholder}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          {/* Captcha */}
          <div>
            <label className="form-label">{t.captcha} *</label>
            <div className="flex items-center gap-4">
              <div 
                className="bg-gray-100 rounded-lg p-2"
                dangerouslySetInnerHTML={{ __html: captcha.svg }}
              />
              <button
                type="button"
                onClick={fetchCaptcha}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                disabled={isSubmitting}
              >
                {t.refreshCaptcha}
              </button>
            </div>
            <input
              type="text"
              name="captchaInput"
              value={formData.captchaInput}
              onChange={handleChange}
              placeholder={t.captchaPlaceholder}
              className={`form-input mt-2 max-w-xs ${errors.captchaInput ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.captchaInput && <p className="form-error">{errors.captchaInput}</p>}
          </div>

          {/* Consents */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentPrivacy"
                checked={formData.consentPrivacy}
                onChange={handleChange}
                className="mt-1"
                disabled={isSubmitting}
              />
              <div>
                <label className="text-sm text-gray-700">
                  {t.privacyConsent} *
                </label>
                <a 
                  href={`/legal/privacy-${lang}.md`} 
                  target="_blank" 
                  className="block text-xs text-primary-600 hover:underline"
                >
                  {t.viewPrivacy}
                </a>
                {errors.consentPrivacy && <p className="form-error">{errors.consentPrivacy}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="acceptAGB"
                checked={formData.acceptAGB}
                onChange={handleChange}
                className="mt-1"
                disabled={isSubmitting}
              />
              <div>
                <label className="text-sm text-gray-700">
                  {t.agbConsent} *
                </label>
                <a 
                  href={`/legal/agb-${lang}.md`} 
                  target="_blank" 
                  className="block text-xs text-primary-600 hover:underline"
                >
                  {t.viewAGB}
                </a>
                {errors.acceptAGB && <p className="form-error">{errors.acceptAGB}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentMarketing"
                checked={formData.consentMarketing}
                onChange={handleChange}
                className="mt-1"
                disabled={isSubmitting}
              />
              <label className="text-sm text-gray-700">
                {t.marketingConsent}
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </div>
  )
}

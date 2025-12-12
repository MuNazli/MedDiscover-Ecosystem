'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const translations = {
  de: {
    title: 'Vielen Dank für Ihre Anfrage!',
    subtitle: 'Wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24-48 Stunden bei Ihnen melden.',
    whatNext: 'Was passiert jetzt?',
    step1: 'Unser medizinisches Team prüft Ihre Anfrage',
    step2: 'Ein Berater wird Sie telefonisch oder per E-Mail kontaktieren',
    step3: 'Sie erhalten ein individuelles Angebot',
    emailSent: 'Eine Bestätigungs-E-Mail wurde an Ihre E-Mail-Adresse gesendet.',
    backHome: 'Zurück zur Startseite',
    newRequest: 'Neue Anfrage stellen'
  },
  tr: {
    title: 'Başvurunuz için teşekkür ederiz!',
    subtitle: 'Başvurunuzu aldık ve 24-48 saat içinde sizinle iletişime geçeceğiz.',
    whatNext: 'Şimdi ne olacak?',
    step1: 'Medikal ekibimiz başvurunuzu inceleyecek',
    step2: 'Danışmanımız sizi telefonla veya e-posta ile arayacak',
    step3: 'Size özel bir teklif alacaksınız',
    emailSent: 'E-posta adresinize bir onay e-postası gönderildi.',
    backHome: 'Ana sayfaya dön',
    newRequest: 'Yeni başvuru yap'
  },
  en: {
    title: 'Thank you for your inquiry!',
    subtitle: 'We have received your request and will contact you within 24-48 hours.',
    whatNext: 'What happens next?',
    step1: 'Our medical team will review your inquiry',
    step2: 'A consultant will contact you by phone or email',
    step3: 'You will receive a personalized offer',
    emailSent: 'A confirmation email has been sent to your email address.',
    backHome: 'Back to homepage',
    newRequest: 'Submit new request'
  }
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get('lang') as 'de' | 'tr' | 'en') || 'de'
  const t = translations[lang]

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="card text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600 mb-8">{t.subtitle}</p>

          {/* Steps */}
          <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">{t.whatNext}</h2>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <span className="text-gray-700">{t.step1}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <span className="text-gray-700">{t.step2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <span className="text-gray-700">{t.step3}</span>
              </li>
            </ol>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            📧 {t.emailSent}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/lead" className="btn-primary">
              {t.newRequest}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}

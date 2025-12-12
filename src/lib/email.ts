// Email service for patient confirmation and admin notification
// In MVP, we log emails to console. In production, integrate SMTP.

import { treatmentTypes } from './validations'

type Language = 'de' | 'tr' | 'en'

interface EmailData {
  to: string
  subject: string
  body: string
}

// Email templates
const templates = {
  patientConfirmation: {
    de: {
      subject: 'Ihre Anfrage bei MedDiscover – Bestätigung',
      body: (firstName: string, treatment: string) => `
Sehr geehrte/r ${firstName},

vielen Dank für Ihre Anfrage bei MedDiscover!

Wir haben Ihre Anfrage für "${treatment}" erhalten und werden uns innerhalb von 24-48 Stunden bei Ihnen melden.

Was passiert als nächstes?
1. Unser medizinisches Team prüft Ihre Anfrage
2. Ein Berater wird Sie kontaktieren
3. Wir erstellen ein individuelles Angebot für Sie

Bei Fragen können Sie uns jederzeit erreichen.

Mit freundlichen Grüßen,
Ihr MedDiscover Team

---
Datenschutz: Ihre Daten werden gemäß unserer Datenschutzerklärung verarbeitet.
MedDiscover GmbH | www.meddiscover.de
`.trim()
    },
    tr: {
      subject: 'MedDiscover Başvurunuz – Onay',
      body: (firstName: string, treatment: string) => `
Sayın ${firstName},

MedDiscover'a başvurunuz için teşekkür ederiz!

"${treatment}" için başvurunuzu aldık ve 24-48 saat içinde sizinle iletişime geçeceğiz.

Sonraki Adımlar:
1. Medikal ekibimiz başvurunuzu inceleyecek
2. Danışmanımız sizinle iletişime geçecek
3. Size özel bir teklif hazırlayacağız

Sorularınız için bize her zaman ulaşabilirsiniz.

Saygılarımızla,
MedDiscover Ekibi

---
Gizlilik: Verileriniz gizlilik politikamız uyarınca işlenmektedir.
MedDiscover GmbH | www.meddiscover.de
`.trim()
    },
    en: {
      subject: 'Your MedDiscover Inquiry – Confirmation',
      body: (firstName: string, treatment: string) => `
Dear ${firstName},

Thank you for your inquiry at MedDiscover!

We have received your request for "${treatment}" and will contact you within 24-48 hours.

What Happens Next?
1. Our medical team will review your inquiry
2. A consultant will contact you
3. We will prepare a personalized offer for you

If you have any questions, please don't hesitate to reach out.

Best regards,
The MedDiscover Team

---
Privacy: Your data is processed in accordance with our privacy policy.
MedDiscover GmbH | www.meddiscover.de
`.trim()
    }
  },
  
  adminNotification: {
    subject: 'Neue Lead-Anfrage – MedDiscover',
    body: (lead: { firstName: string; lastName: string; email: string; phone: string; treatmentType: string; preferredLanguage: string }) => `
Neue Lead-Anfrage eingegangen!

Details:
- Name: ${lead.firstName} ${lead.lastName}
- E-Mail: ${lead.email}
- Telefon: ${lead.phone}
- Behandlung: ${lead.treatmentType}
- Sprache: ${lead.preferredLanguage.toUpperCase()}
- Eingangsdatum: ${new Date().toLocaleString('de-DE')}

Bitte melden Sie sich im Admin-Panel an, um die vollständigen Details einzusehen.

---
MedDiscover Lead Management System
`.trim()
  }
}

async function sendEmail(data: EmailData): Promise<boolean> {
  // In development, log to console
  if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST) {
    console.log('📧 [EMAIL]', {
      to: data.to,
      subject: data.subject,
      body: data.body.substring(0, 100) + '...'
    })
    return true
  }

  // TODO: In production, integrate with nodemailer or email service
  // const transporter = nodemailer.createTransport({...})
  // await transporter.sendMail({...})
  
  return true
}

export async function sendPatientConfirmation(
  email: string,
  firstName: string,
  treatmentType: keyof typeof treatmentTypes,
  language: Language
): Promise<boolean> {
  const template = templates.patientConfirmation[language]
  const treatmentName = treatmentTypes[treatmentType][language]
  
  return sendEmail({
    to: email,
    subject: template.subject,
    body: template.body(firstName, treatmentName)
  })
}

export async function sendAdminNotification(lead: {
  firstName: string
  lastName: string
  email: string
  phone: string
  treatmentType: string
  preferredLanguage: string
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@meddiscover.de'
  
  return sendEmail({
    to: adminEmail,
    subject: templates.adminNotification.subject,
    body: templates.adminNotification.body(lead)
  })
}

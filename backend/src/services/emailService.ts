import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Email templates for different languages
const templates = {
  patientConfirmation: {
    de: {
      subject: 'Ihre Anfrage bei MedDiscover – Bestätigung',
      body: (firstName: string, treatmentType: string) => `
Sehr geehrte/r ${firstName},

vielen Dank für Ihre Anfrage bei MedDiscover!

Wir haben Ihre Anfrage für "${treatmentType}" erhalten und werden uns innerhalb von 24-48 Stunden bei Ihnen melden.

Ihre Anfrage-Details:
- Behandlungstyp: ${treatmentType}
- Eingangsdatum: ${new Date().toLocaleDateString('de-DE')}

Was passiert als nächstes?
1. Unser medizinisches Team prüft Ihre Anfrage
2. Ein Berater wird Sie kontaktieren
3. Wir erstellen ein individuelles Angebot für Sie

Bei Fragen können Sie uns jederzeit erreichen.

Mit freundlichen Grüßen,
Ihr MedDiscover Team

---
Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.

Datenschutz: Ihre Daten werden gemäß unserer Datenschutzerklärung verarbeitet.
MedDiscover GmbH | www.meddiscover.de
      `.trim()
    },
    tr: {
      subject: 'MedDiscover Başvurunuz – Onay',
      body: (firstName: string, treatmentType: string) => `
Sayın ${firstName},

MedDiscover'a başvurunuz için teşekkür ederiz!

"${treatmentType}" için başvurunuzu aldık ve 24-48 saat içinde sizinle iletişime geçeceğiz.

Başvuru Detaylarınız:
- Tedavi Türü: ${treatmentType}
- Başvuru Tarihi: ${new Date().toLocaleDateString('tr-TR')}

Sonraki Adımlar:
1. Medikal ekibimiz başvurunuzu inceleyecek
2. Danışmanımız sizinle iletişime geçecek
3. Size özel bir teklif hazırlayacağız

Sorularınız için bize her zaman ulaşabilirsiniz.

Saygılarımızla,
MedDiscover Ekibi

---
Bu e-posta otomatik olarak gönderilmiştir. Lütfen bu e-postaya doğrudan yanıt vermeyiniz.

Gizlilik: Verileriniz gizlilik politikamız uyarınca işlenmektedir.
MedDiscover GmbH | www.meddiscover.de
      `.trim()
    },
    en: {
      subject: 'Your MedDiscover Inquiry – Confirmation',
      body: (firstName: string, treatmentType: string) => `
Dear ${firstName},

Thank you for your inquiry at MedDiscover!

We have received your request for "${treatmentType}" and will contact you within 24-48 hours.

Your Inquiry Details:
- Treatment Type: ${treatmentType}
- Submission Date: ${new Date().toLocaleDateString('en-US')}

What Happens Next?
1. Our medical team will review your inquiry
2. A consultant will contact you
3. We will prepare a personalized offer for you

If you have any questions, please don't hesitate to reach out.

Best regards,
The MedDiscover Team

---
This email was automatically generated. Please do not reply directly to this email.

Privacy: Your data is processed in accordance with our privacy policy.
MedDiscover GmbH | www.meddiscover.de
      `.trim()
    }
  },
  adminNotification: {
    subject: 'Neue Lead-Anfrage – MedDiscover',
    body: (lead: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      treatmentType: string;
      preferredLanguage: string;
      createdAt: Date;
    }) => `
Neue Lead-Anfrage eingegangen!

Details:
- Name: ${lead.firstName} ${lead.lastName}
- E-Mail: ${lead.email}
- Telefon: ${lead.phone}
- Behandlung: ${lead.treatmentType}
- Sprache: ${lead.preferredLanguage.toUpperCase()}
- Eingangsdatum: ${lead.createdAt.toLocaleString('de-DE')}

Bitte melden Sie sich im Admin-Panel an, um die vollständigen Details einzusehen.

---
MedDiscover Lead Management System
    `.trim()
  }
};

// Treatment type translations
const treatmentTypeNames: Record<string, Record<string, string>> = {
  dental: { de: 'Zahnbehandlung', tr: 'Diş Tedavisi', en: 'Dental Treatment' },
  hair_transplant: { de: 'Haartransplantation', tr: 'Saç Ekimi', en: 'Hair Transplant' },
  plastic_surgery: { de: 'Plastische Chirurgie', tr: 'Plastik Cerrahi', en: 'Plastic Surgery' },
  eye_surgery: { de: 'Augenoperation', tr: 'Göz Ameliyatı', en: 'Eye Surgery' },
  bariatric: { de: 'Adipositaschirurgie', tr: 'Obezite Cerrahisi', en: 'Bariatric Surgery' },
  orthopedic: { de: 'Orthopädie', tr: 'Ortopedi', en: 'Orthopedic' },
  cardiology: { de: 'Kardiologie', tr: 'Kardiyoloji', en: 'Cardiology' },
  oncology: { de: 'Onkologie', tr: 'Onkoloji', en: 'Oncology' },
  fertility: { de: 'Fruchtbarkeitsbehandlung', tr: 'Tüp Bebek', en: 'Fertility Treatment' },
  other: { de: 'Sonstiges', tr: 'Diğer', en: 'Other' }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });
};

export const emailService = {
  async sendPatientConfirmation(
    email: string,
    firstName: string,
    treatmentType: string,
    language: 'de' | 'tr' | 'en' = 'de'
  ): Promise<boolean> {
    try {
      const transporter = createTransporter();
      const template = templates.patientConfirmation[language];
      const treatmentName = treatmentTypeNames[treatmentType]?.[language] || treatmentType;

      const mailOptions = {
        from: config.smtp.from,
        to: email,
        subject: template.subject,
        text: template.body(firstName, treatmentName)
      };

      // In development, just log instead of sending
      if (config.nodeEnv === 'development') {
        logger.info('📧 [DEV] Patient confirmation email would be sent:', {
          to: email,
          subject: template.subject
        });
        return true;
      }

      await transporter.sendMail(mailOptions);
      logger.info(`Patient confirmation email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send patient confirmation email:', error);
      return false;
    }
  },

  async sendAdminNotification(lead: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    treatmentType: string;
    preferredLanguage: string;
    createdAt: Date;
  }): Promise<boolean> {
    try {
      const transporter = createTransporter();
      const template = templates.adminNotification;

      const mailOptions = {
        from: config.smtp.from,
        to: config.adminNotificationEmail,
        subject: template.subject,
        text: template.body(lead)
      };

      // In development, just log instead of sending
      if (config.nodeEnv === 'development') {
        logger.info('📧 [DEV] Admin notification email would be sent:', {
          to: config.adminNotificationEmail,
          lead: `${lead.firstName} ${lead.lastName}`
        });
        return true;
      }

      await transporter.sendMail(mailOptions);
      logger.info('Admin notification email sent');
      return true;
    } catch (error) {
      logger.error('Failed to send admin notification email:', error);
      return false;
    }
  }
};

import { useTranslations } from 'next-intl';
import { CheckCircle, Award, Shield, DollarSign } from 'lucide-react';

export default function VerifiedPartnersSection() {
  const t = useTranslations('verifiedPartners');

  const features = [
    { icon: Award, text: t('accreditation') },
    { icon: CheckCircle, text: t('experience') },
    { icon: Shield, text: t('standards') },
    { icon: DollarSign, text: t('transparent') },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 border border-gray-100"
              >
                <Icon className="w-10 h-10 text-blue-600 mb-4" strokeWidth={1.5} />
                <p className="text-gray-800 font-medium">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

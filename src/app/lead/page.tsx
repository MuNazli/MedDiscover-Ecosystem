import LeadForm from '@/components/LeadForm'

export const metadata = {
  title: 'Anfrage stellen - MedDiscover',
  description: 'Stellen Sie eine kostenlose Anfrage für Ihre medizinische Behandlung in der Türkei.'
}

export default function LeadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">MedDiscover</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LeadForm />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} MedDiscover GmbH. Alle Rechte vorbehalten.</p>
          <div className="mt-2 space-x-4">
            <a href="/legal/privacy-de.md" className="hover:text-white">Datenschutz</a>
            <a href="/legal/agb-de.md" className="hover:text-white">AGB</a>
            <a href="/legal/liability-de.md" className="hover:text-white">Impressum</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

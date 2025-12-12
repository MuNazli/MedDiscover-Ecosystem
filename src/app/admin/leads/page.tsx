import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminLeadTable from '@/components/AdminLeadTable'

export const metadata = {
  title: 'Lead-Verwaltung - MedDiscover Admin'
}

async function LogoutButton() {
  async function handleLogout() {
    'use server'
    const { logout } = await import('@/lib/auth')
    await logout()
    redirect('/admin/login')
  }

  return (
    <form action={handleLogout}>
      <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
        Abmelden
      </button>
    </form>
  )
}

export default async function AdminLeadsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <span className="text-xl font-semibold text-gray-900 block">MedDiscover</span>
                <span className="text-xs text-gray-500">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.name} ({session.role})
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lead-Verwaltung</h1>
          <p className="text-gray-600">Alle eingegangenen Anfragen</p>
        </div>

        <div className="card">
          <AdminLeadTable />
        </div>
      </main>
    </div>
  )
}

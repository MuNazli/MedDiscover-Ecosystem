'use client'

import { useState, useEffect, useCallback } from 'react'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  treatmentType: string
  preferredLanguage: string
  status: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const treatmentLabels: Record<string, string> = {
  dental: 'Zahnbehandlung',
  hair_transplant: 'Haartransplantation',
  plastic_surgery: 'Plastische Chirurgie',
  eye_surgery: 'Augenoperation',
  bariatric: 'Adipositaschirurgie',
  orthopedic: 'Orthopädie',
  cardiology: 'Kardiologie',
  oncology: 'Onkologie',
  fertility: 'Fruchtbarkeitsbehandlung',
  other: 'Sonstiges'
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  CONVERTED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800'
}

export default function AdminLeadTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLeads = useCallback(async (searchQuery: string, page: number) => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      params.set('page', page.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()

      if (data.success) {
        setLeads(data.leads)
        setPagination(data.pagination)
      } else if (res.status === 401) {
        window.location.href = '/admin/login'
      } else {
        setError(data.error || 'Failed to fetch leads')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads(search, pagination.page)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeads(search, 1)
  }

  const handlePageChange = (newPage: number) => {
    fetchLeads(search, newPage)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, E-Mail oder Telefon suchen..."
            className="form-input flex-1"
          />
          <button type="submit" className="btn-primary">
            Suchen
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Laden...
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Keine Leads gefunden
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Kontakt</th>
                  <th>Behandlung</th>
                  <th>Sprache</th>
                  <th>Status</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </div>
                    </td>
                    <td>
                      <div className="text-gray-900">{lead.email}</div>
                      <div className="text-gray-500 text-sm">{lead.phone}</div>
                    </td>
                    <td>
                      {treatmentLabels[lead.treatmentType] || lead.treatmentType}
                    </td>
                    <td>
                      <span className="uppercase text-sm font-medium">
                        {lead.preferredLanguage}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-gray-100'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Zeige {((pagination.page - 1) * pagination.limit) + 1} bis {Math.min(pagination.page * pagination.limit, pagination.total)} von {pagination.total} Leads
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Zurück
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

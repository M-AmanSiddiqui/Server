import { useState } from 'react'
import { Calendar, Download, FileText } from 'lucide-react'

import Layout from '../components/Layout'
import Toast from '../components/Toast'
import { reportApi } from '../services/api'

export default function Reports() {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const downloadReport = async (period, format) => {
    setLoading(true)
    try {
      const response = await reportApi.download(period, format)
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])

      if (!blob.size) {
        throw new Error('No file data received')
      }

      const filename = `server_report_${period}_${new Date().toISOString().split('T')[0]}.${format}`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setToast({
        message: `${period.charAt(0).toUpperCase() + period.slice(1)} ${format.toUpperCase()} report downloaded (${(
          blob.size / 1024
        ).toFixed(1)} KB)`,
        type: 'success',
      })
    } catch (err) {
      setToast({
        message: `Failed to download report: ${err.response?.data?.detail || err.message || 'Unknown error'}`,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const periods = [
    { id: 'daily', label: 'Daily', desc: 'Last 24 hours' },
    { id: 'weekly', label: 'Weekly', desc: 'Last 7 days' },
    { id: 'monthly', label: 'Monthly', desc: 'Last 30 days' },
  ]

  return (
    <Layout>
      <div className="mb-6 animate-fade-rise sm:mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">Reports</h2>
        <p className="app-muted text-sm font-medium sm:text-base">
          Download server uptime, downtime, and response-time reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {periods.map((period) => (
          <div
            key={period.id}
            className="app-panel animate-fade-rise rounded-xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:rounded-2xl sm:p-6"
          >
            <div className="mb-5 flex items-center gap-3 sm:gap-4">
              <div className="app-title-chip rounded-lg p-2.5 sm:rounded-xl sm:p-3">
                <Calendar className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-strong)] sm:text-lg">{period.label} Report</h3>
                <p className="app-muted text-xs font-medium sm:text-sm">{period.desc}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <button
                onClick={() => downloadReport(period.id, 'csv')}
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-105 disabled:opacity-60 sm:w-auto sm:flex-1 sm:rounded-xl sm:py-3 sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <FileText size={16} className="sm:h-[18px] sm:w-[18px]" />
                  CSV
                </span>
              </button>
              <button
                onClick={() => downloadReport(period.id, 'pdf')}
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-rose-600 to-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-105 disabled:opacity-60 sm:w-auto sm:flex-1 sm:rounded-xl sm:py-3 sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <Download size={16} className="sm:h-[18px] sm:w-[18px]" />
                  PDF
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  )
}

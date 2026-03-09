import { useState } from 'react'
import Layout from '../components/Layout'
import ServerList from '../components/ServerList'
import ServerForm from '../components/ServerForm'
import StatusChart from '../components/StatusChart'
import ResponseChart from '../components/ResponseChart'
import DowntimeChart from '../components/DowntimeChart'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { useServers } from '../hooks/useServers'
import { useWebSocket } from '../hooks/useWebSocket'
import { useLogs } from '../hooks/useLogs'
import { Plus, Wifi, WifiOff } from 'lucide-react'

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState(null)
  const { servers, addServer, updateServer, deleteServer } = useServers()
  const { statuses, connected } = useWebSocket()
  const { logs } = useLogs()

  const handleEdit = (server) => {
    setEditingServer(server)
    setShowForm(true)
  }

  const handleDelete = (serverId) => {
    const server = servers.find(s => s.id === serverId)
    setDeleteConfirm({ id: serverId, name: server?.name || 'this server' })
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteServer(deleteConfirm.id)
        setToast({ 
          message: `Server "${deleteConfirm.name}" deleted successfully!`, 
          type: 'success' 
        })
        setDeleteConfirm(null)
      } catch (err) {
        setToast({ 
          message: `Failed to delete server: ${err.response?.data?.detail || err.message}`, 
          type: 'error' 
        })
      }
    }
  }

  const handleSubmit = async (name, url) => {
    try {
      if (editingServer) {
        await updateServer(editingServer.id, name, url)
      } else {
        await addServer(name, url)
      }
      setEditingServer(null)
      setShowForm(false)
    } catch (err) {
      // Error is handled in ServerForm component
      // Don't close form on error
      throw err
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex animate-fade-rise flex-col items-start justify-between gap-3 sm:mb-8 sm:flex-row sm:items-center sm:gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="mb-2 text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
            Admin Dashboard
          </h2>
          <div className="flex items-center gap-2">
            {connected ? (
              <div className="app-live-chip flex items-center gap-2 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
                <Wifi size={14} className="animate-pulse text-[var(--success)] sm:h-4 sm:w-4" />
                <span className="text-xs font-semibold sm:text-sm">Live Monitoring</span>
              </div>
            ) : (
              <div className="app-offline-chip flex items-center gap-2 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
                <WifiOff size={14} className="text-[var(--danger)] sm:h-4 sm:w-4" />
                <span className="text-xs font-semibold sm:text-sm">Disconnected</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setEditingServer(null)
            setShowForm(true)
          }}
          className="app-btn-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 sm:w-auto sm:rounded-xl sm:px-6 sm:py-3 sm:text-base"
        >
          <Plus size={18} className="sm:h-5 sm:w-5" /> <span>Add Server</span>
        </button>
      </div>

      <div className="mb-4 animate-fade-rise sm:mb-6">
        <ServerList servers={servers} statuses={statuses} onDelete={handleDelete} onEdit={handleEdit} showActions />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:gap-6 lg:grid-cols-3">
        <StatusChart statuses={statuses} />
        <div className="lg:col-span-2">
          <ResponseChart logs={logs} />
        </div>
      </div>

      <div className="animate-fade-rise">
        <DowntimeChart logs={logs} />
      </div>

      {showForm && <ServerForm server={editingServer} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditingServer(null) }} />}
      
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Server"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  )
}

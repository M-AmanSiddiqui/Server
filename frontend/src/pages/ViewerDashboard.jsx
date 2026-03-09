import PublicLayout from '../components/PublicLayout'
import ServerList from '../components/ServerList'
import StatusChart from '../components/StatusChart'
import ResponseChart from '../components/ResponseChart'
import DowntimeChart from '../components/DowntimeChart'
import { useServers } from '../hooks/useServers'
import { useWebSocket } from '../hooks/useWebSocket'
import { useLogs } from '../hooks/useLogs'
import { Wifi, WifiOff } from 'lucide-react'

export default function ViewerDashboard() {
  const { servers } = useServers()
  const { statuses, connected } = useWebSocket()
  const { logs } = useLogs()

  return (
    <PublicLayout>
      <div className="mb-6 animate-fade-rise sm:mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
          Server Status
        </h2>
        <div className="flex items-center gap-2">
          {connected ? (
            <div className="app-live-chip flex items-center gap-2 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
              <Wifi size={14} className="animate-pulse text-[var(--success)] sm:h-4 sm:w-4" />
              <span className="text-xs font-semibold sm:text-sm">Live Updates</span>
            </div>
          ) : (
            <div className="app-offline-chip flex items-center gap-2 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
              <WifiOff size={14} className="text-[var(--danger)] sm:h-4 sm:w-4" />
              <span className="text-xs font-semibold sm:text-sm">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 animate-fade-rise sm:mb-6">
        <ServerList servers={servers} statuses={statuses} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <StatusChart statuses={statuses} />
        <div className="lg:col-span-2">
          <ResponseChart logs={logs} />
        </div>
      </div>

      <div className="mt-4 animate-fade-rise sm:mt-6">
        <DowntimeChart logs={logs} />
      </div>
    </PublicLayout>
  )
}

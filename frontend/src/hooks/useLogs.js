import { useState, useEffect } from 'react'
import { logApi } from '../services/api'

export function useLogs(serverId) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = serverId 
          ? await logApi.byServer(serverId)
          : await logApi.list()
        setLogs(data)
      } catch (err) {
        console.error('Failed to fetch logs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [serverId])

  return { logs, loading }
}

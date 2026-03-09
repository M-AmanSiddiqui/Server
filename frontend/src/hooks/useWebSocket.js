import { useEffect, useRef, useState, useCallback } from 'react'

export function useWebSocket() {
  const [statuses, setStatuses] = useState([])
  const [connected, setConnected] = useState(false)
  const ws = useRef(null)

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws.current = new WebSocket(`${protocol}//${window.location.host}/ws/status`)

    ws.current.onopen = () => setConnected(true)
    ws.current.onclose = () => {
      setConnected(false)
      setTimeout(connect, 3000)
    }
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'status_update') setStatuses(data.servers)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => ws.current?.close()
  }, [connect])

  return { statuses, connected }
}

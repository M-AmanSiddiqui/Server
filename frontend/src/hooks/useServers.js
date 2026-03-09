import { useState, useEffect, useCallback } from 'react'
import { serverApi } from '../services/api'

export function useServers() {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchServers = useCallback(async () => {
    try {
      const { data } = await serverApi.list()
      setServers(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch servers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServers() }, [fetchServers])

  const addServer = async (name, url) => {
    try {
      await serverApi.create(name, url)
      await fetchServers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add server')
      throw err
    }
  }

  const updateServer = async (id, name, url) => {
    try {
      await serverApi.update(id, { name, url })
      await fetchServers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update server')
      throw err
    }
  }

  const deleteServer = async (id) => {
    try {
      await serverApi.delete(id)
      await fetchServers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete server')
      throw err
    }
  }

  return { servers, loading, error, addServer, updateServer, deleteServer, refetch: fetchServers }
}

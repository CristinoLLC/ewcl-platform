"use client"

import { useEffect, useState } from 'react'
import { checkApiHealth } from '@/utils/api'

export default function ApiStatusIndicator() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [retrying, setRetrying] = useState(false)

  const checkStatus = async () => {
    try {
      setRetrying(true)
      const health = await checkApiHealth()
      setStatus(health.status === 'online' ? 'online' : 'offline')
    } catch (error) {
      setStatus('offline')
    } finally {
      setRetrying(false)
    }
  }

  useEffect(() => {
    checkStatus()
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'checking') {
    return (
      <div className="px-2 py-1 bg-gray-100 rounded-md inline-flex items-center">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
        <span className="text-xs">Checking API...</span>
      </div>
    )
  }

  return (
    <div className={`px-2 py-1 ${status === 'online' ? 'bg-green-100' : 'bg-red-100'} rounded-md inline-flex items-center`}>
      <div className={`w-2 h-2 ${status === 'online' ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`}></div>
      <span className="text-xs mr-2">{status === 'online' ? 'API Online' : 'API Offline'}</span>
      {status === 'offline' && !retrying && (
        <button
          onClick={checkStatus}
          className="text-xs text-blue-600 hover:underline"
        >
          Retry
        </button>
      )}
      {retrying && (
        <span className="text-xs text-gray-500">Retrying...</span>
      )}
    </div>
  )
}
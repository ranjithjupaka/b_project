'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Play,
  Square,
  Settings,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
} from 'lucide-react'

export default function DashboardPage() {
  const [status, setStatus] = useState({
    isRunning: false,
    balance: 0,
    positions: [],
    totalPnL: 0,
  })
  const [config, setConfig] = useState({
    purchasePercentage: 5,
    profitLossMargin: 2,
    tradingCount: 10,
  })
  const [logs, setLogs] = useState([
    {
      type: 'info',
      message: 'Trading bot initialized and ready...',
      timestamp: new Date().toISOString(),
    },
  ])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const ws = useRef<any>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectTimeout = useRef(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  // WebSocket connection
  useEffect(() => {
    connectWebSocket()
    loadInitialData()

    const interval = setInterval(loadInitialData, 30000)
   return () => {
     clearInterval(interval)
     if (reconnectTimeout.current) {
       clearTimeout(reconnectTimeout.current)
     }
     disconnectWebSocket()
   }
  }, [])

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `ws://localhost:5000/ws`
    console.log('Connecting to WebSocket:', wsUrl)
    setConnectionStatus('connecting')

    try {
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        console.log('WebSocket connected successfully')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        addLogEntry('success', 'WebSocket connected successfully')
      }

      ws.current.onmessage = (event:any) => {
        try {
          const message = JSON.parse(event.data)
          handleWebSocketMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.current.onclose = (event:any) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        addLogEntry('warning', `WebSocket disconnected (${event.code})`)
        attemptReconnect()
      }

      ws.current.onerror = (error:any) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
        addLogEntry('error', 'WebSocket connection error')
      }
    } catch (error:any) {
      console.error('Failed to create WebSocket:', error)
      setConnectionStatus('error')
      addLogEntry('error', `WebSocket connection failed: ${error.message}`)
      attemptReconnect()
    }
  }

  const attemptReconnect = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++
      addLogEntry(
        'info',
        `Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`
      )

      setTimeout(() => {
        connectWebSocket()
      }, 5000 * reconnectAttempts.current)
    } else {
      addLogEntry('error', 'Maximum reconnection attempts reached')
    }
  }

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close(1000, 'Component unmounting')
      ws.current = null
    }
  }

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'log':
        addLogEntry(
          message.data.type,
          message.data.message,
          message.data.timestamp
        )
        break
      case 'positions':
        setStatus((prev) => ({ ...prev, positions: message.data }))
        break
      case 'status':
        setStatus((prev) => ({ ...prev, ...message.data }))
        break
      case 'config':
        setConfig(message.data)
        break
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  const loadInitialData = async () => {
    try {
      const [statusResponse, balanceResponse] = await Promise.allSettled([
        fetch('/api/status').then((r) => r.json()),
        fetch('/api/balance').then((r) => r.json()),
      ])

      if (statusResponse.status === 'fulfilled') {
        const statusData = statusResponse.value
        setStatus((prev) => ({
          ...prev,
          isRunning: statusData.isRunning,
          positions: statusData.positions || [],
          totalPnL: statusData.totalPnL || 0,
        }))
        if (statusData.config) {
          setConfig(statusData.config)
        }
      }

      if (balanceResponse.status === 'fulfilled') {
        setStatus((prev) => ({
          ...prev,
          balance: balanceResponse.value.balance || 0,
        }))
      }
    } catch (error: any) {
      console.error('Error loading initial data:', error)
      addLogEntry('error', `Failed to load initial data: ${error.message}`)
    }
  }

  const addLogEntry = (type:any, message:any, timestamp = new Date().toISOString()) => {
    setLogs((prev) => [
      { type, message, timestamp },
      ...prev.slice(0, 49), // Keep only last 50 entries
    ])
  }

  const makeRequest = async (url:any, options = {}) => {
    setLoading(true)
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      return data
    } catch (error: any) {
      addLogEntry('error', error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const startBot = async () => {
    try {
      await makeRequest('/api/start', { method: 'POST' })
      addLogEntry('success', 'Bot started successfully')
      setTimeout(loadInitialData, 1000)
    } catch (error) {
      console.error('Error starting bot:', error)
    }
  }

  const stopBot = async () => {
    try {
      await makeRequest('/api/stop', { method: 'POST' })
      addLogEntry('success', 'Bot stopped successfully')
      setTimeout(loadInitialData, 1000)
    } catch (error) {
      console.error('Error stopping bot:', error)
    }
  }

  const updateConfig = async () => {
    try {
      const configData = {
        purchasePercentage: config.purchasePercentage / 100,
        profitLossMargin: config.profitLossMargin / 100,
        tradingCount: config.tradingCount,
      }

      await makeRequest('/api/config', {
        method: 'POST',
        body: JSON.stringify(configData),
      })

      addLogEntry('success', 'Configuration updated successfully')
    } catch (error) {
      console.error('Error updating config:', error)
    }
  }

  const handleConfigChange = (field: any, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const getLogTypeColor = (type: any) => {
    switch (type) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className='min-h-screen bg-black p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-2xl shadow-xl p-8 mb-8'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3'>
              <Activity className='text-blue-600' size={40} />
              Trading Bot Dashboard
            </h1>
            <div className='flex items-center justify-center gap-2 text-lg'>
              <div
                className={`w-3 h-3 rounded-full ${
                  status.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              ></div>
              <span className='font-semibold'>
                Status: {status.isRunning ? 'Running' : 'Stopped'}
              </span>
              <div
                className={`ml-4 w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                }`}
              ></div>
              <span className='text-sm'>
                WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Balance</p>
                <p className='text-2xl font-bold text-gray-900'>
                  ${status.balance.toFixed(2)}
                </p>
              </div>
              <DollarSign className='h-8 w-8 text-green-600' />
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Active Positions
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {status.positions.length}
                </p>
              </div>
              <BarChart3 className='h-8 w-8 text-blue-600' />
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total P&L</p>
                <p
                  className={`text-2xl font-bold ${
                    status.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  ${status.totalPnL.toFixed(2)}
                </p>
              </div>
              <TrendingUp className='h-8 w-8 text-purple-600' />
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Trading Count
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {config.tradingCount}
                </p>
              </div>
              <Settings className='h-8 w-8 text-indigo-600' />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Controls */}
          <div className='bg-white rounded-xl shadow-lg p-6'>
            <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
              <Play className='text-blue-600' size={24} />
              Bot Controls
            </h2>

            <div className='space-y-4'>
              <button
                onClick={startBot}
                disabled={loading || status.isRunning}
                className='w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2'
              >
                <Play size={20} />
                {loading ? 'Starting...' : 'Start Bot'}
              </button>

              <button
                onClick={stopBot}
                disabled={loading || !status.isRunning}
                className='w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2'
              >
                <Square size={20} />
                {loading ? 'Stopping...' : 'Stop Bot'}
              </button>
            </div>
          </div>

          {/* Configuration */}
          <div className='bg-white rounded-xl shadow-lg p-6'>
            <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
              <Settings className='text-blue-600' size={24} />
              Configuration
            </h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Purchase Percentage (0.01 to 1)
                </label>
                <input
                  type='number'
                  min='1'
                  max='100'
                  step='0.1'
                  value={config.purchasePercentage}
                  onChange={(e) =>
                    handleConfigChange('purchasePercentage', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Profit/Loss Margin (0.005 to 0.5)
                </label>
                <input
                  type='number'
                  min='0.5'
                  max='50'
                  step='0.1'
                  value={config.profitLossMargin}
                  onChange={(e) =>
                    handleConfigChange('profitLossMargin', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Trading Count (1 to 20)
                </label>
                <input
                  type='number'
                  min='1'
                  max='20'
                  value={config.tradingCount}
                  onChange={(e) =>
                    handleConfigChange('tradingCount', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <button
                onClick={updateConfig}
                disabled={loading}
                className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200'
              >
                {loading ? 'Updating...' : 'Update Configuration'}
              </button>
            </div>
          </div>

          {/* Active Positions */}
          <div className='bg-white rounded-xl shadow-lg p-6'>
            <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
              <BarChart3 className='text-blue-600' size={24} />
              Active Positions
            </h2>

            <div className='overflow-x-auto'>
              {status.positions.length === 0 ? (
                <p className='text-gray-500 text-center py-8'>
                  No active positions
                </p>
              ) : (
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='text-left py-2 font-semibold text-gray-700'>
                        Symbol
                      </th>
                      <th className='text-left py-2 font-semibold text-gray-700'>
                        Qty
                      </th>
                      <th className='text-left py-2 font-semibold text-gray-700'>
                        Price
                      </th>
                      <th className='text-left py-2 font-semibold text-gray-700'>
                        P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.positions.map((position:any, index) => (
                      <tr key={index} className='border-b border-gray-100'>
                        <td className='py-2 font-medium'>{position.symbol}</td>
                        <td className='py-2'>
                          {position.quantity?.toFixed(4) || '0.0000'}
                        </td>
                        <td className='py-2'>
                          ${position.buyPrice?.toFixed(6) || '0.000000'}
                        </td>
                        <td className='py-2 text-green-600 font-semibold'>
                          Monitoring...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className='bg-white rounded-xl shadow-lg p-6 mt-8'>
          <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
            <Activity className='text-blue-600' size={24} />
            Live Logs
          </h2>

          <div className='h-96 overflow-y-auto space-y-2'>
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border text-sm font-mono ${getLogTypeColor(
                  log.type
                )}`}
              >
                <span className='font-bold'>
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>{' '}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

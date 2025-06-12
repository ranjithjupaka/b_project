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
  RefreshCw,
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
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const pollingInterval = useRef<any>(null)

  // Initialize data and start polling
  useEffect(() => {
    loadInitialData()

    // Set up polling for real-time updates
    pollingInterval.current = setInterval(() => {
      refreshData(false)
    }, 10000) // Poll every 10 seconds

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      addLogEntry('info', 'Loading initial data...')
      await refreshData(false)
      addLogEntry('success', 'Initial data loaded successfully')
    } catch (error: any) {
      console.error('Error loading initial data:', error)
      addLogEntry('error', `Failed to load initial data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async (showRefreshing = true) => {
    if (showRefreshing) {
      setRefreshing(true)
    }
    
    try {
      const [statusResponse, balanceResponse, logsResponse] = await Promise.allSettled([
        fetch('/api/status').then(r => r.json()),
        fetch('/api/balance').then(r => r.json()),
        fetch('/api/logs?limit=50').then(r => r.json())
      ])

      if (statusResponse.status === 'fulfilled') {
        const statusData = statusResponse.value
        setStatus(prev => ({
          ...prev,
          isRunning: statusData.isRunning,
          positions: statusData.positions || [],
        }))
        
        if (statusData.config) {
          setConfig({
            purchasePercentage: (statusData.config.purchasePercentage * 100) || 5,
            profitLossMargin: (statusData.config.profitLossMargin * 100) || 2,
            tradingCount: statusData.config.tradingCount || 10,
          })
        }
      }

      if (balanceResponse.status === 'fulfilled') {
        setStatus(prev => ({
          ...prev,
          balance: balanceResponse.value.balance || 0,
        }))
      }
      
      if (logsResponse.status === 'fulfilled' && logsResponse.value.length > 0) {
        // Transform logs from API format to our format
        const formattedLogs = logsResponse.value.map((log: any) => ({
          type: log.type,
          message: log.message,
          timestamp: log.createdAt || new Date().toISOString()
        }))
        
        setLogs(formattedLogs)
      }

      // Calculate total P&L from positions
      if (statusResponse.status === 'fulfilled' && statusResponse.value.positions) {
        const positions = statusResponse.value.positions
        let totalPnL = 0
        
        // Get position stats if available
        try {
          const statsResponse = await fetch('/api/positions/stats').then(r => r.json())
          if (statsResponse.closed && statsResponse.closed.totalProfit) {
            totalPnL = statsResponse.closed.totalProfit
          }
        } catch (error) {
          console.error('Error fetching position stats:', error)
        }
        
        setStatus(prev => ({
          ...prev,
          totalPnL
        }))
      }
      
    } catch (error: any) {
      console.error('Error refreshing data:', error)
      if (showRefreshing) {
        addLogEntry('error', `Failed to refresh data: ${error.message}`)
      }
    } finally {
      if (showRefreshing) {
        setRefreshing(false)
      }
    }
  }

  const addLogEntry = (type: any, message: any, timestamp = new Date().toISOString()) => {
    setLogs(prev => [
      { type, message, timestamp },
      ...prev.slice(0, 49), // Keep only last 50 entries
    ])
  }

  const makeRequest = async (url: any, options = {}) => {
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
      setTimeout(() => refreshData(), 1000)
    } catch (error) {
      console.error('Error starting bot:', error)
    }
  }

  const stopBot = async () => {
    try {
      await makeRequest('/api/stop', { method: 'POST' })
      addLogEntry('success', 'Bot stopped successfully')
      setTimeout(() => refreshData(), 1000)
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
      setTimeout(() => refreshData(), 1000)
    } catch (error) {
      console.error('Error updating config:', error)
    }
  }

  const handleConfigChange = (field: any, value: any) => {
    setConfig(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
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
              <button 
                onClick={() => refreshData(true)} 
                className='ml-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors'
                disabled={refreshing}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span className='text-sm'>Refresh</span>
              </button>
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
                    {status.positions.map((position: any, index) => (
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

import Layout from '../components/Layout'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface DashboardData {
  invoiceThreeMonthsAgo: number
  invoiceTwoMonthsAgo: number
  invoicePreviousMonth: number
  totalAccountsPreviousMonth: number
  totalServicesPreviousMonth: number
  monthlyTrend: Array<{ month: string; amount: number }>
  serviceBreakdown: Array<{ service: string; cost: number }>
  regionBreakdown: Array<{ region: string; cost: number }>
  savingsData: {
    riSavings: number
    savingsPlans: number
    spotSavings: number
    credits: number
    refunds: number
  }
  riCoverage: number
  spCoverage: number
  anomalies: Array<{ date: string; amount: number; reason: string }>
}

interface Filters {
  payerAccounts: string[]
  accountNames: string[]
  linkedAccountIds: string[]
  chargeType: string[]
  regions: string[]
}

// Custom Multi-Select Dropdown Component
function MultiSelectDropdown({ 
  label, 
  options, 
  selected, 
  onChange 
}: { 
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B7D3F] bg-white text-gray-900 text-left flex justify-between items-center hover:border-[#1B7D3F] transition-colors"
      >
        <span className="text-sm">
          {selected.length === 0 ? 'Select...' : `${selected.length} selected`}
        </span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {options.map(option => (
            <label
              key={option}
              className="flex items-center px-4 py-2 hover:bg-[#1B7D3F]/5 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-4 h-4 text-[#1B7D3F] rounded focus:ring-2 focus:ring-[#1B7D3F] cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'billing' | 'risp' | 'trends'>('billing')
  const [filters, setFilters] = useState<Filters>({
    payerAccounts: [],
    accountNames: [],
    linkedAccountIds: [],
    chargeType: [],
    regions: []
  })

  // Filter options
  const filterOptions = {
    payerAccounts: ['123456789012', '210987654321', '345678901234'],
    accountNames: ['Production', 'Development', 'Staging', 'Testing'],
    linkedAccountIds: ['acc-001', 'acc-002', 'acc-003', 'acc-004'],
    chargeType: ['Usage', 'Tax', 'Support', 'Refund'],
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-southeast-1']
  }

  // Load filters from URL
  useEffect(() => {
    if (router.isReady) {
      const queryFilters: Filters = {
        payerAccounts: router.query.payerAccounts ? (Array.isArray(router.query.payerAccounts) ? router.query.payerAccounts : [router.query.payerAccounts as string]) : [],
        accountNames: router.query.accountNames ? (Array.isArray(router.query.accountNames) ? router.query.accountNames : [router.query.accountNames as string]) : [],
        linkedAccountIds: router.query.linkedAccountIds ? (Array.isArray(router.query.linkedAccountIds) ? router.query.linkedAccountIds : [router.query.linkedAccountIds as string]) : [],
        chargeType: router.query.chargeType ? (Array.isArray(router.query.chargeType) ? router.query.chargeType : [router.query.chargeType as string]) : [],
        regions: router.query.regions ? (Array.isArray(router.query.regions) ? router.query.regions : [router.query.regions as string]) : []
      }
      setFilters(queryFilters)
    }
  }, [router.isReady, router.query])

  // Update filters and URL
  const updateFilters = (filterKey: keyof Filters, value: string) => {
    setFilters(prev => {
      const updated = { ...prev }
      if (updated[filterKey].includes(value)) {
        updated[filterKey] = updated[filterKey].filter(item => item !== value)
      } else {
        updated[filterKey] = [...updated[filterKey], value]
      }
      
      const query: any = {}
      Object.entries(updated).forEach(([key, values]) => {
        if (values.length > 0) {
          query[key] = values.length === 1 ? values[0] : values
        }
      })
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true })
      return updated
    })
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      payerAccounts: [],
      accountNames: [],
      linkedAccountIds: [],
      chargeType: [],
      regions: []
    })
    router.push(router.pathname, undefined, { shallow: true })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/billing-metrics')
        const result = await response.json()
        setData({
          ...result.data,
          riCoverage: 65,
          spCoverage: 25,
          anomalies: [
            { date: 'Feb 15, 2026', amount: 850, reason: 'Spike in EC2 usage' },
            { date: 'Feb 20, 2026', amount: 1200, reason: 'Data transfer increase' },
            { date: 'Feb 25, 2026', amount: 1330, reason: 'RDS backup operations' }
          ]
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setData({
          invoiceThreeMonthsAgo: 1010,
          invoiceTwoMonthsAgo: 1650,
          invoicePreviousMonth: 3380,
          totalAccountsPreviousMonth: 1,
          totalServicesPreviousMonth: 56,
          monthlyTrend: [
            { month: 'Dec 2025', amount: 1010 },
            { month: 'Jan 2026', amount: 1650 },
            { month: 'Feb 2026', amount: 3380 }
          ],
          serviceBreakdown: [
            { service: 'EC2', cost: 1200 },
            { service: 'S3', cost: 800 },
            { service: 'RDS', cost: 600 },
            { service: 'Lambda', cost: 400 },
            { service: 'Others', cost: 380 }
          ],
          regionBreakdown: [
            { region: 'ap-south-1', cost: 1500 },
            { region: 'us-east-1', cost: 1200 },
            { region: 'eu-north-1', cost: 400 },
            { region: 'us-west-2', cost: 280 }
          ],
          savingsData: {
            riSavings: 450,
            savingsPlans: 320,
            spotSavings: 180,
            credits: 100,
            refunds: 50
          },
          riCoverage: 65,
          spCoverage: 25,
          anomalies: [
            { date: 'Feb 15, 2026', amount: 850, reason: 'Spike in EC2 usage' },
            { date: 'Feb 20, 2026', amount: 1200, reason: 'Data transfer increase' },
            { date: 'Feb 25, 2026', amount: 1330, reason: 'RDS backup operations' }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const COLORS = ['#1B7D3F', '#2BA84F', '#155E31', '#0F5C2E', '#0A4620']

  const BillingDetailModal = ({ card, onClose }: { card: string | null; onClose: () => void }) => {
    if (!card || !data) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 border border-gray-200 my-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              {card === 'invoice3m' && '📊 Invoice 3 Months Ago'}
              {card === 'invoice2m' && '📊 Invoice 2 Months Ago'}
              {card === 'invoice1m' && '📊 Invoice Previous Month'}
              {card === 'accounts' && '👥 Total Accounts'}
              {card === 'services' && '🔧 Total Services'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-5xl transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {card === 'invoice3m' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Total Amount</p>
                    <p className="text-4xl font-bold text-white">{formatCurrency(data.invoiceThreeMonthsAgo)}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Services</p>
                    <p className="text-4xl font-bold text-white">{data.totalServicesPreviousMonth}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#155E31] to-[#0F5C2E] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Accounts</p>
                    <p className="text-4xl font-bold text-white">{data.totalAccountsPreviousMonth}</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-bold text-gray-900 mb-4">Service Breakdown</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={data.serviceBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${formatCurrency(value as number)}`} outerRadius={80} fill="#8884d8" dataKey="cost" nameKey="service">
                        {data.serviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {card === 'invoice2m' && (
              <>
                <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                  <p className="text-sm font-semibold text-white mb-2">Total Amount</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(data.invoiceTwoMonthsAgo)}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-bold text-gray-900 mb-4">Monthly Trend</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="amount" stroke="#1B7D3F" strokeWidth={3} dot={{ fill: '#1B7D3F', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {card === 'invoice1m' && (
              <>
                <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                  <p className="text-sm font-semibold text-white mb-2">Total Amount</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(data.invoicePreviousMonth)}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-bold text-gray-900 mb-4">Region Breakdown</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.regionBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="cost" fill="#1B7D3F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {card === 'accounts' && (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-lg font-bold text-gray-900 mb-4">Account Details</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-800">Primary Account</span>
                    <span className="text-lg font-bold text-[#1B7D3F]">{formatCurrency(data.invoicePreviousMonth)}</span>
                  </div>
                </div>
              </div>
            )}

            {card === 'services' && (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-lg font-bold text-gray-900 mb-4">Top Services</p>
                <div className="space-y-3">
                  {data.serviceBreakdown.map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                      <span className="font-semibold text-gray-800">{service.service}</span>
                      <span className="text-lg font-bold text-[#1B7D3F]">{formatCurrency(service.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Cloud Financial Command Center</h1>
            <p className="text-gray-600 text-lg font-medium mt-2">Loading dashboard analytics...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Cloud Financial Command Center</h1>
          <p className="text-gray-600 text-lg font-medium mt-2">Comprehensive cloud cost analytics and billing insights</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🔍 Filters & Controls</h3>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-semibold text-sm"
            >
              ↻ Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <MultiSelectDropdown
              label="Payer Accounts"
              options={filterOptions.payerAccounts}
              selected={filters.payerAccounts}
              onChange={(values) => {
                setFilters(prev => {
                  const updated = { ...prev, payerAccounts: values }
                  const query: any = {}
                  Object.entries(updated).forEach(([key, vals]) => {
                    if ((vals as string[]).length > 0) {
                      query[key] = (vals as string[]).length === 1 ? (vals as string[])[0] : vals
                    }
                  })
                  router.push({ pathname: router.pathname, query }, undefined, { shallow: true })
                  return updated
                })
              }}
            />

            <MultiSelectDropdown
              label="Account Names"
              options={filterOptions.accountNames}
              selected={filters.accountNames}
              onChange={(values) => {
                setFilters(prev => {
                  const updated = { ...prev, accountNames: values }
                  const query: any = {}
                  Object.entries(updated).forEach(([key, vals]) => {
                    if ((vals as string[]).length > 0) {
                      query[key] = (vals as string[]).length === 1 ? (vals as string[])[0] : vals
                    }
                  })
                  router.push({ pathname: router.pathname, query }, undefined, { shallow: true })
                  return updated
                })
              }}
            />

            <MultiSelectDropdown
              label="Linked Account IDs"
              options={filterOptions.linkedAccountIds}
              selected={filters.linkedAccountIds}
              onChange={(values) => {
                setFilters(prev => {
                  const updated = { ...prev, linkedAccountIds: values }
                  const query: any = {}
                  Object.entries(updated).forEach(([key, vals]) => {
                    if ((vals as string[]).length > 0) {
                      query[key] = (vals as string[]).length === 1 ? (vals as string[])[0] : vals
                    }
                  })
                  router.push({ pathname: router.pathname, query }, undefined, { shallow: true })
                  return updated
                })
              }}
            />

            <MultiSelectDropdown
              label="Charge Type"
              options={filterOptions.chargeType}
              selected={filters.chargeType}
              onChange={(values) => {
                setFilters(prev => {
                  const updated = { ...prev, chargeType: values }
                  const query: any = {}
                  Object.entries(updated).forEach(([key, vals]) => {
                    if ((vals as string[]).length > 0) {
                      query[key] = (vals as string[]).length === 1 ? (vals as string[])[0] : vals
                    }
                  })
                  router.push({ pathname: router.pathname, query }, undefined, { shallow: true })
                  return updated
                })
              }}
            />

            <MultiSelectDropdown
              label="Regions"
              options={filterOptions.regions}
              selected={filters.regions}
              onChange={(values) => {
                setFilters(prev => {
                  const updated = { ...prev, regions: values }
                  const query: any = {}
                  Object.entries(updated).forEach(([key, vals]) => {
                    if ((vals as string[]).length > 0) {
                      query[key] = (vals as string[]).length === 1 ? (vals as string[])[0] : vals
                    }
                  })
                  router.push({ pathname: router.pathname, query }, undefined, { shallow: true })
                  return updated
                })
              }}
            />
          </div>

          {/* Active Filters Display */}
          {(filters.payerAccounts.length > 0 || filters.accountNames.length > 0 || filters.linkedAccountIds.length > 0 || filters.chargeType.length > 0 || filters.regions.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.payerAccounts.map(acc => <span key={acc} className="px-3 py-1 bg-[#1B7D3F]/10 text-[#1B7D3F] rounded-full text-sm font-medium">Payer: {acc}</span>)}
                {filters.accountNames.map(name => <span key={name} className="px-3 py-1 bg-[#1B7D3F]/10 text-[#1B7D3F] rounded-full text-sm font-medium">Account: {name}</span>)}
                {filters.linkedAccountIds.map(id => <span key={id} className="px-3 py-1 bg-[#1B7D3F]/10 text-[#1B7D3F] rounded-full text-sm font-medium">ID: {id}</span>)}
                {filters.chargeType.map(type => <span key={type} className="px-3 py-1 bg-[#1B7D3F]/10 text-[#1B7D3F] rounded-full text-sm font-medium">Type: {type}</span>)}
                {filters.regions.map(region => <span key={region} className="px-3 py-1 bg-[#1B7D3F]/10 text-[#1B7D3F] rounded-full text-sm font-medium">Region: {region}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'billing'
                ? 'text-[#1B7D3F] border-b-2 border-[#1B7D3F]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💰 Billing Overview
          </button>
          <button
            onClick={() => setActiveTab('risp')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'risp'
                ? 'text-[#1B7D3F] border-b-2 border-[#1B7D3F]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 RI/SP Summary
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'trends'
                ? 'text-[#1B7D3F] border-b-2 border-[#1B7D3F]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 Trends & Forecast
          </button>
        </div>

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-8">
            {/* Billing Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Billing Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div
                  onClick={() => setExpandedCard('invoice3m')}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice 3M Ago</p>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.invoiceThreeMonthsAgo)}</p>
                  <p className="text-xs text-gray-500 mt-2">Click to expand</p>
                </div>

                <div
                  onClick={() => setExpandedCard('invoice2m')}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice 2M Ago</p>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.invoiceTwoMonthsAgo)}</p>
                  <p className="text-xs text-gray-500 mt-2">Click to expand</p>
                </div>

                <div
                  onClick={() => setExpandedCard('invoice1m')}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice Prev Month</p>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.invoicePreviousMonth)}</p>
                  <p className="text-xs text-gray-500 mt-2">Click to expand</p>
                </div>

                <div
                  onClick={() => setExpandedCard('accounts')}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Accounts</p>
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{data.totalAccountsPreviousMonth}</p>
                  <p className="text-xs text-gray-500 mt-2">Click to expand</p>
                </div>

                <div
                  onClick={() => setExpandedCard('services')}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Services</p>
                    <span className="text-2xl">🔧</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{data.totalServicesPreviousMonth}</p>
                  <p className="text-xs text-gray-500 mt-2">Click to expand</p>
                </div>
              </div>
            </div>

            {/* Spend Trends */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Spend Trends</h2>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#1B7D3F" strokeWidth={3} dot={{ fill: '#1B7D3F', r: 8 }} name="Monthly Spend" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service & Region Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">🔧 Service Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data.serviceBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name }) => name} outerRadius={80} fill="#8884d8" dataKey="cost" nameKey="service">
                      {data.serviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">🌍 Region Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.regionBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="cost" fill="#1B7D3F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Savings Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💚 Savings & Discounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-wide mb-2">RI Savings</p>
                  <p className="text-3xl font-bold">{formatCurrency(data.savingsData.riSavings)}</p>
                </div>
                <div className="bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-wide mb-2">Savings Plans</p>
                  <p className="text-3xl font-bold">{formatCurrency(data.savingsData.savingsPlans)}</p>
                </div>
                <div className="bg-gradient-to-br from-[#155E31] to-[#0F5C2E] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-wide mb-2">Spot Savings</p>
                  <p className="text-3xl font-bold">{formatCurrency(data.savingsData.spotSavings)}</p>
                </div>
                <div className="bg-gradient-to-br from-[#1B7D3F] to-[#0F5C2E] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-wide mb-2">Credits</p>
                  <p className="text-3xl font-bold">{formatCurrency(data.savingsData.credits)}</p>
                </div>
                <div className="bg-gradient-to-br from-[#2BA84F] to-[#155E31] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-wide mb-2">Refunds</p>
                  <p className="text-3xl font-bold">{formatCurrency(data.savingsData.refunds)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RI/SP Tab */}
        {activeTab === 'risp' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-wide mb-2">RI Coverage</p>
                <p className="text-4xl font-bold">{data.riCoverage}%</p>
              </div>
              <div className="bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-wide mb-2">SP Coverage</p>
                <p className="text-4xl font-bold">{data.spCoverage}%</p>
              </div>
              <div className="bg-gradient-to-br from-[#155E31] to-[#0F5C2E] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-wide mb-2">Total Savings</p>
                <p className="text-4xl font-bold">{formatCurrency(data.savingsData.riSavings + data.savingsData.savingsPlans)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#1B7D3F] to-[#0F5C2E] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-wide mb-2">Combined Coverage</p>
                <p className="text-4xl font-bold">{data.riCoverage + data.spCoverage}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Cost Anomalies</h3>
              <div className="space-y-3">
                {data.anomalies.map((anomaly, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-semibold text-gray-900">{anomaly.date}</p>
                      <p className="text-sm text-gray-600">{anomaly.reason}</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(anomaly.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-gradient-to-r from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl border border-[#1B7D3F]/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Insights</h3>
          <p className="text-gray-700 leading-relaxed">
            Your cloud spend shows a growth trend with significant increases month-over-month. Consider optimizing your Reserved Instance coverage 
            and evaluating Savings Plans for predictable workloads to maximize cost efficiency. Multiple cost anomalies detected - review workload scaling.
          </p>
        </div>
      </div>

      {expandedCard && <BillingDetailModal card={expandedCard} onClose={() => setExpandedCard(null)} />}
    </Layout>
  )
}

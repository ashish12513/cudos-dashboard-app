import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Account {
  id: string
  name: string
  email: string
  status: string
}

interface AccountSelectorProps {
  selectedAccount: string
  onAccountChange: (accountId: string) => void
  accounts: Account[]
}

function AccountSelector({ selectedAccount, onAccountChange, accounts }: AccountSelectorProps) {
  return (
    <div className="relative">
      <select
        value={selectedAccount}
        onChange={(e) => onAccountChange(e.target.value)}
        className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 shadow-sm"
      >
        <option value="all">All Accounts</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} ({account.id})
          </option>
        ))}
      </select>
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/organizations/list-accounts')
        const data = await response.json()
        if (data.success) {
          setAccounts(data.data.accounts.all)
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId)
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedAccount', accountId)
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('accountChanged', { detail: accountId }))
    }
  }

  // Load selected account from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedAccount')
      if (saved) {
        setSelectedAccount(saved)
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '💼', color: 'from-purple-500 to-pink-600' },
    { name: 'Overview', href: '/overview', icon: '📊', color: 'from-blue-500 to-indigo-600' },
    { name: 'Usage', href: '/usage', icon: '📈', color: 'from-emerald-500 to-teal-600' },
    { name: 'Compute', href: '/compute', icon: '🖥️', color: 'from-amber-500 to-orange-600' },
    { name: 'Trends', href: '/trends', icon: '📉', color: 'from-rose-500 to-red-600' },
    { name: 'Security', href: '/security', icon: '🛡️', color: 'from-violet-500 to-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Premium Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 premium-glass border-r border-white/20 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Premium Logo */}
          <div className="flex items-center justify-center h-24 px-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center shadow-lg premium-glow">
                <span className="text-white font-bold text-2xl">💰</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold premium-text-gradient tracking-tight">Cloud Financial</h1>
                <p className="text-xs text-gray-500 font-medium tracking-wider uppercase mt-1">Command Center</p>
              </div>
            </div>
          </div>

          {/* Premium Account Selector */}
          <div className="px-8 py-6 border-b border-white/10">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              AWS Account
            </label>
            {!loading && (
              <AccountSelector
                selectedAccount={selectedAccount}
                onAccountChange={handleAccountChange}
                accounts={accounts}
              />
            )}
            {loading && (
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl px-4 py-3 animate-pulse">
                <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg premium-loading"></div>
              </div>
            )}
            {accounts.length > 1 && (
              <p className="text-xs text-gray-500 mt-3 font-medium">
                {accounts.length} accounts available
              </p>
            )}
          </div>

          {/* Premium Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-2">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-xl transform -translate-x-1`
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : `bg-gradient-to-r ${item.color} group-hover:scale-110`
                  }`}>
                    <span className={`text-lg ${isActive ? 'text-white' : 'text-white'}`}>{item.icon}</span>
                  </div>
                  <span className={`font-semibold tracking-wide ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Premium User section */}
          <div className="px-8 py-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 premium-gradient rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-base">A</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500 font-medium">Cost Analyst</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:text-red-600 hover:from-red-50 hover:to-red-100 transition-all duration-300 shadow-sm hover:shadow-md"
                title="Logout"
              >
                <span className="text-lg">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-80">
        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  )
}
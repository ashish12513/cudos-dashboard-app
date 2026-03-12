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
        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full"
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
    { name: 'Overview', href: '/overview', icon: '📊' },
    { name: 'Dashboard', href: '/dashboard', icon: '💼' },
    { name: 'Usage', href: '/usage', icon: '📈' },
    { name: 'Compute', href: '/compute', icon: '🖥️' },
    { name: 'Trends', href: '/trends', icon: '📉' },
    { name: 'Security', href: '/security', icon: '🛡️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-gray-700 to-gray-800">
            <h1 className="text-xl font-bold text-white">Vision 360</h1>
          </div>

          {/* Account Selector */}
          <div className="px-4 py-4 border-b border-gray-700">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
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
              <div className="bg-gray-700 rounded-lg px-3 py-2 animate-pulse">
                <div className="h-4 bg-gray-600 rounded"></div>
              </div>
            )}
            {accounts.length > 1 && (
              <p className="text-xs text-gray-400 mt-1">
                {accounts.length} accounts available
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">👤</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-gray-400">Cost Analyst</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'Usage', href: '/usage', icon: '📈' },
    { name: 'Compute', href: '/compute', icon: '🖥️' },
    { name: 'Trends', href: '/trends', icon: '📉' },
    { name: 'Security', href: '/security', icon: '🔒' },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">
            {process.env.NEXT_PUBLIC_APP_NAME}
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            ☰
          </button>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                router.pathname === item.href
                  ? 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-800 border-r-4 border-slate-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                ☰
              </button>
            )}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back!</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
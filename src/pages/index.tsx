import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard or login based on auth status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        if (response.ok) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}
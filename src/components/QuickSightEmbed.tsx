import { useEffect, useRef, useState } from 'react'

interface QuickSightEmbedProps {
  dashboardId: string
  title?: string
  height?: string
  parameters?: Record<string, any>
}

export default function QuickSightEmbed({ 
  dashboardId, 
  title = 'Analytics Dashboard',
  height = '600px',
  parameters = {}
}: QuickSightEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [embedUrl, setEmbedUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchEmbedUrl = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Try registered user embedding with parameters
        const response = await fetch('/api/quicksight/embed-registered', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            dashboardId,
            parameters 
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate embed URL')
        }

        const data = await response.json()
        setEmbedUrl(data.embedUrl)
      } catch (err) {
        console.error('Embed error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEmbedUrl()
  }, [dashboardId, parameters])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="text-sm text-gray-400">
            <p>This might be because:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>QuickSight requires Enterprise edition for anonymous embedding</li>
              <li>Dashboard permissions need to be configured</li>
              <li>User needs to be registered in QuickSight</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {Object.keys(parameters).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(parameters).map(([key, value]) => (
              <span 
                key={key}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-6">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          width="100%"
          height={height}
          frameBorder="0"
          allowFullScreen
          className="rounded-lg"
          title={title}
        />
      </div>
    </div>
  )
}
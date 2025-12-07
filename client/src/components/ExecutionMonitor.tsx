import { useState, useEffect } from 'react'
import { X, Minus, ChevronDown, Play, Pause, Square, CheckCircle, XCircle, Clock, Loader2, Brain, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/simpleAuthStore'

interface ExecutionEvent {
  type: string
  executionId: string
  timestamp: Date
  stepName?: string
  stepNumber?: number
  totalSteps?: number
  status?: string
  agentInteraction?: {
    prompt: string
    response: string
    model: string
  }
  input?: any
  output?: any
  error?: string
  message?: string
}

export function ExecutionMonitor() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [currentExecution, setCurrentExecution] = useState<string | null>(null)
  const [events, setEvents] = useState<ExecutionEvent[]>([])
  const [totalSteps, setTotalSteps] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) return

    let eventSource: EventSource | null = null

    const connectSSE = () => {
      const userId = getCurrentUserId()
      if (!userId) {
        console.warn('Cannot connect to SSE: user not authenticated')
        return
      }
      try {
        eventSource = new EventSource(`/api/sse?userId=${userId}`)

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleSSEEvent(data)
          } catch (error) {
            console.error('Failed to parse SSE event:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error)
          setIsConnected(false)

          // Reconnect after 3 seconds
          setTimeout(connectSSE, 3000)
        }

        eventSource.onopen = () => {
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to connect to SSE:', error)
        setIsConnected(false)
      }
    }

    connectSSE()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [token])

  const getCurrentUserId = () => {
    // Extract user ID from token
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId || null
    } catch {
      return null
    }
  }

  const handleSSEEvent = (data: ExecutionEvent) => {
    const eventWithTimestamp = {
      ...data,
      timestamp: new Date(),
    }

    setEvents(prev => {
      // Keep last 100 events to prevent memory issues
      const newEvents = [eventWithTimestamp, ...prev]
      return newEvents.slice(0, 100)
    })

    // Handle specific event types
    switch (data.type) {
      case 'execution_start':
        setCurrentExecution(data.executionId)
        setTotalSteps(data.totalSteps || 0)
        setCurrentStep(0)
        break
      case 'step_complete':
        setCurrentStep(prev => prev + 1)
        break
      case 'execution_complete':
      case 'execution_error':
        setCurrentExecution(null)
        break
    }
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleClose = () => {
    setEvents([])
    setCurrentExecution(null)
    setCurrentStep(0)
    setTotalSteps(0)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'execution_start':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'execution_complete':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'execution_error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'agent_start':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'agent_complete':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800'
      case 'agent_error':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-2">
          {currentExecution ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm text-gray-600">
            {currentExecution ? '执行中...' : '执行监控'}
          </span>
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ${
        isExpanded ? 'w-96 max-h-[600px]' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="relative">
            {isConnected ? (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            ) : (
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900">执行监控</h3>
          {currentExecution && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              运行中
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleExpand}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <Minus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {currentExecution && totalSteps > 0 && (
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>执行进度</span>
            <span>{currentStep}/{totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="overflow-y-auto p-3" style={{ maxHeight: isExpanded ? '400px' : '300px' }}>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">暂无执行活动</p>
            <p className="text-xs mt-1">执行工作流时将显示实时日志</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event, index) => (
              <div
                key={`${event.executionId}-${index}`}
                className={`p-2 rounded border text-xs ${getEventColor(event.type)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">
                    {event.stepName || event.message || event.type.replace('_', ' ')}
                  </span>
                  <span className="opacity-75">
                    {formatTime(event.timestamp)}
                  </span>
                </div>

                {/* Agent Interaction */}
                {event.agentInteraction && (
                  <div className="mt-2 space-y-1">
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <Brain className="w-3 h-3" />
                        <span className="font-medium">AI 交互</span>
                        <span className="opacity-75">{event.agentInteraction.model}</span>
                      </div>
                      <div className="text-xs opacity-90">
                        <div className="mb-1">
                          <strong>提示:</strong> {event.agentInteraction.prompt.substring(0, 100)}
                          {event.agentInteraction.prompt.length > 100 && '...'}
                        </div>
                        <div>
                          <strong>响应:</strong> {event.agentInteraction.response.substring(0, 100)}
                          {event.agentInteraction.response.length > 100 && '...'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {event.error && (
                  <div className="mt-1 text-xs text-red-700 bg-red-100 bg-opacity-50 rounded p-2">
                    <strong>错误:</strong> {event.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
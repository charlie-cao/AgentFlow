import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Play, Calendar, MessageSquare } from 'lucide-react'

export interface TriggerNodeData {
  label: string
  triggerType: 'manual' | 'schedule' | 'webhook'
  config?: Record<string, any>
}

const triggerIcons = {
  manual: Play,
  schedule: Calendar,
  webhook: MessageSquare,
}

export const TriggerNode = memo(({ data, selected }: NodeProps<TriggerNodeData>) => {
  const Icon = triggerIcons[data.triggerType]

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-blue-50 min-w-[180px] transition-all ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-blue-300'
      }`}
    >
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-blue-400 bg-white"
      />

      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {data.label}
          </div>
          <div className="text-xs text-gray-500 mt-1 capitalize">
            {data.triggerType === 'manual' && '手动触发'}
            {data.triggerType === 'schedule' && '定时触发'}
            {data.triggerType === 'webhook' && 'Webhook 触发'}
          </div>
        </div>
      </div>
    </div>
  )
})

TriggerNode.displayName = 'TriggerNode'
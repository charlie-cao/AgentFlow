import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Bot, Settings } from 'lucide-react'

export interface AgentNodeData {
  label: string
  agentId?: string
  config?: Record<string, any>
  onEdit?: () => void
}

export const AgentNode = memo(({ data, selected }: NodeProps<AgentNodeData>) => {
  const handleNodeClick = () => {
    // TODO: 打开节点编辑器
    console.log('Edit node:', data)
  }

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white min-w-[200px] cursor-pointer transition-all ${
        selected
          ? 'border-purple-500 ring-2 ring-purple-200'
          : 'border-gray-300 hover:border-purple-400'
      }`}
      onClick={handleNodeClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-gray-400 bg-white"
      />

      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Bot className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {data.label}
          </div>
          {data.agentId ? (
            <div className="text-xs text-gray-500 mt-1">
              Agent: {data.agentId}
            </div>
          ) : (
            <div className="text-xs text-orange-500 mt-1">
              未配置 Agent
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleNodeClick()
          }}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <Settings className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-gray-400 bg-white"
      />
    </div>
  )
})

AgentNode.displayName = 'AgentNode'
import { useState } from 'react'
import {
  Bot,
  Plus,
  Play,
  Calendar,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'

interface ToolbarProps {
  onAddNode: (type: string) => void
}

export function Toolbar({ onAddNode }: ToolbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const nodeTypes = [
    {
      type: 'agent',
      label: 'Agent 节点',
      icon: Bot,
      description: '执行 AI 任务的智能代理',
    },
    {
      type: 'trigger-schedule',
      label: '定时触发',
      icon: Calendar,
      description: '按设定时间自动触发',
    },
    {
      type: 'trigger-webhook',
      label: 'Webhook',
      icon: MessageSquare,
      description: '通过 HTTP 请求触发',
    },
  ]

  return (
    <div className="w-64 bg-white border-r p-4">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">节点库</h3>

        {/* Quick Add Button */}
        <button
          onClick={() => onAddNode('agent')}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加 Agent
        </button>
      </div>

      {/* Node Types */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          所有节点
        </h4>

        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon
          return (
            <div key={nodeType.type} className="group">
              <button
                onClick={() => onAddNode(nodeType.type)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-1.5 bg-gray-100 rounded group-hover:bg-gray-200 transition-colors">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {nodeType.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {nodeType.description}
                  </p>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Templates Section */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          模板
        </h4>

        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            文档处理流水线
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            数据分析流程
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            内容生成器
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          帮助
        </h4>
        <p className="text-xs text-gray-600">
          拖拽节点到画布上开始构建您的工作流。点击节点可以配置其属性。
        </p>
      </div>
    </div>
  )
}
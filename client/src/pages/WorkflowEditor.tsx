import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
} from 'reactflow'
import { Play, Save, Settings, Bot, ArrowLeft, Sparkles, Zap } from 'lucide-react'

import 'reactflow/dist/style.css'
import { AgentNode } from '@/components/workflow/AgentNode'
import { TriggerNode } from '@/components/workflow/TriggerNode'
import { Toolbar } from '@/components/workflow/Toolbar'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useAuthStore } from '@/stores/simpleAuthStore'
import { ExecutionMonitor } from '@/components/ExecutionMonitor'

const nodeTypes = {
  agent: AgentNode,
  trigger: TriggerNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: {
      label: '开始',
      triggerType: 'manual',
    },
  },
]

const initialEdges: Edge[] = []

export function WorkflowEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isExecuting, setIsExecuting] = useState(false)
  const [workflowName, setWorkflowName] = useState('未命名工作流')
  const [showRequirementDialog, setShowRequirementDialog] = useState(false)
  const [requirement, setRequirement] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [executionId, setExecutionId] = useState<string | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleSave = async () => {
    console.log('保存工作流', { nodes, edges, name: workflowName })
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    try {
      const workflowDefinition = {
        nodes,
        edges,
        metadata: {
          version: '1.0.0',
          description: workflowName,
        },
      }

      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          workflow: workflowDefinition,
          context: { timestamp: new Date().toISOString() },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setExecutionId(data.data.executionId)
      } else {
        throw new Error(data.error?.message || '执行失败')
      }
    } catch (error) {
      console.error('执行失败:', error)
      alert(`执行失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleAutoGenerate = async () => {
    const trimmedRequirement = requirement.trim()
    
    if (!trimmedRequirement) {
      alert('请输入您的需求描述')
      return
    }

    if (trimmedRequirement.length < 5) {
      alert('需求描述至少需要 5 个字符，请提供更详细的描述')
      return
    }

    if (trimmedRequirement.length > 1000) {
      alert('需求描述不能超过 1000 个字符，请精简您的描述')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/workflows/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requirement: trimmedRequirement }),
      })

      const data = await response.json()

      if (data.success) {
        // 使用生成的工作流替换当前工作流
        setNodes(data.data.workflow.nodes)
        setEdges(data.data.workflow.edges)
        setWorkflowName(`AI生成: ${trimmedRequirement.substring(0, 20)}...`)

        alert(`✅ 已为您生成工作流！\n\n${data.data.explanation}`)
        setShowRequirementDialog(false)
        setRequirement('')
      } else {
        // 处理验证错误
        let errorMessage = '分析失败'
        if (data.error?.issues && Array.isArray(data.error.issues)) {
          const firstIssue = data.error.issues[0]
          if (firstIssue.path.includes('requirement')) {
            errorMessage = firstIssue.message || '需求描述不符合要求，请检查后重试'
          }
        } else if (data.error?.message) {
          errorMessage = data.error.message
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('分析失败:', error)
      alert(`分析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddNode = (type: string) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: type === 'agent' ? 'agent' : 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: type === 'agent' ? '新 Agent' : '新节点',
        ...(type === 'agent' && {
          agentId: '',
          config: {},
        }),
      },
    }
    setNodes((nds) => nds.concat(newNode))
  }

  return (
    <div className="h-full w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-medium bg-transparent border-none outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRequirementDialog(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded-md hover:bg-purple-200 transition-colors"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI 生成
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || nodes.length === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isExecuting ? '执行中...' : '执行'}
          </button>
        </div>
      </div>

      {/* Requirement Dialog */}
      {showRequirementDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">AI 智能生成工作流</h3>
            <p className="text-sm text-gray-600 mb-4">
              描述您的需求，AI 将自动分析并生成合适的工作流
            </p>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="例如：我需要一个自动化文档处理系统，能够接收PDF文件，提取关键信息，并生成摘要报告。"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowRequirementDialog(false)
                  setRequirement('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAutoGenerate}
                disabled={isAnalyzing || !requirement.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isAnalyzing ? '分析中...' : '生成工作流'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <Toolbar onAddNode={handleAddNode} />

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls position="bottom-right" />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'trigger') return '#3b82f6'
                if (node.type === 'agent') return '#8b5cf6'
                return '#6b7280'
              }}
              position="bottom-left"
            />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">属性面板</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                节点信息
              </label>
              <p className="text-sm text-gray-500">
                选择一个节点以查看和编辑其属性
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">快捷提示</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 从左侧拖拽节点到画布</li>
                <li>• 点击节点边缘的连接点连接节点</li>
                <li>• 双击节点编辑属性</li>
                <li>• 使用鼠标滚轮缩放画布</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Monitor */}
      <ExecutionMonitor />
    </div>
  )
}
import { Link } from 'react-router-dom'
import { Plus, Activity, Bot, Clock, ChevronRight } from 'lucide-react'

export function Dashboard() {
  // 模拟数据
  const recentWorkflows = [
    { id: '1', name: '文档处理流水线', lastRun: '2小时前', status: 'completed' },
    { id: '2', name: '客户数据分析', lastRun: '5小时前', status: 'running' },
    { id: '3', name: '营销内容生成', lastRun: '1天前', status: 'failed' },
  ]

  const stats = [
    { name: '工作流总数', value: '12', icon: Activity, color: 'bg-blue-500' },
    { name: '运行中的任务', value: '3', icon: Clock, color: 'bg-green-500' },
    { name: '可用 Agent', value: '8', icon: Bot, color: 'bg-purple-500' },
    { name: '本月执行', value: '234', icon: Activity, color: 'bg-orange-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">仪表板</h1>
        <p className="mt-2 text-gray-600">管理和监控您的 AI 工作流</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workflows */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">最近的工作流</h2>
              <Link
                to="/workflows"
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
              >
                查看全部
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {recentWorkflows.map((workflow) => (
                <div key={workflow.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to={`/workflows/${workflow.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {workflow.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">最后运行: {workflow.lastRun}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          workflow.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : workflow.status === 'running'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {workflow.status === 'completed' && '已完成'}
                        {workflow.status === 'running' && '运行中'}
                        {workflow.status === 'failed' && '失败'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link
                to="/workflows/new"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                创建新工作流
              </Link>

              <Link
                to="/agents/new"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Bot className="h-5 w-5 mr-2" />
                创建新 Agent
              </Link>
            </div>
          </div>

          {/* Help Card */}
          <div className="mt-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h3 className="text-lg font-medium mb-2">需要帮助？</h3>
            <p className="text-sm text-blue-100 mb-4">
              查看我们的文档和教程，快速上手 AgentFlow
            </p>
            <a
              href="#"
              className="inline-flex items-center text-sm font-medium text-white hover:text-blue-100"
            >
              查看文档
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
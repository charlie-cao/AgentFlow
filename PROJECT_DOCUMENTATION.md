# AgentFlow 项目文档总结

## 📖 项目概述

**AgentFlow** 是一个基于 Bun.js 和本地 Ollama 的多智能体工作流平台，旨在帮助用户通过可视化界面构建、管理和执行复杂的 AI 工作流。

### 核心价值

- 🚀 **高性能**: 基于 Bun.js 运行时，提供极致的性能和开发体验
- 🤖 **AI 驱动**: 集成本地 Ollama 大模型，支持 AI 自动生成工作流
- 🎨 **可视化编辑**: React Flow 可视化编辑器，直观创建工作流
- ⚡ **实时监控**: SSE 实时通信，实时查看执行状态
- 🔄 **并发执行**: 支持多 Agent 并发执行，提高效率

## 🏗️ 技术架构

### 后端技术栈

- **运行时**: Bun.js - 超高性能 JavaScript 运行时
- **Web 框架**: Hono - 轻量级、高性能 Web 框架
- **数据库**: 
  - SQLite (默认) - 轻量级本地数据库
  - Supabase (可选) - 云数据库和认证服务
- **ORM**: Drizzle ORM - 类型安全的 ORM
- **认证**: JWT - JSON Web Token 身份认证
- **实时通信**: SSE (Server-Sent Events) - 服务器推送事件

### 前端技术栈

- **框架**: React 18 + TypeScript
- **路由**: React Router
- **UI 库**: Tailwind CSS
- **工作流可视化**: React Flow
- **状态管理**: Zustand
- **图标**: Lucide React

### AI 集成

- **大模型**: Ollama (本地部署)
- **默认模型**: qwen3:latest
- **功能**: 
  - 工作流自动生成
  - Agent 配置生成
  - 文本生成和对话

## ✨ 核心功能

### 1. 用户认证系统 ✅

- 用户注册和登录
- JWT Token 认证
- Token 验证和刷新
- 角色权限管理 (user/admin/viewer)
- SQLite 数据库存储

### 2. 工作流管理 ✅

- 可视化工作流编辑器
- 拖拽式节点编辑
- 节点类型：
  - Trigger (触发节点) - 手动/定时/Webhook
  - Agent (AI 处理节点)
  - Condition (条件分支)
  - Action (操作节点)
- 工作流保存和版本管理
- AI 自动生成工作流

### 3. AI 工作流生成 ✅

- 通过自然语言描述生成工作流
- 自动生成 Agent 配置
- 自动生成节点和连接关系
- 智能提示词生成

### 4. Agent 系统 ✅

- Agent 节点创建和配置
- 多种 Agent 类型支持
- AI 自动生成 Agent 配置
- Agent 模板库
- 自定义 Agent 能力

### 5. 工作流执行 ✅

- 并发执行所有 Agent 节点
- 实时执行状态监控
- SSE 实时事件推送
- 执行日志和调试信息
- 错误处理和重试

### 6. 实时监控 ✅

- SSE 实时通信
- 执行进度实时更新
- Agent 输出实时显示
- 调试面板实时日志
- 多客户端连接支持

### 7. Ollama 集成 ✅

- 本地 Ollama 服务集成
- 模型列表查询
- 文本生成接口
- 对话接口
- 流式输出支持

### 8. Supabase 集成 ✅ (可选)

- 可选的云数据库支持
- 可选的认证服务
- 文件存储支持
- 实时订阅功能

## 📁 项目结构

```
agentflow/
├── src/
│   ├── server/              # 后端代码
│   │   ├── routes/          # API 路由
│   │   │   ├── auth.ts      # 认证路由
│   │   │   ├── workflows-advanced.ts  # 高级工作流路由
│   │   │   ├── ollama.ts    # Ollama 集成路由
│   │   │   ├── sse.ts       # SSE 实时通信路由
│   │   │   └── ...
│   │   ├── services/        # 业务逻辑服务
│   │   │   ├── workflowAnalyzer.ts   # 工作流分析器
│   │   │   ├── workflowExecutor.ts   # 工作流执行器
│   │   │   ├── ollama.ts    # Ollama 客户端
│   │   │   ├── sse.ts       # SSE 服务
│   │   │   └── supabase.ts  # Supabase 客户端
│   │   ├── db/              # 数据库配置
│   │   │   ├── index.ts     # 数据库连接
│   │   │   ├── schema.ts    # 数据模型定义
│   │   │   └── migrate.ts   # 数据库迁移
│   │   ├── middleware/      # 中间件
│   │   │   └── auth.ts      # 认证中间件
│   │   └── utils/           # 工具函数
│   │       ├── auth.ts      # 认证工具
│   │       ├── load-env.ts  # 环境变量加载
│   │       └── logger.ts    # 日志工具
│   ├── client/              # 前端代码
│   │   ├── src/
│   │   │   ├── pages/       # 页面组件
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── WorkflowEditor.tsx
│   │   │   ├── components/  # 组件
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── ExecutionMonitor.tsx
│   │   │   │   └── workflow/
│   │   │   ├── stores/      # 状态管理
│   │   │   │   ├── simpleAuthStore.ts
│   │   │   │   └── workflowStore.ts
│   │   │   └── ...
│   └── shared/              # 共享类型定义
│       └── types/
├── client/                  # 前端项目
├── drizzle/                 # 数据库迁移文件
└── docs/                    # 文档目录
```

## 🔌 API 端点

### 认证 API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/verify` - 验证 Token
- `POST /api/auth/refresh` - 刷新 Token

### 工作流 API

- `POST /api/workflows/analyze` - AI 分析需求并生成工作流
- `POST /api/workflows/execute` - 执行工作流
- `POST /api/workflows/cancel` - 取消执行
- `GET /api/workflows/status/:executionId` - 获取执行状态

### Ollama API

- `GET /api/ollama/models` - 获取模型列表
- `POST /api/ollama/generate` - 生成文本
- `POST /api/ollama/chat` - 对话
- `POST /api/ollama/generate/stream` - 流式生成
- `POST /api/ollama/chat/stream` - 流式对话

### 实时通信 API

- `GET /api/sse?userId=<userId>` - SSE 连接端点

## 📚 文档列表

### 核心文档

- [README.md](./README.md) - 项目主要文档
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - 本文档（项目总结）

### 功能文档

- [WORKFLOW_IMPROVEMENTS_COMPLETED.md](./WORKFLOW_IMPROVEMENTS_COMPLETED.md) - 工作流功能改进总结
- [OLLAMA_CONFIGURATION.md](./OLLAMA_CONFIGURATION.md) - Ollama 配置说明
- [AUTH_SQLITE_CHECK.md](./AUTH_SQLITE_CHECK.md) - 认证系统 SQLite 集成说明

### 集成文档

- [SUPABASE_INSTALLATION_SUMMARY.md](./SUPABASE_INSTALLATION_SUMMARY.md) - Supabase 安装总结
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 完整安装指南
- [SUPABASE_QUICK_START.md](./SUPABASE_QUICK_START.md) - Supabase 快速开始

### 问题解决文档

- [SSE_CONNECTION_FIX.md](./SSE_CONNECTION_FIX.md) - SSE 连接问题修复
- [WORKFLOW_FEATURES_REQUIRED.md](./WORKFLOW_FEATURES_REQUIRED.md) - 工作流功能需求清单

## 🗄️ 数据模型

### 核心实体

1. **Users** - 用户表
   - id, username, email, password_hash, role
   - created_at, updated_at

2. **Projects** - 项目表
   - id, name, description, owner_id, settings
   - created_at, updated_at

3. **Workflows** - 工作流表
   - id, project_id, name, description, definition
   - version, is_active
   - created_at, updated_at

4. **Agents** - Agent 表
   - id, name, type, config, capabilities
   - is_template, created_by
   - created_at, updated_at

5. **Executions** - 执行记录表
   - id, workflow_id, status
   - started_at, completed_at, result, error_message
   - triggered_by, context
   - created_at

6. **ExecutionSteps** - 执行步骤表
   - id, execution_id, agent_id, step_name, status
   - input_data, output_data
   - started_at, completed_at, error_message
   - order_index, duration

## 🚀 快速开始

### 环境要求

- Bun.js >= 1.0
- Ollama (本地安装)
- qwen3:latest 模型

### 安装步骤

1. 克隆项目
2. 安装依赖: `bun install`
3. 配置环境变量: 复制 `env.example` 到 `.env`
4. 初始化数据库: `bun run db:migrate`
5. 启动服务: `bun run dev`
6. 启动前端: `bun run dev:client`

## 🔧 开发命令

```bash
# 开发
bun run dev              # 启动后端开发服务器
bun run dev:client       # 启动前端开发服务器

# 构建
bun run build            # 构建后端
bun run build:client     # 构建前端

# 数据库
bun run db:generate      # 生成迁移文件
bun run db:migrate       # 运行迁移
bun run db:studio        # 打开 Drizzle Studio

# 代码质量
bun run lint             # 代码检查
bun run format           # 代码格式化
bun test                 # 运行测试
```

## 📊 当前状态

### ✅ 已完成功能

- [x] 用户认证系统
- [x] 工作流可视化编辑器
- [x] AI 工作流自动生成
- [x] 工作流执行引擎
- [x] 并发执行支持
- [x] SSE 实时通信
- [x] Ollama 集成
- [x] Supabase 集成（可选）
- [x] 执行监控面板
- [x] 错误处理和日志

### 🚧 进行中功能

- [ ] Agent 节点编辑器 UI
- [ ] 依赖关系检测和执行
- [ ] 工作流版本控制
- [ ] 工作流模板库

### 📋 计划中功能

- [ ] 定时任务调度
- [ ] Webhook 集成
- [ ] 文件上传和处理
- [ ] 多模型支持
- [ ] 工作流分享和协作
- [ ] 性能优化和缓存

## 🎯 技术亮点

1. **高性能运行时**: 使用 Bun.js，比 Node.js 更快
2. **类型安全**: 全面的 TypeScript 类型定义
3. **模块化设计**: 清晰的代码组织和职责分离
4. **实时通信**: SSE 实现低延迟的事件推送
5. **AI 集成**: 深度集成 Ollama，支持本地部署
6. **可选云服务**: Supabase 集成，支持云端扩展

## 📝 许可证

MIT License

---

**最后更新**: 2024-12-07


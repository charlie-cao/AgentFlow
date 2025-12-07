# AgentFlow

<div align="center">

**AI-powered multi-agent workflow platform built on Bun.js**

基于 Bun.js 和本地 Ollama 的多智能体工作流平台

[English](#english) | [中文](#中文)

</div>

---

## English

### 🚀 Overview

AgentFlow is a powerful, AI-driven multi-agent workflow platform that enables users to create, manage, and execute complex AI workflows through an intuitive visual interface. Built with Bun.js for maximum performance and integrated with local Ollama for privacy-first AI capabilities.

### ✨ Key Features

- ✅ **High Performance**: Built on Bun.js runtime for exceptional speed
- ✅ **Local AI Integration**: Powered by Ollama with qwen3:latest model
- ✅ **Visual Workflow Editor**: Drag-and-drop interface using React Flow
- ✅ **AI-Powered Generation**: Automatically generate workflows from natural language
- ✅ **Concurrent Execution**: Parallel execution of multiple agents
- ✅ **Real-time Monitoring**: SSE-based live execution tracking
- ✅ **JWT Authentication**: Secure user authentication system
- ✅ **Supabase Integration**: Optional cloud database and auth services

### 🏗️ Tech Stack

**Backend:**
- Bun.js - Ultra-fast JavaScript runtime
- Hono - Lightweight, fast web framework
- SQLite - Embedded database (default)
- Supabase - Optional cloud services
- Drizzle ORM - Type-safe database access
- JWT - Authentication

**Frontend:**
- React 18 + TypeScript
- React Flow - Workflow visualization
- Tailwind CSS - Styling
- Zustand - State management

**AI:**
- Ollama - Local LLM deployment
- qwen3:latest - Default model

### 📦 Quick Start

#### Prerequisites

- [Bun](https://bun.sh/) installed
- [Ollama](https://ollama.ai/) installed and running
- qwen3:latest model downloaded

#### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:charlie-cao/AgentFlow.git
   cd AgentFlow
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

4. **Initialize database**
   ```bash
   bun run db:migrate
   ```

5. **Start development server**
   ```bash
   # Terminal 1: Backend
   bun run dev
   
   # Terminal 2: Frontend
   bun run dev:client
   ```

The backend will run on `http://localhost:3000` and frontend on `http://localhost:5173`.

### 🎯 Core Features

#### 1. AI Workflow Generation
- Describe your requirements in natural language
- AI automatically generates complete workflow with multiple agents
- Each agent gets optimized prompts and configurations

#### 2. Visual Workflow Editor
- Drag-and-drop node editing
- Real-time connection preview
- Multiple node types (Trigger, Agent, Condition, Action)
- Intuitive UI built with React Flow

#### 3. Concurrent Agent Execution
- All agents execute in parallel
- Real-time execution monitoring
- Detailed logs for each agent interaction
- Error handling and retry mechanisms

#### 4. Real-time Monitoring
- Server-Sent Events (SSE) for live updates
- Execution progress tracking
- Agent output visualization
- Debug panel with detailed logs

### 📚 Documentation

- [📖 Documentation Index](./DOCS_INDEX.md) - Complete documentation navigation
- [📋 Project Documentation](./PROJECT_DOCUMENTATION.md) - Full project documentation
- [🗺️ Roadmap](./ROADMAP.md) - Development roadmap and milestones
- [⚙️ Ollama Configuration](./OLLAMA_CONFIGURATION.md) - Ollama setup guide
- [☁️ Supabase Integration](./SUPABASE_QUICK_START.md) - Supabase setup guide

### 🔧 Development

```bash
# Development
bun run dev              # Start backend dev server
bun run dev:client       # Start frontend dev server

# Build
bun run build            # Build backend
bun run build:client     # Build frontend

# Database
bun run db:generate      # Generate migration files
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio

# Code quality
bun run lint             # Lint code
bun run format           # Format code
```

### 📡 API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/refresh` - Refresh token

#### Workflows
- `POST /api/workflows/analyze` - AI analyze and generate workflow
- `POST /api/workflows/execute` - Execute workflow
- `POST /api/workflows/cancel` - Cancel execution
- `GET /api/workflows/status/:executionId` - Get execution status

#### Ollama
- `GET /api/ollama/models` - List available models
- `POST /api/ollama/generate` - Generate text
- `POST /api/ollama/chat` - Chat completion
- `POST /api/ollama/generate/stream` - Stream generation
- `POST /api/ollama/chat/stream` - Stream chat

#### Real-time
- `GET /api/sse?userId=<userId>` - SSE connection

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 中文

### 🚀 项目简介

AgentFlow 是一个强大的 AI 驱动的多智能体工作流平台，通过直观的可视化界面帮助用户创建、管理和执行复杂的 AI 工作流。基于 Bun.js 构建以获得极致性能，并集成本地 Ollama 实现隐私优先的 AI 能力。

### ✨ 核心特性

- ✅ **高性能**: 基于 Bun.js 运行时，提供极致性能
- ✅ **本地 AI 集成**: 使用 Ollama 和 qwen3:latest 模型
- ✅ **可视化编辑器**: 基于 React Flow 的拖拽式工作流编辑器
- ✅ **AI 自动生成**: 通过自然语言描述自动生成工作流
- ✅ **并发执行**: 支持多个 Agent 并行执行
- ✅ **实时监控**: 基于 SSE 的实时执行追踪
- ✅ **JWT 认证**: 安全的用户认证系统
- ✅ **Supabase 集成**: 可选的云数据库和认证服务

### 🏗️ 技术架构

**后端:**
- Bun.js - 超高性能 JavaScript 运行时
- Hono - 轻量级、快速 Web 框架
- SQLite - 嵌入式数据库（默认）
- Supabase - 可选云服务
- Drizzle ORM - 类型安全的数据库访问
- JWT - 身份认证

**前端:**
- React 18 + TypeScript
- React Flow - 工作流可视化
- Tailwind CSS - 样式框架
- Zustand - 状态管理

**AI:**
- Ollama - 本地 LLM 部署
- qwen3:latest - 默认模型

### 📦 快速开始

#### 环境要求

- 安装 [Bun](https://bun.sh/)
- 安装并运行 [Ollama](https://ollama.ai/)
- 下载 qwen3:latest 模型

#### 安装步骤

1. **克隆仓库**
   ```bash
   git clone git@github.com:charlie-cao/AgentFlow.git
   cd AgentFlow
   ```

2. **安装依赖**
   ```bash
   bun install
   ```

3. **配置环境变量**
   ```bash
   cp env.example .env
   # 编辑 .env 文件配置
   ```

4. **初始化数据库**
   ```bash
   bun run db:migrate
   ```

5. **启动开发服务器**
   ```bash
   # 终端 1: 后端
   bun run dev
   
   # 终端 2: 前端
   bun run dev:client
   ```

后端运行在 `http://localhost:3000`，前端运行在 `http://localhost:5173`。

### 🎯 核心功能

#### 1. AI 工作流生成
- 使用自然语言描述需求
- AI 自动生成包含多个 Agent 的完整工作流
- 每个 Agent 都有优化的提示词和配置

#### 2. 可视化工作流编辑器
- 拖拽式节点编辑
- 实时连接预览
- 多种节点类型（触发、Agent、条件、操作）
- 基于 React Flow 的直观界面

#### 3. 并发 Agent 执行
- 所有 Agent 并行执行
- 实时执行监控
- 每个 Agent 交互的详细日志
- 错误处理和重试机制

#### 4. 实时监控
- 基于 SSE 的实时更新
- 执行进度追踪
- Agent 输出可视化
- 带详细日志的调试面板

### 📚 项目文档

- [📖 文档索引](./DOCS_INDEX.md) - 完整的文档导航
- [📋 项目文档总结](./PROJECT_DOCUMENTATION.md) - 完整的项目文档
- [🗺️ 发展路线图](./ROADMAP.md) - 开发路线图和里程碑
- [⚙️ Ollama 配置](./OLLAMA_CONFIGURATION.md) - Ollama 配置指南
- [☁️ Supabase 集成](./SUPABASE_QUICK_START.md) - Supabase 配置指南

### 🔧 开发命令

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
```

### 📡 API 端点

#### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/verify` - 验证 token
- `POST /api/auth/refresh` - 刷新 token

#### 工作流
- `POST /api/workflows/analyze` - AI 分析并生成工作流
- `POST /api/workflows/execute` - 执行工作流
- `POST /api/workflows/cancel` - 取消执行
- `GET /api/workflows/status/:executionId` - 获取执行状态

#### Ollama
- `GET /api/ollama/models` - 获取模型列表
- `POST /api/ollama/generate` - 生成文本
- `POST /api/ollama/chat` - 对话
- `POST /api/ollama/generate/stream` - 流式生成
- `POST /api/ollama/chat/stream` - 流式对话

#### 实时通信
- `GET /api/sse?userId=<userId>` - SSE 连接

### 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

### 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情

---

<div align="center">

**Made with ❤️ by the AgentFlow Team**

</div>

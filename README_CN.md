# AgentFlow

基于 Bun.js 和本地 Ollama 的多智能体工作流平台

## 快速开始

### 1. 环境准备

- 安装 [Bun](https://bun.sh/)
- 安装并运行 [Ollama](https://ollama.ai/)（使用 `ollama run qwen3:latest` 下载模型）

### 2. 配置环境变量

```bash
cp env.example .env
# 编辑 .env 文件，配置数据库和其他服务
```

### 3. 安装依赖

```bash
bun install
```

### 4. 初始化数据库

```bash
bun run db:migrate
```

### 5. 启动开发服务器

```bash
# 终端 1: 后端
bun run dev

# 终端 2: 前端
bun run dev:client
```

后端运行在 `http://localhost:3000`，前端运行在 `http://localhost:5173`。

## 核心功能

- ✅ Bun.js 高性能运行时
- ✅ 本地 Ollama 集成（qwen3:latest）
- ✅ JWT 身份认证
- ✅ 实时 SSE 通知
- ✅ 可视化工作流编辑器
- ✅ AI 自动生成工作流
- ✅ 并发执行支持
- ✅ Supabase 集成（可选）

## 项目文档

- [📖 文档索引](./DOCS_INDEX.md) - 所有文档的快速导航
- [📋 项目文档总结](./PROJECT_DOCUMENTATION.md) - 完整的项目文档和架构说明
- [🗺️ 发展路线图](./ROADMAP.md) - 项目未来发展规划和里程碑

更多文档请查看 [文档索引](./DOCS_INDEX.md)

## 许可证

MIT License


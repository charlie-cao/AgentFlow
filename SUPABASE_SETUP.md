# Supabase 安装和配置指南

## 概述

本项目已集成 Supabase，可以作为可选的数据库和认证服务。当前系统仍使用 SQLite 作为主要数据库，Supabase 可以作为扩展功能使用。

## 安装步骤

### 1. 安装 Supabase 客户端库 ✅

已安装 `@supabase/supabase-js` 包。

### 2. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目或使用现有项目
3. 获取项目 URL 和 API Keys

### 3. 配置环境变量

在 `.env` 文件中添加以下配置：

```env
# Supabase Configuration (可选)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. 环境变量说明

- **SUPABASE_URL**: 你的 Supabase 项目 URL
  - 格式: `https://xxxxx.supabase.co`
  - 在 Supabase Dashboard > Settings > API 中获取

- **SUPABASE_ANON_KEY**: 匿名公共密钥
  - 用于客户端访问（前端）
  - 有 RLS (Row Level Security) 限制

- **SUPABASE_SERVICE_ROLE_KEY**: 服务端密钥
  - 用于服务器端操作
  - **拥有完整权限，请保密！**
  - 仅在服务器端使用，不要暴露给客户端

### 5. 验证配置

启动服务器后，系统会自动：
- 检查 Supabase 配置
- 如果配置存在，初始化 Supabase 客户端
- 测试连接（如果启用）

## 使用方式

### 在代码中使用 Supabase 客户端

```typescript
import { getSupabaseClient, getSupabaseServiceClient } from '../services/supabase';

// 获取普通客户端（使用 anon key）
const supabase = getSupabaseClient();

// 获取服务端客户端（使用 service role key，完整权限）
const supabaseService = getSupabaseServiceClient();

// 示例：查询数据
const { data, error } = await supabase
  .from('your_table')
  .select('*')
  .limit(10);
```

### 功能模块

#### 1. 数据库
- 可以使用 Supabase 的 PostgreSQL 数据库
- 支持实时订阅（Realtime）
- 支持数据库函数和存储过程

#### 2. 认证
- 可以使用 Supabase Auth 替代自定义 JWT
- 支持多种认证方式（Email、OAuth 等）
- 内置用户管理

#### 3. 存储
- 文件上传和存储
- 图片处理
- CDN 支持

#### 4. 实时功能
- 实时数据库变更监听
- 实时协作功能

## 迁移指南

### 从 SQLite 迁移到 Supabase PostgreSQL

1. **导出数据**
   ```bash
   # 导出 SQLite 数据
   sqlite3 agentflow.db .dump > backup.sql
   ```

2. **在 Supabase 中创建表**
   - 使用 Supabase Dashboard > SQL Editor
   - 或者使用迁移脚本

3. **导入数据**
   - 将 SQLite 数据转换为 PostgreSQL 格式
   - 使用 Supabase SQL Editor 执行导入

### 使用 Supabase 作为主数据库

如果你想要完全迁移到 Supabase：

1. 更新 `src/server/db/index.ts` 使用 Supabase 客户端
2. 更新 Drizzle 配置以使用 PostgreSQL
3. 运行数据库迁移

## 安全建议

1. **保护 Service Role Key**
   - 永远不要将 Service Role Key 暴露给客户端
   - 只在服务器端环境变量中使用
   - 不要提交到版本控制系统

2. **使用 Row Level Security (RLS)**
   - 在 Supabase Dashboard 中启用 RLS
   - 为每个表设置安全策略

3. **环境变量**
   - 使用 `.env` 文件存储敏感信息
   - 将 `.env` 添加到 `.gitignore`

## 常见问题

### Q: Supabase 是必需的吗？
A: 不是。Supabase 是可选的。如果不想使用，只需不配置环境变量即可。

### Q: 可以同时使用 SQLite 和 Supabase 吗？
A: 可以。当前实现允许同时使用两者。

### Q: 如何测试 Supabase 连接？
A: 系统启动时会自动测试连接。你也可以在代码中调用 `testSupabaseConnection()` 函数。

## 下一步

1. 创建 Supabase 项目
2. 配置环境变量
3. 根据需求选择使用功能：
   - 数据库存储
   - 用户认证
   - 文件存储
   - 实时功能

## 相关资源

- [Supabase 文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)


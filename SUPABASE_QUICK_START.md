# Supabase 快速开始指南

## ✅ 已完成的安装步骤

Supabase 已成功安装并集成到项目中！

## 快速配置

### 1. 获取 Supabase 凭证

1. 访问 [Supabase](https://supabase.com/) 并登录
2. 创建新项目或选择现有项目
3. 在项目设置中获取：
   - **Project URL** (格式: `https://xxxxx.supabase.co`)
   - **anon/public key** (在 Settings > API > Project API keys)
   - **service_role key** (在 Settings > API > Project API keys) ⚠️ **保密！**

### 2. 配置环境变量

在你的 `.env` 文件中添加：

```env
# Supabase Configuration (可选)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. 重启服务器

```bash
bun run dev
```

服务器启动时会：
- 检测 Supabase 配置
- 如果配置存在，初始化 Supabase 客户端
- 测试连接并显示状态

## 使用示例

### 在代码中使用 Supabase

```typescript
import { getSupabaseClient, isSupabaseEnabled } from '../services/supabase';

// 检查是否启用
if (isSupabaseEnabled()) {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    // 查询数据
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
      
    // 插入数据
    const { data, error } = await supabase
      .from('your_table')
      .insert({ column: 'value' });
  }
}
```

### 使用服务端客户端（完整权限）

```typescript
import { getSupabaseServiceClient } from '../services/supabase';

const supabaseService = getSupabaseServiceClient();
if (supabaseService) {
  // 使用服务端客户端进行操作（绕过 RLS）
  const { data } = await supabaseService
    .from('users')
    .select('*');
}
```

## 功能特性

### ✅ 已实现的功能

1. **可选集成** - Supabase 是可选的，不影响现有 SQLite 功能
2. **自动检测** - 系统会自动检测是否配置了 Supabase
3. **连接测试** - 启动时自动测试连接
4. **单例模式** - 客户端使用单例模式，避免重复创建
5. **类型安全** - 完整的 TypeScript 类型支持

### 🎯 可用功能

Supabase 提供以下功能（可根据需求使用）：

1. **PostgreSQL 数据库** - 强大的关系型数据库
2. **实时订阅** - 实时数据变更监听
3. **认证服务** - 内置用户认证系统
4. **存储服务** - 文件上传和存储
5. **Edge Functions** - 服务器端函数

## 安全建议

⚠️ **重要安全提示**：

1. **不要提交 Service Role Key**
   - 永远不要将 `SUPABASE_SERVICE_ROLE_KEY` 提交到 Git
   - 只在服务器环境变量中使用
   - 将 `.env` 添加到 `.gitignore`

2. **使用 Row Level Security (RLS)**
   - 在 Supabase Dashboard 中为表启用 RLS
   - 设置适当的安全策略
   - Anon Key 受 RLS 限制，Service Role Key 不受限制

3. **环境变量管理**
   - 生产环境使用环境变量管理服务
   - 定期轮换 API Keys

## 下一步

### 基础使用

1. ✅ 配置环境变量
2. ✅ 重启服务器验证连接
3. 📝 在 Supabase Dashboard 创建表结构
4. 💻 在代码中使用 Supabase 客户端

### 高级功能

- 🔄 迁移数据从 SQLite 到 Supabase
- 🔐 使用 Supabase Auth 替代自定义认证
- 📦 使用 Supabase Storage 存储文件
- ⚡ 使用 Realtime 实现实时功能

## 相关文档

- 📖 [完整安装指南](./SUPABASE_SETUP.md)
- 🔗 [Supabase 官方文档](https://supabase.com/docs)
- 🔗 [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)

## 故障排除

### 问题：连接失败

**检查项**：
- ✅ 环境变量是否正确配置
- ✅ Project URL 格式是否正确
- ✅ API Keys 是否有效
- ✅ 网络连接是否正常

**日志查看**：
启动服务器时会显示连接状态，查看控制台输出。

### 问题：客户端为 null

如果 `getSupabaseClient()` 返回 `null`：
- 检查 `isSupabaseEnabled()` 返回值
- 确认环境变量已正确加载
- 查看服务器启动日志

## 示例代码

### 创建路由使用 Supabase

```typescript
import { Hono } from 'hono';
import { getSupabaseClient, isSupabaseEnabled } from '../services/supabase';

const app = new Hono();

app.get('/data', async (c) => {
  if (!isSupabaseEnabled()) {
    return c.json({ error: 'Supabase is not enabled' }, 503);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return c.json({ error: 'Supabase client unavailable' }, 503);
  }

  const { data, error } = await supabase
    .from('your_table')
    .select('*');

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});
```

## 支持

如有问题，请查看：
1. [Supabase 文档](https://supabase.com/docs)
2. [项目 README](./README.md)
3. [完整安装指南](./SUPABASE_SETUP.md)


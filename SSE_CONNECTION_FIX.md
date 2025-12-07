# SSE 连接问题修复说明

## 问题描述

执行工作流时，出现以下错误：
```
No SSE clients found for user undefined
```

这说明：
1. 用户 ID 传递不正确（undefined）
2. SSE 客户端没有正确连接到服务器
3. 或者前端连接时使用的用户 ID 与后端广播时使用的用户 ID 不匹配

## 根本原因

从代码分析，问题可能在于：
1. **用户对象可能没有 `id` 字段**：虽然 auth middleware 设置了 `user` 对象，但可能字段名称不匹配
2. **前端 SSE 连接可能未建立**：前端可能没有正确连接到 SSE 端点
3. **用户 ID 提取方式不一致**：前端从 token 中提取，后端从 user 对象中获取，可能不一致

## 已实施的修复

### 1. 改进用户 ID 获取逻辑
**文件**: `src/server/routes/workflows-advanced.ts`

```typescript
const user = c.get('user');
const userId = user?.id || c.get('userId'); // 使用后备方案

if (!userId) {
  return c.json({
    success: false,
    error: {
      code: 'USER_NOT_FOUND',
      message: 'User ID is required for workflow execution',
    }
  }, 400);
}
```

### 2. 添加详细的调试日志
- 在执行开始时记录用户信息
- 在 SSE 连接时记录用户 ID
- 在广播时记录所有已连接的用户 ID

### 3. 改进 SSE 服务
**文件**: `src/server/services/sse.ts`

- 支持 `undefined` 用户 ID 的检查
- 列出所有已连接的用户 ID，便于调试
- 注册客户端时记录日志

## 需要检查的地方

### 1. 前端 SSE 连接
**文件**: `client/src/components/ExecutionMonitor.tsx`

确保：
- 正确从 token 中提取用户 ID
- 正确连接到 `/api/sse?userId=xxx`
- 连接建立后能看到 "connected" 事件

### 2. 后端用户对象结构
**文件**: `src/server/middleware/auth.ts`

确保：
- 用户对象包含 `id` 字段
- 或者使用 `c.set('userId', payload.userId)` 设置用户 ID

### 3. Token 中的用户 ID
确保 JWT token 的 payload 中包含 `userId` 字段，且字段名一致。

## 调试步骤

1. **检查前端连接**：
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 查找 `/api/sse?userId=xxx` 请求
   - 检查请求参数中的 userId 是否正确

2. **检查后端日志**：
   - 查看控制台输出
   - 查找 "SSE connection request" 日志
   - 查找 "SSE client registered" 日志
   - 查找 "Connected user IDs" 日志

3. **检查用户 ID 一致性**：
   - 前端提取的用户 ID
   - 后端获取的用户 ID
   - 确保两者一致

## 临时解决方案

如果问题仍然存在，可以：

1. **使用 userId 而不是 user.id**：
   ```typescript
   const userId = c.get('userId'); // 直接从 context 获取
   ```

2. **检查用户对象结构**：
   ```typescript
   console.log('User object:', JSON.stringify(user, null, 2));
   console.log('User ID from context:', c.get('userId'));
   ```

3. **确保前端正确连接**：
   - 检查 ExecutionMonitor 组件是否正确渲染
   - 检查 token 是否存在
   - 检查用户 ID 提取逻辑

## 预期行为

修复后，应该看到：
1. 前端成功连接到 SSE
2. 后端显示 "SSE client registered for userId: xxx"
3. 执行工作流时，所有事件都能正确广播
4. 调试面板显示所有执行日志和模型输出


// SSE (Server-Sent Events) 服务，用于实时广播执行事件

interface SSEClient {
  userId: string;
  controller: ReadableStreamDefaultController;
  lastPing: Date;
}

class SSEService {
  private clients: Map<string, SSEClient[]> = new Map();

  // 注册客户端连接
  registerClient(userId: string, controller: ReadableStreamDefaultController): () => void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }

    const client: SSEClient = {
      userId,
      controller,
      lastPing: new Date(),
    };

    this.clients.get(userId)!.push(client);
    
    console.log(`SSE client registered for user ${userId}. Total clients for this user: ${this.clients.get(userId)!.length}`);

    // 返回清理函数
    return () => {
      const userClients = this.clients.get(userId);
      if (userClients) {
        const index = userClients.indexOf(client);
        if (index > -1) {
          userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
          this.clients.delete(userId);
        }
      }
    };
  }

  // 向指定用户广播消息
  broadcastToUser(userId: string | undefined, data: any): void {
    if (!userId) {
      console.warn('Cannot broadcast: userId is undefined');
      return;
    }

    const userClients = this.clients.get(userId);
    if (!userClients || userClients.length === 0) {
      console.log(`No SSE clients found for user ${userId}. Total connected clients: ${this.getClientCount()}`);
      // 列出所有已连接的用户ID，用于调试
      const allUserIds = Array.from(this.clients.keys());
      if (allUserIds.length > 0) {
        console.log(`Connected user IDs: ${allUserIds.join(', ')}`);
      }
      return;
    }

    const message = `data: ${JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    })}\n\n`;

    // 向该用户的所有客户端发送消息
    userClients.forEach((client) => {
      try {
        client.controller.enqueue(new TextEncoder().encode(message));
        client.lastPing = new Date();
      } catch (error) {
        console.error(`Failed to send SSE message to user ${userId}:`, error);
        // 连接可能已关闭，将在下次清理时移除
      }
    });
  }

  // 向所有用户广播消息
  broadcastToAll(data: any): void {
    const message = `data: ${JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    })}\n\n`;

    this.clients.forEach((clients, userId) => {
      clients.forEach((client) => {
        try {
          client.controller.enqueue(new TextEncoder().encode(message));
          client.lastPing = new Date();
        } catch (error) {
          console.error(`Failed to broadcast to user ${userId}:`, error);
        }
      });
    });
  }

  // 清理断开的连接
  cleanup(): void {
    const now = new Date();
    const timeout = 60000; // 60 秒超时

    this.clients.forEach((clients, userId) => {
      const activeClients = clients.filter((client) => {
        const timeSinceLastPing = now.getTime() - client.lastPing.getTime();
        return timeSinceLastPing < timeout;
      });

      if (activeClients.length === 0) {
        this.clients.delete(userId);
      } else {
        this.clients.set(userId, activeClients);
      }
    });
  }

  // 获取连接数
  getClientCount(userId?: string): number {
    if (userId) {
      return this.clients.get(userId)?.length || 0;
    }
    let total = 0;
    this.clients.forEach((clients) => {
      total += clients.length;
    });
    return total;
  }
}

// 导出单例实例
export const sseService = new SSEService();

// 定期清理断开的连接
setInterval(() => {
  sseService.cleanup();
}, 30000); // 每 30 秒清理一次


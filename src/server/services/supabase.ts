// Supabase 客户端配置和服务
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../utils/load-env';
import { logger } from '../utils/logger';

let supabaseClient: SupabaseClient | null = null;

/**
 * 检查 Supabase 是否已启用
 */
export function isSupabaseEnabled(): boolean {
  return config.supabase.enabled;
}

/**
 * 获取 Supabase 客户端实例（单例模式）
 * 如果 Supabase 未配置，返回 null
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!config.supabase.enabled) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = config.supabase.url;
  const supabaseKey = config.supabase.anonKey;

  if (!supabaseUrl || !supabaseKey) {
    logger.warn('Supabase is enabled but URL or Anon Key is missing');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // 服务器端不需要持久化会话
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'agentflow-server',
      },
    },
  });

  logger.info('Supabase client initialized', {
    url: supabaseUrl,
  });

  return supabaseClient;
}

/**
 * 获取服务端 Supabase 客户端（使用 service role key，拥有完整权限）
 * 如果 Supabase 未配置，返回 null
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  if (!config.supabase.enabled) {
    return null;
  }

  const supabaseUrl = config.supabase.url;
  const serviceRoleKey = config.supabase.serviceRoleKey;

  if (!supabaseUrl || !serviceRoleKey) {
    logger.warn('Supabase Service Role Key is not configured. Service client unavailable.');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * 测试 Supabase 连接
 */
export async function testSupabaseConnection(): Promise<boolean> {
  if (!config.supabase.enabled) {
    logger.info('Supabase is not enabled, skipping connection test');
    return false;
  }

  try {
    const client = getSupabaseClient();
    if (!client) {
      logger.warn('Supabase client is not available');
      return false;
    }

    // 简单的连接测试：尝试查询系统表或执行一个简单的查询
    const { error } = await client.rpc('version');
    
    if (error) {
      // 如果 RPC 不存在，尝试查询一个不存在的表来测试连接
      const { error: testError } = await client.from('_health_check_').select('*').limit(0);
      if (testError && testError.code !== 'PGRST116') {
        logger.warn('Supabase connection test failed', { error: error.message });
        return false;
      }
    }

    logger.info('Supabase connection test successful');
    return true;
  } catch (error: any) {
    logger.error('Supabase connection test error', { error: error?.message || error });
    return false;
  }
}

// 导出 Supabase 客户端类型
export type { SupabaseClient };


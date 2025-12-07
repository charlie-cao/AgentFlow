import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { WorkflowAnalyzer } from '../services/workflowAnalyzer';
import { WorkflowExecutor } from '../services/workflowExecutor';
import { requireAuth } from '../middleware/auth';
import { sseService } from '../services/sse';

const workflows = new Hono();

// Apply authentication to all routes
workflows.use('*', requireAuth);

// Running execution instances
const activeExecutions = new Map();

// Analyze requirement and generate workflow
workflows.post('/analyze', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input with friendly error messages
    const validationResult = z.object({
      requirement: z.string().min(5, '需求描述至少需要 5 个字符').max(1000, '需求描述不能超过 1000 个字符'),
    }).safeParse(body);
    
    if (!validationResult.success) {
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.error.errors[0]?.message || '输入验证失败',
          issues: validationResult.error.errors,
        }
      }, 400);
    }
    
    const { requirement } = validationResult.data;
    const user = c.get('user');

    const analyzer = WorkflowAnalyzer.getInstance();
    const result = await analyzer.analyzeRequirement(requirement);

    return c.json({
      success: true,
      data: {
        workflow: result.workflow,
        agents: result.agents,
        explanation: result.explanation,
      },
    });
  } catch (error) {
    console.error('Workflow analysis failed:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.errors[0]?.message || '输入验证失败',
          issues: error.errors,
        }
      }, 400);
    }
    
    return c.json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: '分析需求失败',
        details: error instanceof Error ? error.message : '未知错误',
      }
    }, 500);
  }
});

// Execute workflow
workflows.post('/execute', zValidator('json', z.object({
  workflow: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
  context: z.record(z.any()).optional(),
})), async (c) => {
  const { workflow, context = {} } = c.req.valid('json');
  const user = c.get('user');
  // 优先使用 context 中的 userId，因为 auth middleware 已经设置了
  const userId = c.get('userId') || user?.id;

  // 添加详细的调试日志
  console.log('Workflow execution request:', {
    userIdFromContext: c.get('userId'),
    userObject: user,
    userObjectId: user?.id,
    finalUserId: userId,
  });

  if (!userId) {
    console.error('User ID is missing!', {
      hasUser: !!user,
      userIdFromContext: c.get('userId'),
      userKeys: user ? Object.keys(user) : [],
    });
    return c.json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User ID is required for workflow execution',
      }
    }, 400);
  }

  console.log(`Starting workflow execution for user: ${userId}`);

  try {
    // Create executor instance
    const executor = new WorkflowExecutor(workflow, context);

    // Store executor for monitoring
    const executionId = executor.getExecutionId();
    activeExecutions.set(executionId, executor);

    // Set up event handlers - use userId instead of user.id
    executor.on('start', (data) => {
      // Broadcast via SSE
      broadcastToUser(userId, {
        type: 'execution_start',
        executionId,
        ...data,
      });
    });

    executor.on('stepStart', (data) => {
      broadcastToUser(userId, {
        type: 'step_start',
        executionId,
        ...data,
      });
    });

    executor.on('agentStart', (data) => {
      broadcastToUser(userId, {
        type: 'agent_start',
        executionId,
        ...data,
      });
    });

    executor.on('agentComplete', (data) => {
      broadcastToUser(userId, {
        type: 'agent_complete',
        executionId,
        ...data,
      });
    });

    executor.on('agentError', (data) => {
      broadcastToUser(userId, {
        type: 'agent_error',
        executionId,
        ...data,
      });
    });

    executor.on('stepComplete', (data) => {
      broadcastToUser(userId, {
        type: 'step_complete',
        executionId,
        ...data,
      });
    });

    executor.on('stepError', (data) => {
      broadcastToUser(userId, {
        type: 'step_error',
        executionId,
        ...data,
      });
    });

    executor.on('complete', (data) => {
      broadcastToUser(userId, {
        type: 'execution_complete',
        executionId,
        ...data,
      });

      // Clean up
      activeExecutions.delete(executionId);
    });

    executor.on('error', (data) => {
      broadcastToUser(userId, {
        type: 'execution_error',
        executionId,
        ...data,
      });

      // Clean up
      activeExecutions.delete(executionId);
    });

    // Start execution (async)
    executor.execute().catch(console.error);

    return c.json({
      success: true,
      data: {
        executionId,
        message: 'Workflow execution started',
      },
    });
  } catch (error) {
    console.error('Workflow execution failed:', error);
    return c.json({
      success: false,
      error: {
        code: 'EXECUTION_FAILED',
        message: 'Failed to start workflow execution',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }, 500);
  }
});

// Cancel execution
workflows.post('/cancel', zValidator('json', z.object({
  executionId: z.string(),
})), async (c) => {
  const { executionId } = c.req.valid('json');
  const user = c.get('user');

  try {
    const executor = activeExecutions.get(executionId);
    if (!executor) {
      return c.json({
        success: false,
        error: {
          code: 'EXECUTION_NOT_FOUND',
          message: 'Execution not found or already completed',
        }
      }, 404);
    }

    executor.cancel();
    activeExecutions.delete(executionId);

    return c.json({
      success: true,
      data: {
        executionId,
        message: 'Execution cancelled',
      },
    });
  } catch (error) {
    console.error('Execution cancellation failed:', error);
    return c.json({
      success: false,
      error: {
        code: 'CANCEL_FAILED',
        message: 'Failed to cancel execution',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }, 500);
  }
});

// Get execution status
workflows.get('/status/:executionId', async (c) => {
  const executionId = c.req.param('executionId');

  try {
    const executor = activeExecutions.get(executionId);
    const isActive = !!executor;

    return c.json({
      success: true,
      data: {
        executionId,
        isActive,
        message: isActive ? 'Execution is running' : 'Execution not found or completed',
      },
    });
  } catch (error) {
    console.error('Status check failed:', error);
    return c.json({
      success: false,
      error: {
        code: 'STATUS_CHECK_FAILED',
        message: 'Failed to check execution status',
      }
    }, 500);
  }
});

// Helper function for broadcasting to user
function broadcastToUser(userId: string, data: any) {
  sseService.broadcastToUser(userId, data);
}

export default workflows;
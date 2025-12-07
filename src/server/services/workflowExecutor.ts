import { ollama } from './ollama';
import { WorkflowDefinition, WorkflowNode, ExecutionStep } from '@shared/types';
import { nanoid } from 'nanoid';
import { EventEmitter } from 'events';

export interface ExecutionProgress {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  error?: string;
  agentInteraction?: {
    prompt: string;
    response: string;
    model: string;
  };
}

export class WorkflowExecutor extends EventEmitter {
  private executionId: string;
  private workflow: WorkflowDefinition;
  private context: Record<string, any>;

  constructor(workflow: WorkflowDefinition, context: Record<string, any> = {}) {
    super();
    this.workflow = workflow;
    this.context = context;
    this.executionId = nanoid();
  }

  async execute(): Promise<string> {
    console.log('Starting workflow execution:', this.executionId);

    // 分离不同类型的节点
    const triggerNodes = this.workflow.nodes.filter(n => n.type === 'trigger');
    const agentNodes = this.workflow.nodes.filter(n => n.type === 'agent');
    const otherNodes = this.workflow.nodes.filter(n => 
      n.type !== 'trigger' && n.type !== 'agent'
    );

    const totalSteps = this.workflow.nodes.length;

    this.emit('start', {
      executionId: this.executionId,
      totalSteps,
      message: `开始执行工作流，共 ${totalSteps} 个节点，其中 ${agentNodes.length} 个 Agent 节点将并发执行`,
    });

    try {
      // 第一步：执行所有 trigger 节点（通常只有一个）
      for (const node of triggerNodes) {
        await this.executeNode(node, 1, totalSteps);
      }

      // 第二步：并发执行所有 Agent 节点（这是关键改进）
      if (agentNodes.length > 0) {
        console.log(`开始并发执行 ${agentNodes.length} 个 Agent 节点`);
        
        // 使用 Promise.all 并发执行所有 Agent 节点
        const agentPromises = agentNodes.map((node, index) => 
          this.executeNode(node, triggerNodes.length + index + 1, totalSteps)
        );

        // 等待所有 Agent 节点完成（并发执行）
        await Promise.all(agentPromises);
      }

      // 第三步：执行其他类型的节点
      for (let i = 0; i < otherNodes.length; i++) {
        const node = otherNodes[i];
        await this.executeNode(node, triggerNodes.length + agentNodes.length + i + 1, totalSteps);
      }

      this.emit('complete', {
        executionId: this.executionId,
        result: this.context,
        message: '所有节点执行完成',
      });

      return this.executionId;
    } catch (error) {
      console.error('Workflow execution failed:', error);
      this.emit('error', {
        executionId: this.executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async executeNode(node: WorkflowNode, stepNumber: number, totalSteps: number): Promise<void> {
    const stepId = nanoid();

    // 发送步骤开始事件
    this.emit('stepStart', {
      executionId: this.executionId,
      stepId,
      stepNumber,
      totalSteps,
      stepName: node.data.label || node.id,
      nodeType: node.type,
    });

    try {
      let output: any;

      switch (node.type) {
        case 'trigger':
          output = await this.executeTrigger(node);
          break;
        case 'agent':
          output = await this.executeAgent(node);
          break;
        case 'condition':
          output = await this.executeCondition(node);
          break;
        case 'action':
          output = await this.executeAction(node);
          break;
        default:
          output = await this.executeDefault(node);
          break;
      }

      // 更新上下文
      this.context[node.id] = output;

      // 发送步骤完成事件
      this.emit('stepComplete', {
        executionId: this.executionId,
        stepId,
        stepName: node.data.label || node.id,
        input: this.context,
        output,
      });

    } catch (error) {
      // 发送步骤失败事件
      this.emit('stepError', {
        executionId: this.executionId,
        stepId,
        stepName: node.data.label || node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async executeTrigger(node: WorkflowNode): Promise<any> {
    console.log('Executing trigger node:', node.data.label);

    switch (node.data.triggerType) {
      case 'manual':
        return { message: '手动触发执行', timestamp: new Date().toISOString() };
      case 'schedule':
        return { message: '定时触发执行', timestamp: new Date().toISOString() };
      case 'webhook':
        return { message: 'Webhook 触发执行', timestamp: new Date().toISOString() };
      default:
        return { message: '触发器执行', timestamp: new Date().toISOString() };
    }
  }

  private async executeAgent(node: WorkflowNode): Promise<any> {
    console.log('Executing agent node:', node.data.label);

    const config = node.data.config || {};
    const prompt = this.buildPrompt(node);

    // 发送 AI 交互事件
    const agentInteractionEvent = {
      executionId: this.executionId,
      nodeId: node.id,
      nodeType: 'agent',
      stepName: node.data.label,
      agentInteraction: {
        prompt,
        response: '',
        model: config.model || 'qwen3:latest',
      },
    };

    this.emit('agentStart', agentInteractionEvent);

    try {
      const response = await ollama.generate({
        model: config.model || 'qwen3:latest',
        prompt,
        system: config.systemPrompt || '你是一个专业的AI助手。',
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000,
      });

      const result = {
        response: response.response,
        model: response.model,
        tokens: {
          prompt: response.prompt_eval_count,
          completion: response.eval_count,
          total: response.prompt_eval_count + response.eval_count,
        },
        duration: response.total_duration,
      };

      // 发送 AI 响应事件
      agentInteractionEvent.agentInteraction.response = response.response;
      this.emit('agentComplete', agentInteractionEvent);

      return result;
    } catch (error) {
      // 发送 AI 错误事件
      agentInteractionEvent.agentInteraction.response = `执行失败: ${error}`;
      this.emit('agentError', agentInteractionEvent);
      throw error;
    }
  }

  private async executeCondition(node: WorkflowNode): Promise<any> {
    console.log('Executing condition node:', node.data.label);
    return { condition: true, message: '条件判断通过' };
  }

  private async executeAction(node: WorkflowNode): Promise<any> {
    console.log('Executing action node:', node.data.label);
    return { action: 'completed', message: '操作执行成功' };
  }

  private async executeDefault(node: WorkflowNode): Promise<any> {
    console.log('Executing default node:', node.data.label);
    return { message: '节点执行完成', type: node.type };
  }

  private buildPrompt(node: WorkflowNode): string {
    const contextStr = Object.entries(this.context)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    const basePrompt = node.data.prompt || `请执行任务：${node.data.description || node.data.label}`;

    return contextStr ? `${basePrompt}\n\n当前上下文：\n${contextStr}` : basePrompt;
  }

  private sortNodesByPosition(nodes: WorkflowNode[]): WorkflowNode[] {
    // 按 Y 坐标排序，然后按 X 坐标排序
    return [...nodes].sort((a, b) => {
      if (a.position.y === b.position.y) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });
  }

  // 获取执行ID
  getExecutionId(): string {
    return this.executionId;
  }

  // 获取当前上下文
  getContext(): Record<string, any> {
    return { ...this.context };
  }

  // 取消执行
  cancel(): void {
    this.emit('cancelled', {
      executionId: this.executionId,
      message: '执行被用户取消',
    });
  }
}
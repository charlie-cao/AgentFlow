import { ollama } from './ollama';
import { WorkflowDefinition, WorkflowNode } from '@shared/types';
import { nanoid } from 'nanoid';

export interface AnalysisResult {
  workflow: WorkflowDefinition;
  agents: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    config: any;
  }>;
  explanation: string;
}

export class WorkflowAnalyzer {
  private static instance: WorkflowAnalyzer;

  public static getInstance(): WorkflowAnalyzer {
    if (!WorkflowAnalyzer.instance) {
      WorkflowAnalyzer.instance = new WorkflowAnalyzer();
    }
    return WorkflowAnalyzer.instance;
  }

  async analyzeRequirement(requirement: string): Promise<AnalysisResult> {
    try {
      console.log('Analyzing requirement:', requirement);

      // 使用 Ollama 分析需求并生成工作流
      const response = await ollama.chat({
        model: 'qwen3:latest',
        messages: [
          {
            role: 'system',
            content: `你是一个 AI 工作流设计专家。根据用户需求，设计一个由多个 Agent 组成的工作流。

你需要：
1. 分析用户的核心需求
2. 将任务分解为多个步骤
3. 为每个步骤设计合适的 Agent，并为每个 Agent 生成详细的提示词（prompt）
4. 定义 Agent 之间的数据流和依赖关系

请严格按照以下 JSON 格式返回结果（不要有任何其他文本，只返回 JSON）：

{
  "workflow": {
    "nodes": [
      {
        "id": "node_1",
        "type": "trigger",
        "position": { "x": 250, "y": 50 },
        "data": {
          "label": "开始",
          "triggerType": "manual"
        }
      },
      {
        "id": "node_2",
        "type": "agent",
        "position": { "x": 250, "y": 200 },
        "data": {
          "label": "Agent 名称",
          "description": "Agent 描述",
          "prompt": "详细的提示词，告诉这个 Agent 要做什么",
          "config": {
            "model": "qwen3:latest",
            "systemPrompt": "系统提示词",
            "temperature": 0.7,
            "maxTokens": 2000
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2"
      }
    ]
  },
  "agents": [
    {
      "name": "Agent 名称",
      "type": "llm",
      "description": "Agent 描述",
      "systemPrompt": "系统提示词，定义 Agent 的角色和能力"
    }
  ],
  "explanation": "工作流设计说明"
}

重要要求：
1. nodes 数组必须包含至少一个 trigger 节点（type: "trigger"）作为开始
2. 每个 agent 节点必须包含 data.prompt 字段，这是该 Agent 的具体任务提示词
3. 每个 agent 节点必须包含 data.config 配置
4. edges 数组定义节点之间的连接关系
5. position 的 x, y 坐标要合理布局（水平间距 300，垂直间距 200）
6. 确保所有节点都有唯一的 id
7. 确保所有边的 source 和 target 都对应存在的节点 id

节点类型说明：
- trigger: 触发节点，data.triggerType 必须是 "manual"、"schedule" 或 "webhook"
- agent: Agent 节点，必须包含 data.prompt（任务提示词）和 data.config（配置）`
          },
          {
            role: 'user',
            content: `需求：${requirement}

请根据这个需求设计一个完整的 AI 工作流。要求：
1. 至少包含 2-4 个 Agent 节点
2. 每个 Agent 都有明确的任务和详细的提示词
3. Agent 之间要有合理的依赖关系
4. 确保返回的是有效的 JSON 格式`
          }
        ],
        temperature: 0.7,
      });

      // 解析响应
      const analysisText = response.message.content;
      console.log('AI 响应原文:', analysisText);

      // 尝试提取 JSON（支持代码块中的 JSON）
      let jsonText = analysisText;
      
      // 移除可能的 markdown 代码块标记
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // 尝试提取 JSON 对象
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('无法从响应中提取 JSON');
        throw new Error('AI 返回的响应格式不正确，无法解析为 JSON');
      }

      let analysis;
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON 解析失败:', parseError);
        throw new Error('AI 返回的 JSON 格式无效');
      }

      // 生成唯一的工作流定义，确保格式与 ReactFlow 兼容
      const workflow: WorkflowDefinition = {
        nodes: (analysis.workflow?.nodes || this.generateBasicWorkflow(requirement)).map((node: any, index: number) => {
          const nodeId = node.id || nanoid();
          
          // 确保节点类型正确
          const nodeType = node.type || (index === 0 ? 'trigger' : 'agent');
          
          // 构建节点数据，确保包含所有必要字段
          const nodeData: any = {
            label: node.data?.label || node.name || `节点 ${index + 1}`,
            ...(node.data || {}),
          };

          // 如果是 trigger 节点，确保有 triggerType
          if (nodeType === 'trigger') {
            nodeData.triggerType = node.data?.triggerType || 'manual';
          }

          // 如果是 agent 节点，确保有 prompt 和 config
          if (nodeType === 'agent') {
            nodeData.prompt = node.data?.prompt || nodeData.description || nodeData.label || '';
            nodeData.config = node.data?.config || {
              model: 'qwen3:latest',
              systemPrompt: nodeData.prompt || '你是一个专业的 AI 助手。',
              temperature: 0.7,
              maxTokens: 2000,
            };
          }

          return {
            id: nodeId,
            type: nodeType,
            position: {
              x: node.position?.x ?? (index * 300 + 100),
              y: node.position?.y ?? (Math.floor(index / 3) * 200 + 50),
            },
            data: nodeData,
          };
        }),
        edges: (analysis.workflow?.edges || []).map((edge: any) => ({
          id: edge.id || nanoid(),
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: edge.data || {},
        })),
        metadata: {
          version: '1.0.0',
          description: analysis.explanation || `基于需求生成的自动化工作流: ${requirement}`,
          tags: ['auto-generated', 'ai-workflow'],
        },
      };

      // 生成 Agent 配置，并将配置关联到对应的节点
      const agentMap = new Map<string, any>();
      const agents = (analysis.agents || this.generateAgents(requirement)).map((agent: any) => {
        const agentId = nanoid();
        const agentConfig = {
          id: agentId,
          name: agent.name,
          type: agent.type || 'llm',
          description: agent.description || `处理 ${agent.name} 相关任务的 AI Agent`,
          config: {
            model: agent.config?.model || 'qwen3:latest',
            systemPrompt: agent.systemPrompt || agent.config?.systemPrompt || `你是一个专业的 ${agent.name} 处理助手。`,
            temperature: agent.config?.temperature || 0.7,
            maxTokens: agent.config?.maxTokens || 2000,
            ...agent.config,
          },
        };
        
        // 将 Agent 名称映射到配置，用于后续关联节点
        if (agent.name) {
          agentMap.set(agent.name, agentConfig);
        }
        
        return agentConfig;
      });

      // 将 Agent 配置关联到对应的节点
      workflow.nodes = workflow.nodes.map((node) => {
        if (node.type === 'agent' && node.data.label) {
          const agentConfig = agentMap.get(node.data.label);
          if (agentConfig) {
            node.data.agentId = agentConfig.id;
            node.data.config = agentConfig.config;
          }
        }
        return node;
      });

      return {
        workflow,
        agents,
        explanation: analysis.explanation || `已为您生成包含 ${workflow.nodes.length} 个节点的工作流，用于处理：${requirement}`,
      };
    } catch (error) {
      console.error('Workflow analysis failed:', error);

      // 返回基础工作流作为后备方案
      return this.generateFallbackWorkflow(requirement);
    }
  }

  private generateBasicWorkflow(requirement: string): WorkflowNode[] {
    const triggerNode: WorkflowNode = {
      id: nanoid(),
      type: 'trigger',
      position: { x: 250, y: 50 },
      data: {
        label: '开始',
        triggerType: 'manual',
      },
    };

    const agentNode: WorkflowNode = {
      id: nanoid(),
      type: 'agent',
      position: { x: 250, y: 200 },
      data: {
        label: 'AI 处理',
        description: `处理需求：${requirement}`,
        agentId: nanoid(),
      },
    };

    const endNode: WorkflowNode = {
      id: nanoid(),
      type: 'trigger',
      position: { x: 250, y: 350 },
      data: {
        label: '完成',
        triggerType: 'manual',
      },
    };

    return [triggerNode, agentNode, endNode];
  }

  private generateAgents(requirement: string): any[] {
    return [
      {
        name: '需求分析器',
        type: 'llm',
        description: '分析用户需求并制定执行计划',
        systemPrompt: `你是一个专业的需求分析师，擅长分析用户需求并制定执行方案。当前需求：${requirement}`,
      },
      {
        name: '任务执行器',
        type: 'llm',
        description: '执行具体任务并生成结果',
        systemPrompt: `你是一个任务执行专家，负责执行以下需求：${requirement}。请提供专业、准确的结果。`,
      },
    ];
  }

  private generateFallbackWorkflow(requirement: string): AnalysisResult {
    const workflow: WorkflowDefinition = {
      nodes: [
        {
          id: nanoid(),
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: {
            label: '手动触发',
            triggerType: 'manual',
          },
        },
        {
          id: nanoid(),
          type: 'agent',
          position: { x: 250, y: 200 },
          data: {
            label: 'AI 处理',
            description: `处理：${requirement}`,
            agentId: nanoid(),
          },
        },
        {
          id: nanoid(),
          type: 'trigger',
          position: { x: 250, y: 350 },
          data: {
            label: '完成',
            triggerType: 'manual',
          },
        },
      ],
      edges: [
        {
          id: nanoid(),
          source: 'node1',
          target: 'node2',
        },
        {
          id: nanoid(),
          source: 'node2',
          target: 'node3',
        },
      ],
      metadata: {
        version: '1.0.0',
        description: `自动生成的工作流：${requirement}`,
        tags: ['fallback', 'basic'],
      },
    };

    const agents = [
      {
        id: nanoid(),
        name: '通用处理器',
        type: 'llm',
        description: '处理通用任务的 AI Agent',
        config: {
          model: 'qwen3:latest',
          systemPrompt: `你是一个通用的 AI 助手，请处理以下需求：${requirement}`,
          temperature: 0.7,
        },
      },
    ];

    return {
      workflow,
      agents,
      explanation: `由于自动分析遇到问题，已为您生成一个基础工作流来处理：${requirement}`,
    };
  }
}
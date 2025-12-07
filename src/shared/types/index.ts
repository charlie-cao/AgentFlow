export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    version: string;
    description?: string;
    tags?: string[];
  };
}

export interface WorkflowNode {
  id: string;
  type: 'agent' | 'trigger' | 'condition' | 'action' | 'transform';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    agentId?: string;
    config?: Record<string, any>;
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  config: AgentConfig;
  capabilities: string[];
  isTemplate: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: AgentTool[];
  parameters?: Record<string, any>;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  function: string;
}

export interface Execution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  result?: Record<string, any>;
  errorMessage?: string;
  triggeredBy: string;
  context?: Record<string, any>;
}

export interface ExecutionStep {
  id: string;
  executionId: string;
  agentId?: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  orderIndex: number;
  duration?: number;
}

export interface QueueJob {
  id: string;
  type: string;
  data: Record<string, any>;
  options: {
    delay?: number;
    attempts?: number;
    backoff?: string;
    priority?: number;
  };
  createdAt: Date;
}

export interface SSEEvent {
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  userId?: string;
  executionId?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    timestamp: Date;
  };
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
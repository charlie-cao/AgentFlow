import { create } from 'zustand'
import { Node, Edge } from 'reactflow'

interface Workflow {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  createdAt: Date
  updatedAt: Date
}

interface WorkflowState {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  isExecuting: boolean
  executionStatus: Record<string, any>

  // Actions
  setWorkflows: (workflows: Workflow[]) => void
  setCurrentWorkflow: (workflow: Workflow | null) => void
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  deleteWorkflow: (id: string) => void
  saveWorkflow: (workflow: Partial<Workflow>) => Promise<void>
  executeWorkflow: (workflowId: string) => Promise<void>
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  isExecuting: false,
  executionStatus: {},

  setWorkflows: (workflows) => set({ workflows }),

  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

  addWorkflow: (workflowData) => {
    const newWorkflow: Workflow = {
      ...workflowData,
      id: `workflow_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      workflows: [...state.workflows, newWorkflow],
    }))
  },

  updateWorkflow: (id, updates) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
      ),
      currentWorkflow:
        state.currentWorkflow?.id === id
          ? { ...state.currentWorkflow, ...updates, updatedAt: new Date() }
          : state.currentWorkflow,
    }))
  },

  deleteWorkflow: (id) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      currentWorkflow:
        state.currentWorkflow?.id === id ? null : state.currentWorkflow,
    }))
  },

  saveWorkflow: async (workflowData) => {
    try {
      const { currentWorkflow } = get()
      if (!currentWorkflow) {
        // Create new workflow
        const newWorkflow = {
          ...workflowData,
          id: `workflow_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(newWorkflow),
        })

        if (!response.ok) {
          throw new Error('Failed to save workflow')
        }

        const saved = await response.json()
        set({ currentWorkflow: saved.data })
      } else {
        // Update existing workflow
        const updates = {
          ...workflowData,
          updatedAt: new Date(),
        }

        const response = await fetch(`/api/workflows/${currentWorkflow.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          throw new Error('Failed to update workflow')
        }

        const saved = await response.json()
        set({ currentWorkflow: saved.data })
      }
    } catch (error) {
      console.error('Save workflow error:', error)
      throw error
    }
  },

  executeWorkflow: async (workflowId) => {
    set({ isExecuting: true })

    try {
      const response = await fetch(`/api/executions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ workflowId }),
      })

      if (!response.ok) {
        throw new Error('Failed to execute workflow')
      }

      const execution = await response.json()

      // Update execution status
      set((state) => ({
        executionStatus: {
          ...state.executionStatus,
          [workflowId]: execution.data,
        },
      }))
    } catch (error) {
      console.error('Execute workflow error:', error)
      throw error
    } finally {
      set({ isExecuting: false })
    }
  },
}))
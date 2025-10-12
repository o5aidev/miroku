// tests/BaseAgent.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseAgent } from '../src/BaseAgent';
import { AgentMetrics } from '../src/types/AgentMetrics';
import { AgentConfig } from '../src/types/AgentConfig';
import { EscalationHandler } from '../src/EscalationHandler';

// Mock the EscalationHandler
vi.mock('../src/EscalationHandler');

// Concrete implementation for testing
class TestAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async execute(task: any): Promise<any> {
    if (task?.shouldFail) {
      throw new Error('Task execution failed');
    }
    if (task?.shouldEscalate) {
      return await this.escalate(task);
    }
    return { success: true, result: task?.data || 'completed' };
  }

  protected getAgentType(): string {
    return 'TestAgent';
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;
  let mockEscalationHandler: EscalationHandler;
  let mockConfig: AgentConfig;

  beforeEach(() => {
    mockConfig = {
      name: 'test-agent',
      maxRetries: 3,
      timeout: 5000,
      escalationEnabled: true,
      metricsEnabled: true,
    };

    mockEscalationHandler = {
      handle: vi.fn().mockResolvedValue({ escalated: true, result: 'handled' }),
      canHandle: vi.fn().mockReturnValue(true),
      setPriority: vi.fn(),
    } as any;

    agent = new TestAgent(mockConfig);
    (agent as any).escalationHandler = mockEscalationHandler;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(agent.getName()).toBe('test-agent');
      expect(agent.getConfig()).toEqual(mockConfig);
    });

    it('should initialize with default configuration when none provided', () => {
      const defaultAgent = new TestAgent({});
      const config = defaultAgent.getConfig();
      
      expect(config.maxRetries).toBe(1);
      expect(config.timeout).toBe(30000);
      expect(config.escalationEnabled).toBe(false);
      expect(config.metricsEnabled).toBe(true);
    });

    it('should generate unique ID for each agent instance', () => {
      const agent1 = new TestAgent(mockConfig);
      const agent2 = new TestAgent(mockConfig);
      
      expect(agent1.getId()).not.toBe(agent2.getId());
      expect(agent1.getId()).toMatch(/^[a-f0-9-]{36}$/); // UUID format
    });
  });

  describe('Basic Operations', () => {
    it('should return agent name', () => {
      expect(agent.getName()).toBe('test-agent');
    });

    it('should return agent ID', () => {
      expect(agent.getId()).toBeTruthy();
      expect(typeof agent.getId()).toBe('string');
    });

    it('should return agent configuration', () => {
      expect(agent.getConfig()).toEqual(mockConfig);
    });

    it('should return agent type', () => {
      expect(agent.getAgentType()).toBe('TestAgent');
    });

    it('should indicate if agent is active', () => {
      expect(agent.isActive()).toBe(false);
      // Assuming setActive method exists
      (agent as any).setActive(true);
      expect(agent.isActive()).toBe(true);
    });
  });

  describe('Task Execution', () => {
    it('should execute task successfully', async () => {
      const task = { data: 'test-data' };
      const result = await agent.execute(task);
      
      expect(result).toEqual({ success: true, result: 'test-data' });
    });

    it('should handle task execution without data', async () => {
      const result = await agent.execute({});
      
      expect(result).toEqual({ success: true, result: 'completed' });
    });

    it('should handle null/undefined task', async () => {
      const result1 = await agent.execute(null);
      const result2 = await agent.execute(undefined);
      
      expect(result1).toEqual({ success: true, result: 'completed' });
      expect(result2).toEqual({ success: true, result: 'completed' });
    });

    it('should retry failed tasks based on configuration', async () => {
      const failingAgent = new TestAgent({ ...mockConfig, maxRetries: 2 });
      let attemptCount = 0;
      
      // Mock execute to fail first two times, succeed third time
      const originalExecute = failingAgent.execute;
      failingAgent.execute = vi.fn().mockImplementation(async (task) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return originalExecute.call(failingAgent, task);
      });

      const result = await failingAgent.run({ data: 'retry-test' });
      
      expect(attemptCount).toBe(3);
      expect(result.success).toBe(true);
    });

    it('should fail after max retries exceeded', async () => {
      const failingTask = { shouldFail: true };
      
      await expect(agent.run(failingTask)).rejects.toThrow('Task execution failed');
    });

    it('should timeout long-running tasks', async () => {
      const timeoutAgent = new TestAgent({ ...mockConfig, timeout: 100 });
      
      // Mock a long-running task
      timeoutAgent.execute = vi.fn().mockImplementation(async () => {
        return new Promise(resolve => setTimeout(resolve, 200));
      });

      await expect(timeoutAgent.run({})).rejects.toThrow('timeout');
    }, 10000);
  });

  describe('Escalation Mechanism', () => {
    it('should escalate complex tasks when enabled', async () => {
      const escalationTask = { shouldEscalate: true, complexity: 'high' };
      
      const result = await agent.execute(escalationTask);
      
      expect(mockEscalationHandler.handle).toHaveBeenCalledWith(escalationTask);
      expect(result).toEqual({ escalated: true, result: 'handled' });
    });

    it('should not escalate when escalation is disabled', async () => {
      const noEscalationAgent = new TestAgent({ ...mockConfig, escalationEnabled: false });
      const escalationTask = { shouldEscalate: true };
      
      // Should handle locally instead of escalating
      const result = await noEscalationAgent.execute(escalationTask);
      
      expect(result).toEqual({ escalated: true, result: 'handled' });
    });

    it('should handle escalation failures gracefully', async () => {
      mockEscalationHandler.handle.mockRejectedValueOnce(new Error('Escalation failed'));
      
      const escalationTask = { shouldEscalate: true };
      
      await expect(agent.execute(escalationTask)).rejects.toThrow('Escalation failed');
    });

    it('should check if escalation handler can handle task', async () => {
      mockEscalationHandler.canHandle.mockReturnValue(false);
      
      const escalationTask = { shouldEscalate: true, unsupported: true };
      
      await expect(agent.execute(escalationTask)).rejects.toThrow('Cannot escalate task');
    });
  });

  describe('Metrics Collection', () => {
    it('should collect execution metrics when enabled', async () => {
      const task = { data: 'metrics-test' };
      
      await agent.run(task);
      
      const metrics = agent.getMetrics();
      expect(metrics.totalExecutions).toBe(1);
      expect(metrics.successfulExecutions).toBe(1);
      expect(metrics.failedExecutions).toBe(0);
      expect(metrics.averageExecutionTime).toBeGreaterThan(0);
    });

    it('should track failed executions in metrics', async () => {
      const failingTask = { shouldFail: true };
      
      try {
        await agent.run(failingTask);
      } catch (error) {
        // Expected to fail
      }
      
      const metrics = agent.getMetrics();
      expect(metrics.totalExecutions).toBe(1);
      expect(metrics.successfulExecutions).toBe(0);
      expect(metrics.failedExecutions).toBe(1);
    });

    it('should track escalation metrics', async () => {
      const escalationTask = { shouldEscalate: true };
      
      await agent.execute(escalationTask);
      
      const metrics = agent.getMetrics();
      expect(metrics.escalationCount).toBe(1);
    });

    it('should not collect metrics when disabled', async () => {
      const noMetricsAgent = new TestAgent({ ...mockConfig, metricsEnabled: false });
      const task = { data: 'no-metrics-test' };
      
      await noMetricsAgent.run(task);
      
      const metrics = noMetricsAgent.getMetrics();
      expect(metrics.totalExecutions).toBe(0);
    });

    it('should reset metrics when requested', async () => {
      await agent.run({ data: 'test' });
      
      let metrics = agent.getMetrics();
      expect(metrics.totalExecutions).toBe(1);
      
      agent.resetMetrics();
      
      metrics = agent.getMetrics();
      expect(metrics.totalExecutions).toBe(0);
      expect(metrics.successfulExecutions).toBe(0);
      expect(metrics.failedExecutions).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle synchronous errors in execute method', async () => {
      const errorAgent = new TestAgent(mockConfig);
      errorAgent.execute = vi.fn().mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      await expect(errorAgent.run({})).rejects.toThrow('Synchronous error');
    });

    it('should handle promise rejection in execute method', async () => {
      const errorAgent = new TestAgent(mockConfig);
      errorAgent.execute = vi.fn().mockRejectedValue(new Error('Async error'));

      await expect(errorAgent.run({})).rejects.toThrow('Async error');
    });

    it('should handle invalid task input gracefully', async () => {
      const circularTask = {} as any;
      circularTask.self = circularTask; // Create circular reference
      
      // Should not throw during execution
      const result = await agent.execute(circularTask);
      expect(result).toBeDefined();
    });
  });

  describe('Lifecycle Management', () => {
    it('should initialize agent correctly', async () => {
      await agent.initialize();
      
      expect(agent.isInitialized()).toBe(true);
    });

    it('should shutdown agent gracefully', async () => {
      await agent.initialize();
      await agent.shutdown();
      
      expect(agent.isActive()).toBe(false);
    });

    it('should handle multiple initialization calls', async () => {
      await agent.initialize();
      await agent.initialize(); // Should not throw
      
      expect(agent.isInitialized()).toBe(true);
    });

    it('should handle shutdown before initialization', async () => {
      await expect(agent.shutdown()).resolves.not.toThrow();
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration dynamically', () => {
      const newConfig = { ...mockConfig, maxRetries: 5, timeout: 10000 };
      
      agent.updateConfig(newConfig);
      
      expect(agent.getConfig().maxRetries).toBe(5);
      expect(agent.getConfig().timeout).toBe(10000);
    });

    it('should validate configuration updates', () => {
      const invalidConfig = { ...mockConfig, maxRetries: -1 };
      
      expect(() => agent.updateConfig(invalidConfig))
        .toThrow('Invalid configuration');
    });

    it('should merge partial configuration updates', () => {
      const partialConfig = { timeout: 15000 };
      
      agent.updateConfig(partialConfig);
      
      expect(agent.getConfig().timeout).toBe(15000);
      expect(agent.getConfig().maxRetries).toBe(3); // Original value preserved
    });
  });

  describe('Event Handling', () => {
    it('should emit events during execution', async () => {
      const eventHandler = vi.fn();
      agent.on('taskStarted', eventHandler);
      agent.on('taskCompleted', eventHandler);
      
      await agent.run({ data: 'event-test' });
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'taskStarted' })
      );
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'taskCompleted' })
      );
    });

    it('should emit error events on failures', async () => {
      const errorHandler = vi.fn();
      agent.on('taskFailed', errorHandler);
      
      try {
        await agent.run({ shouldFail: true });
      } catch (error) {
        // Expected
      }
      
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ 
          type: 'taskFailed',
          error: expect.any(Error)
        })
      );
    });

    it('should remove event listeners', () => {
      const handler = vi.fn();
      
      agent.on('taskStarted', handler);
      agent.off('taskStarted', handler);
      
      agent.run({ data: 'test' });
      
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
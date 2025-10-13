import { BaseAgent } from '../agents/base-agent.js';
import { AgentType, Task, AgentConfig } from '../agents/types/index.js';

// Mock implementation for testing
class TestAgent extends BaseAgent {
  private shouldFail: boolean = false;
  private executionCount: number = 0;

  constructor(config: AgentConfig) {
    super(AgentType.CODER, config);
  }

  public setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  public getExecutionCount(): number {
    return this.executionCount;
  }

  protected async executeTask<T>(task: Task): Promise<T> {
    this.executionCount++;
    
    if (this.shouldFail) {
      throw new Error('Test execution failure');
    }

    return 'success' as T;
  }
}

describe('BaseAgent', () => {
  let testAgent: TestAgent;
  let testTask: Task;
  let config: AgentConfig;

  beforeEach(() => {
    config = {
      maxRetries: 2,
      timeoutMs: 5000,
      escalationThreshold: 1,
      enableMetrics: true,
      logLevel: 'info'
    };
    
    testAgent = new TestAgent(config);
    
    testTask = {
      id: 'test-task-1',
      description: 'Test task description',
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  describe('execute', () => {
    it('should execute task successfully', async () => {
      const result = await testAgent.execute(testTask);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.metrics).toBeDefined();
      expect(result.metrics.executionTimeMs).toBeGreaterThan(0);
    });

    it('should retry on failure and eventually succeed', async () => {
      testAgent.setShouldFail(true);
      
      // Make it succeed on the second attempt
      setTimeout(() => {
        testAgent.setShouldFail(false);
      }, 100);
      
      const result = await testAgent.execute(testTask);
      
      expect(testAgent.getExecutionCount()).toBeGreaterThan(1);
    });

    it('should fail after max retries', async () => {
      testAgent.setShouldFail(true);
      
      const result = await testAgent.execute(testTask);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Task failed after');
      expect(testAgent.getExecutionCount()).toBe(config.maxRetries + 1);
    });

    it('should collect metrics correctly', async () => {
      const result = await testAgent.execute(testTask);
      
      expect(result.metrics.executionTimeMs).toBeGreaterThan(0);
      expect(result.metrics.memoryUsageMB).toBeGreaterThan(0);
      expect(result.metrics.retryCount).toBe(0);
      expect(result.metrics.escalationCount).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should return current configuration', () => {
      const currentConfig = testAgent.getConfig();
      expect(currentConfig).toEqual(config);
    });

    it('should update configuration', () => {
      const updates = { maxRetries: 5, timeoutMs: 10000 };
      testAgent.updateConfig(updates);
      
      const updatedConfig = testAgent.getConfig();
      expect(updatedConfig.maxRetries).toBe(5);
      expect(updatedConfig.timeoutMs).toBe(10000);
    });
  });
});
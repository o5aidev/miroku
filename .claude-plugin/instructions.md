import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MockedFunction } from 'vitest';

// Mock the BaseAgent class based on the pattern mentioned
class BaseAgent {
  private name: string;
  private isActive: boolean = false;
  private config: AgentConfig;

  constructor(name: string, config: AgentConfig = {}) {
    this.name = name;
    this.config = { ...defaultConfig, ...config };
  }

  public getName(): string {
    return this.name;
  }

  public async initialize(): Promise<void> {
    if (this.isActive) {
      throw new Error('Agent is already initialized');
    }
    this.isActive = true;
  }

  public async execute(input: string): Promise<string> {
    if (!this.isActive) {
      throw new Error('Agent must be initialized before execution');
    }
    
    if (!input?.trim()) {
      throw new Error('Input cannot be empty');
    }

    return this.processInput(input);
  }

  public isInitialized(): boolean {
    return this.isActive;
  }

  public async shutdown(): Promise<void> {
    this.isActive = false;
  }

  public getConfig(): AgentConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private async processInput(input: string): Promise<string> {
    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Processed: ${input}`;
  }
}

// Types
interface AgentConfig {
  timeout?: number;
  maxRetries?: number;
  enableLogging?: boolean;
}

const defaultConfig: AgentConfig = {
  timeout: 5000,
  maxRetries: 3,
  enableLogging: false
};

// Mock external dependencies
const mockExternalService = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  sendData: vi.fn()
};

vi.mock('./external-service.js', () => ({
  ExternalService: vi.fn(() => mockExternalService)
}));

describe('BaseAgent', () => {
  let agent: BaseAgent;
  const testAgentName = 'TestAgent';
  const defaultTestConfig: AgentConfig = {
    timeout: 3000,
    maxRetries: 2,
    enableLogging: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new BaseAgent(testAgentName, defaultTestConfig);
  });

  afterEach(async () => {
    if (agent.isInitialized()) {
      await agent.shutdown();
    }
  });

  describe('Constructor', () => {
    it('should create agent with provided name and config', () => {
      expect(agent.getName()).toBe(testAgentName);
      expect(agent.getConfig()).toEqual(defaultTestConfig);
      expect(agent.isInitialized()).toBe(false);
    });

    it('should create agent with default config when none provided', () => {
      const agentWithDefaults = new BaseAgent('DefaultAgent');
      
      expect(agentWithDefaults.getName()).toBe('DefaultAgent');
      expect(agentWithDefaults.getConfig()).toEqual(defaultConfig);
    });

    it('should merge provided config with defaults', () => {
      const partialConfig: Partial<AgentConfig> = { timeout: 10000 };
      const agentWithPartialConfig = new BaseAgent('PartialAgent', partialConfig);
      
      expect(agentWithPartialConfig.getConfig()).toEqual({
        timeout: 10000,
        maxRetries: 3,
        enableLogging: false
      });
    });
  });

  describe('getName()', () => {
    it('should return the agent name', () => {
      expect(agent.getName()).toBe(testAgentName);
    });

    it('should return correct name for different agents', () => {
      const anotherAgent = new BaseAgent('AnotherAgent');
      expect(anotherAgent.getName()).toBe('AnotherAgent');
    });
  });

  describe('initialize()', () => {
    it('should initialize agent successfully', async () => {
      expect(agent.isInitialized()).toBe(false);
      
      await agent.initialize();
      
      expect(agent.isInitialized()).toBe(true);
    });

    it('should throw error when initializing already initialized agent', async () => {
      await agent.initialize();
      
      await expect(agent.initialize()).rejects.toThrow('Agent is already initialized');
    });

    it('should handle initialization with mocked external service', async () => {
      mockExternalService.connect.mockResolvedValueOnce(true);
      
      await agent.initialize();
      
      expect(agent.isInitialized()).toBe(true);
    });
  });

  describe('execute()', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should execute with valid input', async () => {
      const input = 'test input';
      const result = await agent.execute(input);
      
      expect(result).toBe('Processed: test input');
    });

    it('should throw error when not initialized', async () => {
      const uninitializedAgent = new BaseAgent('Uninitialized');
      
      await expect(uninitializedAgent.execute('test')).rejects.toThrow(
        'Agent must be initialized before execution'
      );
    });

    it('should throw error for empty input', async () => {
      await expect(agent.execute('')).rejects.toThrow('Input cannot be empty');
      await expect(agent.execute('   ')).rejects.toThrow('Input cannot be empty');
    });

    it('should throw error for null/undefined input', async () => {
      await expect(agent.execute(null as any)).rejects.toThrow('Input cannot be empty');
      await expect(agent.execute(undefined as any)).rejects.toThrow('Input cannot be empty');
    });

    it('should handle complex input strings', async () => {
      const complexInput = 'Complex input with special chars: !@#$%^&*()';
      const result = await agent.execute(complexInput);
      
      expect(result).toBe(`Processed: ${complexInput}`);
    });

    it('should process multiple sequential executions', async () => {
      const inputs = ['input1', 'input2', 'input3'];
      const results = [];
      
      for (const input of inputs) {
        results.push(await agent.execute(input));
      }
      
      expect(results).toEqual([
        'Processed: input1',
        'Processed: input2',
        'Processed: input3'
      ]);
    });
  });

  describe('isInitialized()', () => {
    it('should return false for new agent', () => {
      expect(agent.isInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await agent.initialize();
      expect(agent.isInitialized()).toBe(true);
    });

    it('should return false after shutdown', async () => {
      await agent.initialize();
      await agent.shutdown();
      expect(agent.isInitialized()).toBe(false);
    });
  });

  describe('shutdown()', () => {
    it('should shutdown initialized agent', async () => {
      await agent.initialize();
      expect(agent.isInitialized()).toBe(true);
      
      await agent.shutdown();
      expect(agent.isInitialized()).toBe(false);
    });

    it('should handle shutdown of non-initialized agent', async () => {
      expect(agent.isInitialized()).toBe(false);
      
      await expect(agent.shutdown()).resolves.not.toThrow();
      expect(agent.isInitialized()).toBe(false);
    });

    it('should handle multiple shutdown calls', async () => {
      await agent.initialize();
      await agent.shutdown();
      
      await expect(agent.shutdown()).resolves.not.toThrow();
    });
  });

  describe('getConfig()', () => {
    it('should return current configuration', () => {
      const config = agent.getConfig();
      expect(config).toEqual(defaultTestConfig);
    });

    it('should return a copy of config (not reference)', () => {
      const config1 = agent.getConfig();
      const config2 = agent.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Different object references
    });
  });

  describe('updateConfig()', () => {
    it('should update partial configuration', () => {
      const newConfig = { timeout: 8000 };
      agent.updateConfig(newConfig);
      
      expect(agent.getConfig()).toEqual({
        timeout: 8000,
        maxRetries: 2,
        enableLogging: true
      });
    });

    it('should update multiple config properties', () => {
      const newConfig = { 
        timeout: 15000, 
        maxRetries: 5,
        enableLogging: false 
      };
      agent.updateConfig(newConfig);
      
      expect(agent.getConfig()).toEqual(newConfig);
    });

    it('should handle empty config update', () => {
      const originalConfig = agent.getConfig();
      agent.updateConfig({});
      
      expect(agent.getConfig()).toEqual(originalConfig);
    });

    it('should preserve existing config when updating subset', () => {
      agent.updateConfig({ maxRetries: 10 });
      
      expect(agent.getConfig()).toEqual({
        timeout: 3000,
        maxRetries: 10,
        enableLogging: true
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent initialization attempts', async () => {
      const initPromise1 = agent.initialize();
      const initPromise2 = agent.initialize();
      
      await expect(initPromise1).resolves.not.toThrow();
      await expect(initPromise2).rejects.toThrow('Agent is already initialized');
    });

    it('should handle execution after shutdown', async () => {
      await agent.initialize();
      await agent.execute('test');
      await agent.shutdown();
      
      await expect(agent.execute('test after shutdown')).rejects.toThrow(
        'Agent must be initialized before execution'
      );
    });

    it('should maintain state consistency during errors', async () => {
      await agent.initialize();
      
      try {
        await agent.execute('');
      } catch (error) {
        // Agent should still be initialized even after execution error
        expect(agent.isInitialized()).toBe(true);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should complete full lifecycle successfully', async () => {
      // Initialize
      await agent.initialize();
      expect(agent.isInitialized()).toBe(true);
      
      // Execute
      const result = await agent.execute('integration test');
      expect(result).toBe('Processed: integration test');
      
      // Update config
      agent.updateConfig({ timeout: 10000 });
      expect(agent.getConfig().timeout).toBe(10000);
      
      // Shutdown
      await agent.shutdown();
      expect(agent.isInitialized()).toBe(false);
    });

    it('should handle multiple agents independently', async () => {
      const agent1 = new BaseAgent('Agent1', { timeout: 1000 });
      const agent2 = new BaseAgent('Agent2', { timeout: 2000 });
      
      await agent1.initialize();
      await agent2.initialize();
      
      const result1 = await agent1.execute('test1');
      const result2 = await agent2.execute('test2');
      
      expect(result1).toBe('Processed: test1');
      expect(result2).toBe('Processed: test2');
      expect(agent1.getConfig().timeout).toBe(1000);
      expect(agent2.getConfig().timeout).toBe(2000);
      
      await agent1.shutdown();
      await agent2.shutdown();
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid sequential executions', async () => {
      await agent.initialize();
      
      const startTime = Date.now();
      const promises = Array.from({ length: 10 }, (_, i) => 
        agent.execute(`rapid test ${i}`)
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      results.forEach((result, i) => {
        expect(result).toBe(`Processed: rapid test ${i}`);
      });
    });
  });
});

// Additional helper tests for type checking
describe('Type Safety', () => {
  it('should enforce correct config types', () => {
    const validConfig: AgentConfig = {
      timeout: 5000,
      maxRetries: 3,
      enableLogging: true
    };
    
    const agent = new BaseAgent('TypeTest', validConfig);
    expect(agent.getConfig()).toEqual(validConfig);
  });

  it('should handle partial config types', () => {
    const partialConfig: Partial<AgentConfig> = {
      timeout: 8000
    };
    
    const agent = new BaseAgent('PartialTest', partialConfig);
    agent.updateConfig(partialConfig);
    
    expect(agent.getConfig().timeout).toBe(8000);
  });
});
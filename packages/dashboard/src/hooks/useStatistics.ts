/**
 * Hook for fetching system statistics from the dashboard server
 */
import { useState, useEffect, useCallback } from 'react';

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  ttlMs: number;
}

export interface TypeSafetyStats {
  anyTypeCount: number;
  interfaceCount: number;
  typeCheckPassed: boolean;
  circularDepsResolved: number;
}

export interface ErrorHandlingStats {
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  avgRetryTime: number;
  errorClassesUsed: number;
}

export interface TestStats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  avgDuration: number;
  coverage: number;
}

export interface SecurityStats {
  scansPerformed: number;
  issuesDetected: number;
  criticalIssues: number;
  avgSecurityScore: number;
  patternsDetected: number;
}

export interface ImprovementStats {
  typeSafety: TypeSafetyStats;
  errorHandling: ErrorHandlingStats;
  cache: CacheStats;
  tests: TestStats;
  security: SecurityStats;
}

export interface SystemStats {
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  connectedClients: number;
  onlineDevices: number;
  totalDevices: number;
  eventHistorySize: number;
}

export interface StatisticsResponse {
  success: boolean;
  timestamp: string;
  system: SystemStats;
  cache: CacheStats;
  improvements: ImprovementStats;
}

const API_URL = 'http://localhost:3001';

export function useStatistics(refreshInterval = 10000) {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/statistics`);
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }
      const data: StatisticsResponse = await response.json();
      setStatistics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStatistics();

    // Set up periodic refresh
    const interval = setInterval(fetchStatistics, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchStatistics, refreshInterval]);

  return {
    statistics,
    loading,
    error,
    refresh: fetchStatistics,
  };
}

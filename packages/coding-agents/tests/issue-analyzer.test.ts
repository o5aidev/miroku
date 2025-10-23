/**
 * IssueAnalyzer Priority Detection Test (Vitest)
 *
 * Tests the priority determination logic for GitHub Issues
 */

import { describe, it, expect } from 'vitest';
import { IssueAnalyzer } from '../utils/issue-analyzer';
import { Issue } from '../types/index';

describe('IssueAnalyzer - Priority Detection', () => {
  describe('Label-based priority detection', () => {
    it('should detect P0-Critical from labels', () => {
      const labels = ['priority:P0-Critical', 'type:bug'];
      const priority = IssueAnalyzer.determinePriority(labels, 'Critical bug', '');
      expect(priority).toBe(0);
    });

    it('should detect P1-High from labels', () => {
      const labels = ['priority:P1-High', 'type:feature'];
      const priority = IssueAnalyzer.determinePriority(labels, 'Important feature', '');
      expect(priority).toBe(1);
    });

    it('should detect P2-Normal from labels', () => {
      const labels = ['priority:P2-Normal', 'type:refactor'];
      const priority = IssueAnalyzer.determinePriority(labels, 'Code refactoring', '');
      expect(priority).toBe(2);
    });

    it('should detect P3-Low from labels', () => {
      const labels = ['priority:P3-Low', 'type:docs'];
      const priority = IssueAnalyzer.determinePriority(labels, 'Update docs', '');
      expect(priority).toBe(3);
    });
  });

  describe('Keyword-based priority detection', () => {
    it('should detect P0 from critical keywords', () => {
      const labels: string[] = [];
      const priority = IssueAnalyzer.determinePriority(
        labels,
        'Critical production outage',
        'This is a critical emergency that needs immediate attention'
      );
      expect(priority).toBe(0);
    });

    it('should detect P0 from urgent/blocking keywords', () => {
      const labels: string[] = [];
      const priority = IssueAnalyzer.determinePriority(
        labels,
        'Urgent bug fix required',
        'This is blocking production deployment'
      );
      expect(priority).toBe(0);
    });

    it('should detect P1 from high priority keywords', () => {
      const labels: string[] = [];
      const priority = IssueAnalyzer.determinePriority(
        labels,
        'High priority feature request',
        'This is important and should be done ASAP'
      );
      expect(priority).toBe(1);
    });

    it('should detect P3 from low priority keywords', () => {
      const labels: string[] = [];
      const priority = IssueAnalyzer.determinePriority(
        labels,
        'Nice to have enhancement',
        'This is a low priority feature that can be done later'
      );
      expect(priority).toBe(3);
    });

    it('should return P2 as default when no indicators', () => {
      const labels: string[] = [];
      const priority = IssueAnalyzer.determinePriority(
        labels,
        'Regular feature request',
        'Implement feature X'
      );
      expect(priority).toBe(2);
    });
  });

  describe('Priority precedence', () => {
    it('should prioritize labels over keywords', () => {
      const labels = ['priority:P3-Low'];
      const priority = IssueAnalyzer.determinePriority(
        labels,
        'Critical bug',
        'This is urgent and critical'
      );
      expect(priority).toBe(3);
    });

    it('should use first matching keyword when multiple keywords exist', () => {
      const priority = IssueAnalyzer.determinePriority(
        [],
        'Critical bug with nice to have improvement',
        'This is critical and urgent but also a nice to have'
      );
      expect(priority).toBe(0);
    });
  });

  describe('Helper methods', () => {
    it('should work with determinePriorityFromIssue() helper', () => {
      const issue: Issue = {
        number: 123,
        title: 'Critical security vulnerability',
        body: 'This is an emergency security issue',
        state: 'open',
        labels: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/test/issues/123',
      };

      const priority = IssueAnalyzer.determinePriorityFromIssue(issue);
      expect(priority).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty labels and content', () => {
      const priority = IssueAnalyzer.determinePriority([], '', '');
      expect(priority).toBe(2);
    });

    it('should be case insensitive', () => {
      const priority = IssueAnalyzer.determinePriority(
        [],
        'CRITICAL BUG',
        'THIS IS URGENT AND BLOCKING'
      );
      expect(priority).toBe(0);
    });
  });

  describe('Integration test: Multiple issues', () => {
    it('should correctly sort multiple issues by priority', () => {
      const issues: Issue[] = [
        {
          number: 270,
          title: 'Production database corruption',
          body: 'Critical issue affecting all users',
          state: 'open',
          labels: ['priority:P0-Critical', 'type:bug'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          url: 'https://github.com/test/test/issues/270',
        },
        {
          number: 271,
          title: 'Add new analytics feature',
          body: 'Important feature for product roadmap',
          state: 'open',
          labels: ['priority:P1-High', 'type:feature'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          url: 'https://github.com/test/test/issues/271',
        },
        {
          number: 272,
          title: 'Update README documentation',
          body: 'Nice to have documentation update',
          state: 'open',
          labels: ['priority:P3-Low', 'type:docs'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          url: 'https://github.com/test/test/issues/272',
        },
        {
          number: 273,
          title: 'Refactor authentication module',
          body: 'Regular code cleanup task',
          state: 'open',
          labels: ['priority:P2-Normal', 'type:refactor'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          url: 'https://github.com/test/test/issues/273',
        },
      ];

      const priorities = issues.map((issue) => ({
        number: issue.number,
        priority: IssueAnalyzer.determinePriorityFromIssue(issue),
      }));

      expect(priorities[0].priority).toBe(0); // Issue #270 should be P0
      expect(priorities[1].priority).toBe(1); // Issue #271 should be P1
      expect(priorities[2].priority).toBe(3); // Issue #272 should be P3
      expect(priorities[3].priority).toBe(2); // Issue #273 should be P2

      // Sort by priority (lower = higher priority)
      const sorted = [...priorities].sort((a, b) => a.priority - b.priority);

      expect(sorted[0].number).toBe(270); // Issue #270 should be first (P0)
      expect(sorted[1].number).toBe(271); // Issue #271 should be second (P1)
      expect(sorted[2].number).toBe(273); // Issue #273 should be third (P2)
      expect(sorted[3].number).toBe(272); // Issue #272 should be fourth (P3)
    });
  });
});

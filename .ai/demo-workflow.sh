#!/bin/bash
# Miyabi Workflow Demonstration Script
# Demonstrates the complete workflow from task discovery to completion

DASHBOARD_URL="http://localhost:3001/api/agent-event"

echo "🎬 Starting Miyabi Workflow Demonstration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Task Discovery
echo "📥 Step 1: Task Discovery - Showing incoming tasks..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "task:discovered",
    "tasks": [
      {
        "issueNumber": 47,
        "title": "Security Audit Report",
        "priority": "P3-Low",
        "labels": ["security", "audit"]
      },
      {
        "issueNumber": 58,
        "title": "Bug: miyabi init incomplete setup",
        "priority": "P1-High",
        "labels": ["bug", "critical"]
      },
      {
        "issueNumber": 56,
        "title": "Strategic: Miyabi SaaS Platform",
        "priority": "P2-Medium",
        "labels": ["enhancement", "strategic"]
      }
    ]
  }' -s > /dev/null
sleep 2

# Step 2: Coordinator Analyzing Task #58 (High Priority)
echo "🔍 Step 2: Coordinator Analyzing - Examining Issue #58..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "coordinator:analyzing",
    "issueNumber": 58,
    "title": "Bug: miyabi init incomplete setup",
    "analysis": {
      "type": "Bug Fix",
      "priority": "P1-High",
      "complexity": "Medium",
      "estimatedTime": "2-3 hours"
    }
  }' -s > /dev/null
sleep 2

# Step 3: Coordinator Decomposing Task #58
echo "🧩 Step 3: Coordinator Decomposing - Breaking down Issue #58..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "coordinator:decomposing",
    "issueNumber": 58,
    "subtasks": [
      {
        "id": "task-1",
        "title": "Analyze init command implementation",
        "type": "investigation",
        "dependencies": []
      },
      {
        "id": "task-2",
        "title": "Fix incomplete setup logic",
        "type": "code-fix",
        "dependencies": ["task-1"]
      },
      {
        "id": "task-3",
        "title": "Add validation tests",
        "type": "testing",
        "dependencies": ["task-2"]
      }
    ]
  }' -s > /dev/null
sleep 2

# Step 4: Coordinator Assigning Tasks
echo "🎯 Step 4: Coordinator Assigning - Delegating to specialist agents..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "coordinator:assigning",
    "issueNumber": 58,
    "assignments": [
      {
        "agentId": "codegen",
        "taskId": "task-2",
        "reason": "Best suited for code implementation and bug fixes"
      },
      {
        "agentId": "test",
        "taskId": "task-3",
        "reason": "Specialized in test creation and validation"
      }
    ]
  }' -s > /dev/null
sleep 2

# Step 5: CodeGenAgent Starts Working
echo "💻 Step 5: CodeGenAgent - Starting implementation..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "started",
    "agentId": "codegen",
    "issueNumber": 58,
    "parameters": {
      "taskTitle": "Fix incomplete setup logic",
      "taskDescription": "Implement proper validation and setup completion",
      "priority": "P1-High",
      "estimatedDuration": "1.5 hours"
    }
  }' -s > /dev/null
sleep 0.5

# CodeGenAgent Progress Updates
echo "  📈 CodeGenAgent progress: 25%..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "progress",
    "agentId": "codegen",
    "issueNumber": 58,
    "progress": 25,
    "message": "Analyzing init command structure"
  }' -s > /dev/null
sleep 0.5

echo "  📈 CodeGenAgent progress: 50%..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "progress",
    "agentId": "codegen",
    "issueNumber": 58,
    "progress": 50,
    "message": "Implementing validation logic"
  }' -s > /dev/null
sleep 0.5

echo "  📈 CodeGenAgent progress: 75%..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "progress",
    "agentId": "codegen",
    "issueNumber": 58,
    "progress": 75,
    "message": "Adding error handling"
  }' -s > /dev/null
sleep 0.5

echo "  ✅ CodeGenAgent completed!"
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "completed",
    "agentId": "codegen",
    "issueNumber": 58,
    "result": {
      "success": true,
      "labelsAdded": ["state:implementing"]
    }
  }' -s > /dev/null
sleep 1

# Step 6: Now analyze Issue #47 (Security Audit)
echo "🔍 Step 6: Coordinator Analyzing - Examining Issue #47..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "coordinator:analyzing",
    "issueNumber": 47,
    "title": "Security Audit Report",
    "analysis": {
      "type": "Security Audit",
      "priority": "P3-Low",
      "complexity": "Low",
      "estimatedTime": "1 hour"
    }
  }' -s > /dev/null
sleep 1.5

echo "🎯 Coordinator Assigning - Issue #47 to IssueAgent..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "coordinator:assigning",
    "issueNumber": 47,
    "assignments": [
      {
        "agentId": "issue",
        "taskId": "audit-review",
        "reason": "Specialized in issue analysis and labeling"
      }
    ]
  }' -s > /dev/null
sleep 1

# Step 7: IssueAgent Working
echo "📋 Step 7: IssueAgent - Processing security audit..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "started",
    "agentId": "issue",
    "issueNumber": 47,
    "parameters": {
      "taskTitle": "Review and categorize security audit",
      "taskDescription": "Analyze security findings and apply labels",
      "priority": "P3-Low"
    }
  }' -s > /dev/null
sleep 0.5

echo "  📈 IssueAgent progress: 40%..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "progress",
    "agentId": "issue",
    "issueNumber": 47,
    "progress": 40,
    "message": "Analyzing security report"
  }' -s > /dev/null
sleep 0.5

echo "  📈 IssueAgent progress: 80%..."
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "progress",
    "agentId": "issue",
    "issueNumber": 47,
    "progress": 80,
    "message": "Applying labels"
  }' -s > /dev/null
sleep 0.5

echo "  ✅ IssueAgent completed!"
curl -X POST "$DASHBOARD_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "completed",
    "agentId": "issue",
    "issueNumber": 47,
    "result": {
      "success": true,
      "labelsAdded": ["state:analyzing", "security"]
    }
  }' -s > /dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Workflow Demonstration Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

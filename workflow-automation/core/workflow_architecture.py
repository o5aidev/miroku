"""
AGI2 Workflow Architecture
===========================

Node-based workflow system with dependency management and parallel execution.
Inspired by AGI2 architecture for autonomous agent orchestration.

Features:
- DAG (Directed Acyclic Graph) workflow execution
- Parallel task execution with async/await
- WBS (Work Breakdown Structure) for task decomposition
- Stage-based execution (Requirement → Design → Implementation → Testing → Deployment)
"""

import asyncio
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Callable, Awaitable
from enum import Enum
import time
from datetime import datetime


class WorkflowStage(Enum):
    """Workflow lifecycle stages"""
    REQUIREMENT = "requirement_analysis"
    DESIGN = "design"
    IMPLEMENTATION = "implementation"
    TESTING = "testing"
    DEPLOYMENT = "deployment"


class NodeStatus(Enum):
    """Node execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class WorkflowNode:
    """
    Represents a single task/node in the workflow.

    Attributes:
        id: Unique node identifier
        name: Human-readable node name
        stage: Workflow stage this node belongs to
        executor: Async function to execute this node
        dependencies: List of node IDs this node depends on
        parallel_group: Optional group ID for parallel execution
    """
    id: str
    name: str
    stage: WorkflowStage
    executor: Callable[[Dict[str, Any]], Awaitable[Any]]
    dependencies: List[str] = field(default_factory=list)
    parallel_group: Optional[str] = None
    status: NodeStatus = NodeStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None

    @property
    def duration_ms(self) -> Optional[float]:
        """Calculate execution duration in milliseconds."""
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time) * 1000
        return None

    def to_dict(self) -> Dict[str, Any]:
        """Serialize node to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "stage": self.stage.value,
            "status": self.status.value,
            "dependencies": self.dependencies,
            "parallel_group": self.parallel_group,
            "duration_ms": self.duration_ms,
            "error": self.error
        }


@dataclass
class WorkflowResult:
    """Workflow execution result"""
    success: bool
    total_duration_ms: float
    nodes_completed: int
    nodes_failed: int
    results: Dict[str, Any]
    errors: List[str]


class WorkflowArchitecture:
    """
    AGI2 Workflow Architecture - DAG-based task orchestration.

    Supports:
    - Automatic dependency resolution
    - Parallel execution of independent nodes
    - Stage-based execution
    - WBS task decomposition
    """

    def __init__(self, name: str):
        self.name = name
        self.nodes: Dict[str, WorkflowNode] = {}
        self.execution_order: List[List[str]] = []  # List of parallel batches

    def add_node(
        self,
        node_id: str,
        name: str,
        stage: WorkflowStage,
        executor: Callable[[Dict[str, Any]], Awaitable[Any]],
        dependencies: Optional[List[str]] = None,
        parallel_group: Optional[str] = None
    ) -> WorkflowNode:
        """Register a new node in the workflow."""
        node = WorkflowNode(
            id=node_id,
            name=name,
            stage=stage,
            executor=executor,
            dependencies=dependencies or [],
            parallel_group=parallel_group
        )
        self.nodes[node_id] = node
        return node

    def compute_execution_order(self) -> List[List[str]]:
        """
        Compute execution order using topological sort with parallel batching.

        Returns:
            List of batches, where each batch contains node IDs that can run in parallel.
        """
        in_degree = {node_id: 0 for node_id in self.nodes}
        adjacency = {node_id: [] for node_id in self.nodes}

        # Build adjacency list and compute in-degrees
        for node_id, node in self.nodes.items():
            for dep_id in node.dependencies:
                adjacency[dep_id].append(node_id)
                in_degree[node_id] += 1

        batches = []
        remaining = set(self.nodes.keys())

        while remaining:
            # Find all nodes with no dependencies (in_degree == 0)
            ready = [node_id for node_id in remaining if in_degree[node_id] == 0]

            if not ready:
                raise ValueError("Circular dependency detected in workflow!")

            batches.append(ready)

            # Remove processed nodes and update in-degrees
            for node_id in ready:
                remaining.remove(node_id)
                for neighbor in adjacency[node_id]:
                    in_degree[neighbor] -= 1

        self.execution_order = batches
        return batches

    async def execute_node(
        self,
        node: WorkflowNode,
        context: Dict[str, Any]
    ) -> Any:
        """Execute a single node with error handling."""
        print(f"  ▸ Executing: {node.name} ({node.id})")
        node.status = NodeStatus.RUNNING
        node.start_time = time.time()

        try:
            result = await node.executor(context)
            node.result = result
            node.status = NodeStatus.COMPLETED
            node.end_time = time.time()
            print(f"  ✓ Completed: {node.name} ({node.duration_ms:.2f}ms)")
            return result

        except Exception as e:
            node.error = str(e)
            node.status = NodeStatus.FAILED
            node.end_time = time.time()
            print(f"  ✗ Failed: {node.name} - {e}")
            raise

    async def execute_batch(
        self,
        batch: List[str],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a batch of nodes in parallel."""
        nodes = [self.nodes[node_id] for node_id in batch]
        tasks = [self.execute_node(node, context) for node in nodes]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Store results in context
        batch_results = {}
        for node_id, result in zip(batch, results):
            if isinstance(result, Exception):
                batch_results[node_id] = {"error": str(result)}
            else:
                batch_results[node_id] = result
                context[node_id] = result  # Make result available to dependent nodes

        return batch_results

    async def execute(self, initial_context: Optional[Dict[str, Any]] = None) -> WorkflowResult:
        """
        Execute the entire workflow.

        Args:
            initial_context: Initial data passed to first nodes

        Returns:
            WorkflowResult with execution summary
        """
        print(f"\n{'='*60}")
        print(f"Executing Workflow: {self.name}")
        print(f"{'='*60}\n")

        # Compute execution order
        self.compute_execution_order()
        print(f"Execution plan: {len(self.execution_order)} batches")
        for i, batch in enumerate(self.execution_order, 1):
            print(f"  Batch {i}: {len(batch)} nodes (parallel)")

        print()

        # Initialize context
        context = initial_context or {}
        all_results = {}
        errors = []
        workflow_start = time.time()

        # Execute batches sequentially, nodes within each batch in parallel
        for batch_idx, batch in enumerate(self.execution_order, 1):
            print(f"Batch {batch_idx}/{len(self.execution_order)} - {len(batch)} nodes")

            try:
                batch_results = await self.execute_batch(batch, context)
                all_results.update(batch_results)

                # Check for errors
                for node_id, result in batch_results.items():
                    if isinstance(result, dict) and "error" in result:
                        errors.append(f"{node_id}: {result['error']}")

            except Exception as e:
                errors.append(f"Batch {batch_idx} failed: {str(e)}")
                print(f"  ✗ Batch {batch_idx} failed: {e}")
                break

            print()

        workflow_end = time.time()
        total_duration = (workflow_end - workflow_start) * 1000

        # Calculate statistics
        nodes_completed = sum(1 for n in self.nodes.values() if n.status == NodeStatus.COMPLETED)
        nodes_failed = sum(1 for n in self.nodes.values() if n.status == NodeStatus.FAILED)

        print(f"{'='*60}")
        print(f"Workflow Completed: {self.name}")
        print(f"  Total Duration: {total_duration:.2f}ms")
        print(f"  Nodes Completed: {nodes_completed}/{len(self.nodes)}")
        print(f"  Nodes Failed: {nodes_failed}")
        print(f"{'='*60}\n")

        return WorkflowResult(
            success=nodes_failed == 0,
            total_duration_ms=total_duration,
            nodes_completed=nodes_completed,
            nodes_failed=nodes_failed,
            results=all_results,
            errors=errors
        )

    def visualize_dag(self) -> str:
        """Generate ASCII visualization of the workflow DAG."""
        output = [f"Workflow: {self.name}", "=" * 60, ""]

        # Group nodes by stage
        stages = {}
        for node in self.nodes.values():
            if node.stage not in stages:
                stages[node.stage] = []
            stages[node.stage].append(node)

        for stage in WorkflowStage:
            if stage in stages:
                output.append(f"\n{stage.value.upper()}:")
                for node in stages[stage]:
                    deps = ", ".join(node.dependencies) if node.dependencies else "None"
                    parallel = f" [Parallel: {node.parallel_group}]" if node.parallel_group else ""
                    output.append(f"  • {node.id} ({node.name}){parallel}")
                    output.append(f"    Dependencies: {deps}")

        return "\n".join(output)

    def get_execution_summary(self) -> Dict[str, Any]:
        """Get summary of workflow execution statistics."""
        return {
            "workflow_name": self.name,
            "total_nodes": len(self.nodes),
            "batches": len(self.execution_order),
            "nodes_by_status": {
                status.value: sum(1 for n in self.nodes.values() if n.status == status)
                for status in NodeStatus
            },
            "nodes_by_stage": {
                stage.value: sum(1 for n in self.nodes.values() if n.stage == stage)
                for stage in WorkflowStage
            },
            "average_node_duration_ms": sum(
                n.duration_ms for n in self.nodes.values() if n.duration_ms
            ) / len([n for n in self.nodes.values() if n.duration_ms]) if any(n.duration_ms for n in self.nodes.values()) else 0
        }


# Work Breakdown Structure (WBS) helpers
def create_wbs_nodes(
    workflow: WorkflowArchitecture,
    parent_task: str,
    subtasks: List[tuple],  # [(node_id, name, executor, dependencies)]
    stage: WorkflowStage
) -> List[WorkflowNode]:
    """
    Create WBS (Work Breakdown Structure) nodes for a parent task.

    Args:
        workflow: Target workflow
        parent_task: Parent task identifier
        subtasks: List of (node_id, name, executor, dependencies)
        stage: Workflow stage

    Returns:
        List of created nodes
    """
    nodes = []
    for node_id, name, executor, dependencies in subtasks:
        full_id = f"{parent_task}.{node_id}"
        node = workflow.add_node(
            node_id=full_id,
            name=name,
            stage=stage,
            executor=executor,
            dependencies=[f"{parent_task}.{d}" if d else parent_task for d in (dependencies or [])]
        )
        nodes.append(node)
    return nodes


if __name__ == "__main__":
    # Demo: Simple workflow
    async def demo():
        workflow = WorkflowArchitecture("Demo Workflow")

        # Define sample executors
        async def fetch_data(ctx):
            await asyncio.sleep(0.1)
            return {"data": "sample"}

        async def process_data(ctx):
            await asyncio.sleep(0.2)
            return {"processed": True}

        async def save_results(ctx):
            await asyncio.sleep(0.1)
            return {"saved": True}

        # Build workflow
        workflow.add_node("fetch", "Fetch Data", WorkflowStage.REQUIREMENT, fetch_data)
        workflow.add_node("process1", "Process A", WorkflowStage.IMPLEMENTATION, process_data, ["fetch"])
        workflow.add_node("process2", "Process B", WorkflowStage.IMPLEMENTATION, process_data, ["fetch"])
        workflow.add_node("save", "Save Results", WorkflowStage.DEPLOYMENT, save_results, ["process1", "process2"])

        print(workflow.visualize_dag())
        print()

        result = await workflow.execute()
        print(f"\nSuccess: {result.success}")
        print(f"Duration: {result.total_duration_ms:.2f}ms")

    asyncio.run(demo())

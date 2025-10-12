#!/usr/bin/env python3
"""
Workflow Automation Demo
=========================

Demonstrates core functionality without Streamlit UI.
Shows Entity Relation Mapping and Workflow Architecture in action.

Usage:
    python app.py
"""

import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.entity_mapping import create_seo_blog_entity_map
from core.workflow_architecture import WorkflowArchitecture, WorkflowStage


async def demo_entity_mapping():
    """Demonstrate Entity Relation Mapping system"""
    print("\n" + "="*80)
    print("DEMO 1: Entity Relation Mapping")
    print("="*80 + "\n")

    # Create SEO blog entity map
    erm = create_seo_blog_entity_map()

    # Visualize
    print(erm.visualize_ascii())

    print("\n" + "-"*80)
    print("LLM-Optimized Notation:")
    print("-"*80)
    print(erm.to_notation())

    print("\n" + "-"*80)
    print("Execution Order (Dependency-Resolved):")
    print("-"*80)
    execution_order = erm.get_execution_order()
    for i, entity in enumerate(execution_order, 1):
        deps = erm.get_high_priority_dependencies(entity)
        deps_str = ", ".join(str(d) for d in deps) if deps else "None"
        print(f"  {i:2d}. {entity} (depends on: {deps_str})")


async def demo_workflow_architecture():
    """Demonstrate AGI2 Workflow Architecture"""
    print("\n\n" + "="*80)
    print("DEMO 2: AGI2 Workflow Architecture")
    print("="*80 + "\n")

    # Create workflow
    workflow = WorkflowArchitecture("Sample SEO Workflow")

    # Define sample executors
    async def fetch_keyword(ctx):
        keyword = ctx.get('keyword', 'AI automation')
        print(f"    → Using keyword: '{keyword}'")
        await asyncio.sleep(0.1)
        return keyword

    async def fetch_serp_results(ctx):
        keyword = ctx.get('fetch_keyword', 'unknown')
        print(f"    → Fetching SERP results for '{keyword}'...")
        await asyncio.sleep(0.2)
        return {
            "results": [
                {"title": "Result 1", "url": "https://example.com/1"},
                {"title": "Result 2", "url": "https://example.com/2"},
                {"title": "Result 3", "url": "https://example.com/3"},
            ]
        }

    async def scrape_url_1(ctx):
        print("    → Scraping URL 1...")
        await asyncio.sleep(0.15)
        return {"content": "Content from URL 1", "words": 500}

    async def scrape_url_2(ctx):
        print("    → Scraping URL 2...")
        await asyncio.sleep(0.15)
        return {"content": "Content from URL 2", "words": 750}

    async def scrape_url_3(ctx):
        print("    → Scraping URL 3...")
        await asyncio.sleep(0.15)
        return {"content": "Content from URL 3", "words": 600}

    async def analyze_intent(ctx):
        print("    → Analyzing user intent...")
        await asyncio.sleep(0.2)
        return {
            "primary_intent": "informational",
            "keywords": ["AI", "automation", "business"],
            "topics": ["efficiency", "cost reduction", "scalability"]
        }

    async def generate_title(ctx):
        intent = ctx.get('analyze_intent', {})
        print(f"    → Generating title for intent: {intent.get('primary_intent', 'unknown')}...")
        await asyncio.sleep(0.15)
        return "The Complete Guide to AI Automation for Modern Businesses"

    async def generate_structure(ctx):
        title = ctx.get('generate_title', 'Untitled')
        print(f"    → Generating structure for: {title[:50]}...")
        await asyncio.sleep(0.15)
        return {
            "headings": [
                {"level": "h2", "text": "Introduction"},
                {"level": "h2", "text": "Benefits of AI Automation"},
                {"level": "h2", "text": "Implementation Guide"},
                {"level": "h2", "text": "Conclusion"}
            ]
        }

    async def generate_section_1(ctx):
        print("    → Generating Section 1: Introduction...")
        await asyncio.sleep(0.2)
        return {"content": "Introduction content...", "words": 300}

    async def generate_section_2(ctx):
        print("    → Generating Section 2: Benefits...")
        await asyncio.sleep(0.2)
        return {"content": "Benefits content...", "words": 500}

    async def generate_section_3(ctx):
        print("    → Generating Section 3: Implementation...")
        await asyncio.sleep(0.2)
        return {"content": "Implementation content...", "words": 700}

    async def generate_section_4(ctx):
        print("    → Generating Section 4: Conclusion...")
        await asyncio.sleep(0.2)
        return {"content": "Conclusion content...", "words": 200}

    # Build workflow
    print("Building workflow...")

    # Stage 1: Requirement (Input)
    workflow.add_node(
        "fetch_keyword",
        "Fetch Keyword",
        WorkflowStage.REQUIREMENT,
        fetch_keyword
    )

    # Stage 2: Design (SERP Research)
    workflow.add_node(
        "fetch_serp",
        "Fetch SERP Results",
        WorkflowStage.DESIGN,
        fetch_serp_results,
        dependencies=["fetch_keyword"]
    )

    # Stage 3: Implementation (Web Scraping - Parallel)
    workflow.add_node(
        "scrape_1",
        "Scrape URL 1",
        WorkflowStage.IMPLEMENTATION,
        scrape_url_1,
        dependencies=["fetch_serp"],
        parallel_group="scraping"
    )
    workflow.add_node(
        "scrape_2",
        "Scrape URL 2",
        WorkflowStage.IMPLEMENTATION,
        scrape_url_2,
        dependencies=["fetch_serp"],
        parallel_group="scraping"
    )
    workflow.add_node(
        "scrape_3",
        "Scrape URL 3",
        WorkflowStage.IMPLEMENTATION,
        scrape_url_3,
        dependencies=["fetch_serp"],
        parallel_group="scraping"
    )

    # Stage 4: Implementation (Analysis & Generation)
    workflow.add_node(
        "analyze_intent",
        "Analyze User Intent",
        WorkflowStage.IMPLEMENTATION,
        analyze_intent,
        dependencies=["scrape_1", "scrape_2", "scrape_3"]
    )
    workflow.add_node(
        "generate_title",
        "Generate Title",
        WorkflowStage.IMPLEMENTATION,
        generate_title,
        dependencies=["analyze_intent"]
    )
    workflow.add_node(
        "generate_structure",
        "Generate Structure",
        WorkflowStage.IMPLEMENTATION,
        generate_structure,
        dependencies=["generate_title"]
    )

    # Stage 5: Implementation (Content Generation - Parallel)
    workflow.add_node(
        "section_1",
        "Generate Section 1",
        WorkflowStage.IMPLEMENTATION,
        generate_section_1,
        dependencies=["generate_structure"],
        parallel_group="content_generation"
    )
    workflow.add_node(
        "section_2",
        "Generate Section 2",
        WorkflowStage.IMPLEMENTATION,
        generate_section_2,
        dependencies=["generate_structure"],
        parallel_group="content_generation"
    )
    workflow.add_node(
        "section_3",
        "Generate Section 3",
        WorkflowStage.IMPLEMENTATION,
        generate_section_3,
        dependencies=["generate_structure"],
        parallel_group="content_generation"
    )
    workflow.add_node(
        "section_4",
        "Generate Section 4",
        WorkflowStage.IMPLEMENTATION,
        generate_section_4,
        dependencies=["generate_structure"],
        parallel_group="content_generation"
    )

    # Visualize DAG
    print("\n" + workflow.visualize_dag())

    # Execute workflow
    print("\n" + "-"*80)
    print("Executing Workflow...")
    print("-"*80 + "\n")

    result = await workflow.execute(initial_context={"keyword": "AI automation"})

    # Print results
    print("\n" + "-"*80)
    print("Workflow Results:")
    print("-"*80)
    print(f"Success: {result.success}")
    print(f"Total Duration: {result.total_duration_ms:.2f}ms")
    print(f"Nodes Completed: {result.nodes_completed}/{result.nodes_completed + result.nodes_failed}")

    if result.errors:
        print(f"\nErrors:")
        for error in result.errors:
            print(f"  - {error}")

    # Print summary
    summary = workflow.get_execution_summary()
    print("\n" + "-"*80)
    print("Execution Summary:")
    print("-"*80)
    print(f"Total Nodes: {summary['total_nodes']}")
    print(f"Execution Batches: {summary['batches']}")
    print(f"Average Node Duration: {summary['average_node_duration_ms']:.2f}ms")

    print("\nNodes by Status:")
    for status, count in summary['nodes_by_status'].items():
        if count > 0:
            print(f"  {status}: {count}")

    print("\nNodes by Stage:")
    for stage, count in summary['nodes_by_stage'].items():
        if count > 0:
            print(f"  {stage}: {count}")


async def main():
    """Main demo function"""
    print("\n" + "="*80)
    print("  WORKFLOW AUTOMATION SYSTEM - DEMO")
    print("="*80)

    # Demo 1: Entity Relation Mapping
    await demo_entity_mapping()

    # Demo 2: Workflow Architecture
    await demo_workflow_architecture()

    print("\n\n" + "="*80)
    print("  DEMO COMPLETE")
    print("="*80)
    print("\nKey Observations:")
    print("  1. Entity Relation Mapping provides LLM-optimized workflow notation")
    print("  2. Workflow executes tasks in parallel when possible")
    print("  3. Notice Batch 2 (scraping): 3 nodes executed in parallel")
    print("  4. Notice Batch 6 (content): 4 sections generated in parallel")
    print("  5. Total time is much less than sum of individual durations\n")
    print("Next Steps:")
    print("  - Run the full SEO Blog Generator: streamlit run examples/seo_blog_generator.py")
    print("  - Customize workflows in core/workflow_architecture.py")
    print("  - Create custom entity maps in core/entity_mapping.py\n")


if __name__ == "__main__":
    asyncio.run(main())

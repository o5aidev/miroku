"""
Entity Relation Mapping System
==============================

LLM-optimized entity relationship notation for workflow automation.
Uses N1, N2, N3 notation with $H (high) and $L (low) relationship markers.

Example:
  N1:UserRequest $H→ N2:SearchQuery $H→ N3:SerpResults
  N2:SearchQuery $L← N3:CompetitorAnalysis
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set
from enum import Enum


class RelationType(Enum):
    """Relationship strength indicators"""
    HIGH = "$H"  # Critical dependency
    LOW = "$L"   # Optional dependency


class EntityLevel(Enum):
    """Entity hierarchy levels"""
    N1 = "N1"  # Primary/Root entities
    N2 = "N2"  # Secondary/Processing entities
    N3 = "N3"  # Tertiary/Output entities


@dataclass
class Entity:
    """
    Represents a workflow entity with hierarchical level.

    Attributes:
        name: Entity identifier (e.g., "UserRequest", "SearchQuery")
        level: Hierarchical level (N1, N2, or N3)
        metadata: Additional entity properties
    """
    name: str
    level: EntityLevel
    metadata: Dict[str, any] = field(default_factory=dict)

    def __str__(self) -> str:
        return f"{self.level.value}:{self.name}"

    def __hash__(self) -> int:
        return hash((self.name, self.level))


@dataclass
class Relation:
    """
    Represents a directed relationship between entities.

    Format: source $H→ target  (high-priority forward relation)
           source $L← target  (low-priority backward relation)
    """
    source: Entity
    target: Entity
    relation_type: RelationType
    direction: str = "→"  # → or ←

    def __str__(self) -> str:
        return f"{self.source} {self.relation_type.value}{self.direction} {self.target}"


class EntityRelationMap:
    """
    Manages entity relationships and dependencies.
    Supports LLM-readable notation for workflow automation.
    """

    def __init__(self):
        self.entities: Dict[str, Entity] = {}
        self.relations: List[Relation] = []
        self._adjacency: Dict[Entity, List[Entity]] = {}

    def add_entity(self, name: str, level: EntityLevel, metadata: Optional[Dict] = None) -> Entity:
        """Register a new entity in the map."""
        entity = Entity(name=name, level=level, metadata=metadata or {})
        self.entities[f"{level.value}:{name}"] = entity
        self._adjacency[entity] = []
        return entity

    def add_relation(
        self,
        source: Entity,
        target: Entity,
        relation_type: RelationType,
        direction: str = "→"
    ) -> Relation:
        """Create a directed relationship between entities."""
        relation = Relation(
            source=source,
            target=target,
            relation_type=relation_type,
            direction=direction
        )
        self.relations.append(relation)
        self._adjacency[source].append(target)
        return relation

    def get_dependencies(self, entity: Entity) -> List[Entity]:
        """Get all entities that this entity depends on."""
        return self._adjacency.get(entity, [])

    def get_high_priority_dependencies(self, entity: Entity) -> List[Entity]:
        """Get only high-priority ($H) dependencies."""
        deps = []
        for relation in self.relations:
            if relation.source == entity and relation.relation_type == RelationType.HIGH:
                deps.append(relation.target)
        return deps

    def to_notation(self) -> str:
        """
        Export to LLM-readable notation.

        Returns:
            Multi-line string with entity relationships:
            N1:UserRequest $H→ N2:SearchQuery $H→ N3:SerpResults
            N2:SearchQuery $L← N3:CompetitorAnalysis
        """
        lines = []
        for relation in self.relations:
            lines.append(str(relation))
        return "\n".join(lines)

    def visualize_ascii(self) -> str:
        """Generate ASCII visualization of the entity map."""
        output = ["Entity Relation Map", "=" * 50, ""]

        # Group by level
        n1_entities = [e for e in self.entities.values() if e.level == EntityLevel.N1]
        n2_entities = [e for e in self.entities.values() if e.level == EntityLevel.N2]
        n3_entities = [e for e in self.entities.values() if e.level == EntityLevel.N3]

        output.append("N1 (Primary):")
        for e in n1_entities:
            output.append(f"  • {e.name}")

        output.append("\nN2 (Processing):")
        for e in n2_entities:
            output.append(f"  • {e.name}")

        output.append("\nN3 (Output):")
        for e in n3_entities:
            output.append(f"  • {e.name}")

        output.append("\n" + "=" * 50)
        output.append("Relationships:")
        output.append(self.to_notation())

        return "\n".join(output)

    def get_execution_order(self) -> List[Entity]:
        """
        Topological sort to determine execution order.
        Returns entities in dependency-resolved order.
        """
        # Kahn's algorithm for topological sorting
        in_degree = {entity: 0 for entity in self.entities.values()}

        for relation in self.relations:
            in_degree[relation.target] += 1

        queue = [entity for entity, degree in in_degree.items() if degree == 0]
        execution_order = []

        while queue:
            current = queue.pop(0)
            execution_order.append(current)

            for neighbor in self._adjacency.get(current, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        return execution_order


# Example usage for SEO Blog Generator
def create_seo_blog_entity_map() -> EntityRelationMap:
    """
    Create entity relation map for SEO blog content generation workflow.

    Workflow:
      N1:Keyword $H→ N2:SerpQuery $H→ N3:TopResults
      N2:SerpQuery $H→ N2:WebScraper $H→ N3:CompetitorContent
      N3:CompetitorContent $H→ N2:IntentAnalyzer $H→ N3:UserIntent
      N3:UserIntent $H→ N2:TitleGenerator $H→ N3:ArticleTitle
      N3:ArticleTitle $H→ N2:StructureGenerator $H→ N3:Headings
      N3:Headings $H→ N2:ContentGenerator $H→ N3:ArticleContent (PARALLEL)
    """
    erm = EntityRelationMap()

    # N1: Input
    keyword = erm.add_entity("Keyword", EntityLevel.N1, {"type": "user_input"})

    # N2: Processing agents
    serp_query = erm.add_entity("SerpQuery", EntityLevel.N2, {"agent": "serp"})
    web_scraper = erm.add_entity("WebScraper", EntityLevel.N2, {"agent": "scraper"})
    intent_analyzer = erm.add_entity("IntentAnalyzer", EntityLevel.N2, {"agent": "gpt4"})
    title_generator = erm.add_entity("TitleGenerator", EntityLevel.N2, {"agent": "gpt4"})
    structure_generator = erm.add_entity("StructureGenerator", EntityLevel.N2, {"agent": "gpt4"})
    content_generator = erm.add_entity("ContentGenerator", EntityLevel.N2, {"agent": "gpt4", "parallel": True})

    # N3: Outputs
    top_results = erm.add_entity("TopResults", EntityLevel.N3, {"type": "urls"})
    competitor_content = erm.add_entity("CompetitorContent", EntityLevel.N3, {"type": "text"})
    user_intent = erm.add_entity("UserIntent", EntityLevel.N3, {"type": "analysis"})
    article_title = erm.add_entity("ArticleTitle", EntityLevel.N3, {"type": "text"})
    headings = erm.add_entity("Headings", EntityLevel.N3, {"type": "structure"})
    article_content = erm.add_entity("ArticleContent", EntityLevel.N3, {"type": "text"})

    # Define high-priority relationships (workflow dependencies)
    erm.add_relation(keyword, serp_query, RelationType.HIGH)
    erm.add_relation(serp_query, top_results, RelationType.HIGH)
    erm.add_relation(top_results, web_scraper, RelationType.HIGH)
    erm.add_relation(web_scraper, competitor_content, RelationType.HIGH)
    erm.add_relation(competitor_content, intent_analyzer, RelationType.HIGH)
    erm.add_relation(intent_analyzer, user_intent, RelationType.HIGH)
    erm.add_relation(user_intent, title_generator, RelationType.HIGH)
    erm.add_relation(title_generator, article_title, RelationType.HIGH)
    erm.add_relation(article_title, structure_generator, RelationType.HIGH)
    erm.add_relation(structure_generator, headings, RelationType.HIGH)
    erm.add_relation(headings, content_generator, RelationType.HIGH)
    erm.add_relation(content_generator, article_content, RelationType.HIGH)

    return erm


if __name__ == "__main__":
    # Demo
    erm = create_seo_blog_entity_map()
    print(erm.visualize_ascii())
    print("\n" + "=" * 50)
    print("Execution Order:")
    for i, entity in enumerate(erm.get_execution_order(), 1):
        print(f"  {i}. {entity}")

import fs from 'fs/promises';
import { GraphNode, GraphEdge, KnowledgeGraphState } from '../types/graph.js';

export class GraphManager {
  private state: KnowledgeGraphState = { nodes: new Map(), edges: [] };
  private storagePath: string;

  constructor(storagePath = './.polyclaw-graph.json') {
    this.storagePath = storagePath;
  }

  async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.storagePath, 'utf-8');
      const data = JSON.parse(raw);
      this.state.nodes = new Map(Object.entries(data.nodes || {}));
      this.state.edges = data.edges || [];
    } catch {
      // Graceful initialization if file doesn't exist yet
      this.state = { nodes: new Map(), edges: [] };
    }
  }

  async save(): Promise<void> {
    const serialized = {
      nodes: Object.fromEntries(this.state.nodes),
      edges: this.state.edges,
    };
    await fs.writeFile(this.storagePath, JSON.stringify(serialized, null, 2), 'utf-8');
  }

  addNode(node: GraphNode): void {
    this.state.nodes.set(node.id, node);
  }

  addEdge(edge: GraphEdge): void {
    // Prevent duplicate exact relationships
    const exists = this.state.edges.some(
      e => e.source === edge.source && e.target === edge.target && e.type === edge.type
    );
    if (!exists) this.state.edges.push(edge);
  }

  // Get a localized subgraph neighborhood up to N degrees of separation
  getNeighborhood(nodeId: string, depth = 1): string {
    const visited = new Set<string>();
    const activeNodes: GraphNode[] = [];
    const activeEdges: GraphEdge[] = [];

    const traverse = (currentId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(currentId)) return;
      visited.add(currentId);

      const node = this.state.nodes.get(currentId);
      if (node) activeNodes.push(node);

      const connectedEdges = this.state.edges.filter(
        e => e.source === currentId || e.target === currentId
      );

      for (const edge of connectedEdges) {
        activeEdges.push(edge);
        const nextId = edge.source === currentId ? edge.target : edge.source;
        traverse(nextId, currentDepth + 1);
      }
    };

    traverse(nodeId, 0);

    return JSON.stringify({ nodes: activeNodes, edges: activeEdges }, null, 2);
  }
}

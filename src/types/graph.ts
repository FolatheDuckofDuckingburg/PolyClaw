export interface GraphNode {
  id: string;       // Unique identifier (e.g., file path, function name, or concept)
  type: string;     // 'file' | 'type' | 'theory' | 'dependency' | 'concept'
  properties: Record<string, any>;
}

export interface GraphEdge {
  source: string;   // Source Node ID
  target: string;   // Target Node ID
  type: string;     // 'imports' | 'extends' | 'gathers' | 'governs' | 'maps_to'
  weight?: number;
}

export interface KnowledgeGraphState {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

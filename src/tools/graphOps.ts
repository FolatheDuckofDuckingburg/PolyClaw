import { tool } from 'ai';
import { z } from 'zod';
import { GraphManager } from '../core/GraphManager.js';

const graphManager = new GraphManager();

export const initializeGraph = async () => {
  await graphManager.load();
};

export const updateKnowledgeGraph = tool({
  description: 'Add or update a contextual entity node inside the project knowledge graph maps',
  parameters: z.object({
    id: z.string().describe('The primary identifier key of the node'),
    type: z.string().describe('The architectural category (e.g., file, function, module, concept)'),
    properties: z.record(z.any()).describe('Key-value attribute metadata properties'),
    relations: z.array(z.object({
      target: z.string().describe('The connected target entity ID'),
      type: z.string().describe('The link description (e.g., imports, extends, calls)'),
    })).optional(),
  }),
  execute: async ({ id, type, properties, relations }) => {
    try {
      graphManager.addNode({ id, type, properties });
      
      if (relations) {
        for (const rel of relations) {
          graphManager.addEdge({ source: id, target: rel.target, type: rel.type });
        }
      }
      await graphManager.save();
      return { success: true, message: `Node "${id}" updated successfully inside graph.` };
    } catch (err: any) {
      return { error: `Graph mapping exception: ${err.message}` };
    }
  },
});

export const queryKnowledgeGraph = tool({
  description: 'Retrieve a localized sub-graph node neighborhood network to explore contextual relationships',
  parameters: z.object({
    nodeId: z.string().describe('The entity target node identifier key to scan from'),
    depth: z.number().default(1).describe('The max separation degrees lookup boundary'),
  }),
  execute: async ({ nodeId, depth }) => {
    try {
      const subgraph = graphManager.getNeighborhood(nodeId, depth);
      return { success: true, contextPayload: subgraph };
    } catch (err: any) {
      return { error: `Graph query failure: ${err.message}` };
    }
  },
});

import { GoogleGenAI, Type } from '@google/genai';
import { getStore } from '@/server/store';
import { EntityBase } from '@prometheus/ontology';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ExtractedEntities {
  equipmentTags: string[];
  vendors: string[];
  otherKeywords: string[];
}

export interface GraphFact {
  sourceNode: { id: string; type: string; name: string; tag: string };
  edgeVerb: string;
  targetNode: { id: string; type: string; name: string; tag: string };
}

/**
 * Layer 1 helper: Uses Gemini to extract specific entity tags and keywords from the raw query.
 */
export async function extractEntities(query: string): Promise<ExtractedEntities> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Extract technical entities from this query: "${query}"` }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            equipmentTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Equipment tags like 'TX-01', 'SWG-01'." },
            vendors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Vendor names like 'Siemens', 'ABB'." },
            otherKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Other important technical keywords." }
          },
          required: ["equipmentTags", "vendors", "otherKeywords"]
        }
      }
    });
    const text = response.text || '{"equipmentTags":[],"vendors":[],"otherKeywords":[]}';
    return JSON.parse(text) as ExtractedEntities;
  } catch (e) {
    console.error('Entity extraction failed:', e);
    return { equipmentTags: [], vendors: [], otherKeywords: [] };
  }
}

/**
 * Layer 1 helper: Maps extracted entities to the TypedGraph and retrieves 1-2 hop structural facts.
 */
export function getNeighborhood(entities: ExtractedEntities): GraphFact[] {
  const store = getStore();
  const graph = store.graph;
  const allNodes = graph.allNodes();
  
  // 1. Map string entities to actual Graph Nodes
  const matchedNodes: EntityBase[] = [];
  const searchTerms = [
    ...entities.equipmentTags, 
    ...entities.vendors, 
    ...entities.otherKeywords
  ].map(s => s.toLowerCase());

  if (searchTerms.length === 0) return [];

  for (const node of allNodes) {
    const match = searchTerms.some(t => 
      (node.tag && node.tag.toLowerCase().includes(t)) || 
      (node.name && node.name.toLowerCase().includes(t))
    );
    if (match) matchedNodes.push(node);
  }

  // 2. Traverse 1 hop outward from each matched node to gather structural facts
  const facts: GraphFact[] = [];
  const seenEdges = new Set<string>();

  for (const node of matchedNodes) {
    const edges = [...graph.out(node.id), ...graph.in(node.id)];
    
    for (const e of edges) {
      if (seenEdges.has(e.id)) continue;
      seenEdges.add(e.id);
      
      const source = graph.requireNode(e.from);
      const target = graph.requireNode(e.to);
      
      facts.push({
        sourceNode: { id: source.id, type: source.type, name: source.name, tag: source.tag },
        edgeVerb: e.verb,
        targetNode: { id: target.id, type: target.type, name: target.name, tag: target.tag }
      });
    }
  }
  
  return facts;
}

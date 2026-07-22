import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { extractEntities, getNeighborhood } from '@/core/utils/graph-retrieval';
import { globalVectorStore } from '@/core/utils/vector';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    // 1. Layer 1: Extract Entities and Graph Neighborhood
    const entities = await extractEntities(query);
    const graphFactsRaw = getNeighborhood(entities);
    
    // Format graph facts for output
    const graphFacts = graphFactsRaw.map(f => ({
      node: f.sourceNode.tag || f.sourceNode.name,
      edge: f.edgeVerb,
      target: f.targetNode.tag || f.targetNode.name,
      sourceDoc: 'Knowledge Graph Layer 1'
    }));

    // 2. Layer 2: Vector Semantic Search
    const textChunks = await globalVectorStore.search(query, 5);

    // 3. Merge Context
    if (graphFacts.length === 0 && textChunks.length === 0) {
      return NextResponse.json({
        answer: "No uploaded documents available for retrieval.",
        reasoningTrace: "RAG index returned 0 matching graph nodes and 0 vector chunks for this query.",
        graphFacts: [],
        textChunks: []
      });
    }

    let contextStr = ``;
    if (graphFacts.length > 0) {
      contextStr += `--- LAYER 1: STRUCTURAL GRAPH FACTS ---\n`;
      graphFacts.forEach(f => {
        contextStr += `[Graph]: ${f.node} --(${f.edge})--> ${f.target}\n`;
      });
      contextStr += `\n`;
    }

    if (textChunks.length > 0) {
      contextStr += `--- LAYER 2: UNSTRUCTURED DOCUMENT CHUNKS ---\n`;
      textChunks.forEach((c, idx) => {
        contextStr += `[Doc: ${c.sourceDoc} (Score: ${(c.similarityScore || 0).toFixed(2)})]:\n${c.text}\n\n`;
      });
    }

    const systemPrompt = `
You are the Prometheus RAG Engine. You must answer the user's query using ONLY the context provided below.
The context contains two layers:
- Layer 1: Structural Graph Facts representing relationships between entities (equipment, vendors, risks).
- Layer 2: Unstructured Document Chunks representing actual parsed text from project files.

Combine insights from both layers to answer the query accurately. 
Use inline citation badges (e.g. [Graph: TX-01] or [Doc: Specifications.pdf]) in your answer.

CONTEXT:
${contextStr}
`;

    // 4. Gemini Generation
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ role: 'user', parts: [{ text: systemPrompt }, { text: `Query: ${query}` }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING, description: "The final synthesized answer with inline citations." },
            reasoningTrace: { type: Type.STRING, description: "A brief trace explaining how Layer 1 and Layer 2 facts were combined." }
          },
          required: ["answer", "reasoningTrace"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || '{"answer":"Failed to generate answer", "reasoningTrace": ""}');

    // 5. Return Structured JSON for UI Graph Viewer
    return NextResponse.json({
      answer: parsedResponse.answer,
      graphFacts,
      textChunks,
      reasoningTrace: parsedResponse.reasoningTrace
    });

  } catch (error: any) {
    console.error("Hybrid RAG Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface Chunk {
  id: string;
  text: string;
  sourceDoc: string;
  sourcePage?: string;
  embedding: number[];
  similarityScore?: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class VectorStore {
  private chunks: Chunk[] = [];

  /**
   * Embeds text using Gemini's text-embedding-004 model.
   */
  async embed(text: string): Promise<number[]> {
    try {
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      return response.embeddings?.[0]?.values ?? [];
    } catch (e) {
      console.error('Embedding failed:', e);
      return [];
    }
  }

  /**
   * Upsert a chunk (with text and pre-computed embedding) into the store.
   */
  upsert(chunk: Omit<Chunk, 'similarityScore'>) {
    // If chunk id exists, replace it
    const idx = this.chunks.findIndex(c => c.id === chunk.id);
    if (idx >= 0) {
      this.chunks[idx] = chunk;
    } else {
      this.chunks.push(chunk);
    }
  }

  /**
   * Search the vector store using a query string.
   */
  async search(query: string, k: number = 3): Promise<Chunk[]> {
    const queryEmbedding = await this.embed(query);
    if (!queryEmbedding.length) return [];

    const scoredChunks = this.chunks.map(chunk => ({
      ...chunk,
      similarityScore: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Sort by descending similarity and return top k
    scoredChunks.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
    return scoredChunks.slice(0, k);
  }
}

// Singleton instance for the hackathon
export const globalVectorStore = new VectorStore();

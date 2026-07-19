/**
 * Semantic tool surface over the Knowledge Fabric.
 *
 * Agents and the API gateway call these typed, hard-coded traversals —
 * never free-form queries (AI Decision Record AI-002).
 */

import type { Citation, SourceDocument } from '@prometheus/ontology';
import { SEED_DOCUMENTS } from './seed-documents';

const docIndex = new Map<string, SourceDocument>(SEED_DOCUMENTS.map((d) => [d.id, d]));

export function getDocument(docId: string): SourceDocument | undefined {
  return docIndex.get(docId);
}

/** Build a structural citation from a stable block anchor. Throws if the anchor is invalid —
 *  an unsourced claim is rejected, not shipped (Citation Pass, 08_IMPLEMENTATION §5). */
export function cite(docId: string, blockId: string): Citation {
  const doc = docIndex.get(docId);
  if (!doc) throw new Error(`Citation rejected: unknown document ${docId}`);
  for (const page of doc.pages) {
    const block = page.blocks.find((b) => b.id === blockId);
    if (block) {
      return {
        docId,
        docTitle: doc.title.split(' — ')[0] ?? doc.title,
        page: page.page,
        clause: block.clause,
        blockId,
        quote: block.text,
      };
    }
  }
  throw new Error(`Citation rejected: block ${blockId} not found in ${docId}`);
}

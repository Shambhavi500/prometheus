/**
 * @prometheus/ontology — Source document & evidence model.
 *
 * Evidence-First: every analytical claim carries a deterministic pointer
 * (docId + blockId + page + clause) into an unmodified source artifact
 * (10_KNOWLEDGE_GRAPH §8). Heavy binaries stay in object storage; the graph
 * holds structured blocks with stable ids.
 */

export type SourceDocumentType =
  | 'Specification'
  | 'Submittal'
  | 'VendorQuote'
  | 'ScheduleExtract'
  | 'Standard';

export interface DocumentBlock {
  /** Stable block id — the citation anchor. */
  id: string;
  kind: 'heading' | 'clause' | 'para' | 'table';
  /** Clause designation when present (e.g. "4.1.2"). */
  clause?: string;
  text: string;
}

export interface DocumentPage {
  page: number;
  blocks: DocumentBlock[];
}

export interface SourceDocument {
  id: string;
  title: string;
  docType: SourceDocumentType;
  revision: string;
  /** DD-MMM-YYYY issue date, exactly as printed on the artifact. */
  issued: string;
  sourceSystem: string;
  pages: DocumentPage[];
}

/** Structural citation attached to every systemic claim (03_DESIGN, 07_COPYWRITING §3). */
export interface Citation {
  docId: string;
  docTitle: string;
  page: number;
  clause?: string;
  blockId: string;
  /** Exact extracted text — rendered in the QuickPeek tooltip. */
  quote: string;
}

import { NextResponse } from 'next/server';
import { extractDocumentSpecifications } from '@/core/utils/ai';
import { getStore, makeIds, ingestDynamicSpec, ingestDynamicFinding } from '@/server/store';
import { evaluateDynamicExtraction } from '@/server/reasoning/spec-compliance';
import { evaluateDynamicScheduleRisk } from '@/server/reasoning/schedule-risk';
import { evaluateDynamicSupplyRisk } from '@/server/reasoning/supply-chain';
import { evaluateDynamicCommissioningRisk } from '@/server/reasoning/commissioning';

export async function POST(request: Request) {
  try {
    const { base64, fileName, mimeType } = await request.json();

    if (!base64) {
      return NextResponse.json({ error: "Missing base64 file data" }, { status: 400 });
    }

    // 1. Call Gemini LLM to extract data directly from the document
    const extractedData = await extractDocumentSpecifications(base64, mimeType || 'application/pdf', fileName);

    if (!extractedData || (!extractedData.specs?.length && !extractedData.schedules?.length && !extractedData.supply?.length && !extractedData.tests?.length)) {
      return NextResponse.json({
        success: true,
        fileName,
        message: "No technical specifications or updates found in the document.",
        extractions: []
      });
    }

    const store = getStore();
    const ids = makeIds();
    
    // Create a submittal tag based on the filename (e.g. "TX-01_Submittal.pdf" -> "SUB-TX-01")
    const docPrefix = fileName.split('.')[0].toUpperCase();
    const submittalTag = `SUB-${docPrefix.substring(0, 8)}`;
    const docId = `DOC-${docPrefix.substring(0, 8)}`;

    if (!store.graph.getNode(docId)) {
      store.graph.addNode({
        id: docId,
        type: 'Document',
        tag: docId,
        name: fileName,
        status: 'Active',
        owner: store.user.personId,
        verification: 'SystemVerified',
        tenantId: store.user.tenantId,
        projectId: 'PRJ-AQUILA',
        props: {}
      });
    }

    const results = [];

    // 2. Pass extraction through Spec Compliance logic
    if (extractedData.specs) {
      for (const spec of extractedData.specs) {
        const evaluation = evaluateDynamicExtraction(spec, submittalTag, docId, store.graph, ids);
        if (evaluation) {
          ingestDynamicSpec(evaluation.row, evaluation.finding, evaluation.decision);
          results.push(evaluation);
        }
      }
    }

    // 3. Pass extraction through Schedule Risk Agent
    if (extractedData.schedules) {
      for (const sched of extractedData.schedules) {
        const evaluation = evaluateDynamicScheduleRisk(sched, docId, store.graph, ids);
        if (evaluation) {
          ingestDynamicFinding(evaluation.finding, evaluation.decision);
          results.push(evaluation);
        }
      }
    }

    // 4. Pass extraction through Supply Chain Agent
    if (extractedData.supply) {
      for (const sup of extractedData.supply) {
        const evaluation = evaluateDynamicSupplyRisk(sup, docId, store.graph, ids);
        if (evaluation) {
          ingestDynamicFinding(evaluation.finding, evaluation.decision);
          results.push(evaluation);
        }
      }
    }

    // 5. Pass extraction through Commissioning Copilot
    if (extractedData.tests) {
      for (const test of extractedData.tests) {
        const evaluation = evaluateDynamicCommissioningRisk(test, docId, store.graph, ids);
        if (evaluation) {
          ingestDynamicFinding(evaluation.finding, evaluation.decision);
          results.push(evaluation);
        }
      }
    }

    // 6. [APPENDED] Layer 2 Vector Store Extraction
    // Extract raw text for semantic search
    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({});
      const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const textRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: cleanBase64, mimeType: mimeType || 'application/pdf' } },
              { text: 'Transcribe the exact text of this document. Preserve paragraph breaks using double newlines.' }
            ]
          }
        ]
      });
      const rawText = textRes.text || '';
      const paragraphs = rawText.split('\n\n').map(p => p.trim()).filter(p => p.length > 20);
      
      const { globalVectorStore } = await import('@/core/utils/vector');
      let chunkCount = 0;
      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const embedding = await globalVectorStore.embed(p);
        if (embedding.length > 0) {
          globalVectorStore.upsert({
            id: `${docId}-chunk-${i}`,
            text: p,
            sourceDoc: fileName,
            embedding
          });
          chunkCount++;
        }
      }
      console.log(`Embedded ${chunkCount} chunks into VectorStore for Layer 2 RAG.`);
    } catch (vectorError) {
      console.error('Vector store ingestion failed:', vectorError);
    }

    return NextResponse.json({
      success: true,
      fileName,
      extractions: extractedData.specs || [],
      evaluations: results.length
    });
  } catch (error: any) {
    console.error("Ingest API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

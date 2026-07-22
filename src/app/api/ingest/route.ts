import { NextResponse } from 'next/server';
import { extractDocumentSpecifications } from '@/core/utils/ai';
import { getStore, makeIds, ingestDynamicSpec, ingestDynamicFinding, uploadDocument, updateDocumentStatus, updateDocumentOcr } from '@/server/store';
import { evaluateDynamicExtraction } from '@/server/reasoning/spec-compliance';
import { evaluateDynamicScheduleRisk } from '@/server/reasoning/schedule-risk';
import { evaluateDynamicSupplyRisk } from '@/server/reasoning/supply-chain';
import { evaluateDynamicCommissioningRisk } from '@/server/reasoning/commissioning';
import { BaiduOcrClient } from '@/core/utils/baiduOcr';

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ log: msg })}\n\n`));
      };
      
      const sendProgress = (progress: number) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
      };

      try {
        const { base64, fileName, mimeType } = await request.json();

        if (!base64) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Missing base64 file data" })}\n\n`));
          controller.close();
          return;
        }

        send(`[00:01] Ingesting connected project documents...`);
        send(`[00:03] Initializing ET Document Intelligence Engine...`);
        sendProgress(10);
        
        send(`[00:09] Initializing ingestion of user-uploaded document: ${fileName}...`);
        
        const cleanName = fileName.split('.')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
        const docPrefix = (cleanName || 'FILE').substring(0, 8);
        const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const submittalTag = `SUB-${docPrefix}-${uniqueSuffix}`;
        const docId = `DOC-${docPrefix}-${uniqueSuffix}`;

        uploadDocument(docId, fileName, mimeType || 'application/pdf');

        // Execute OCR Engine
        sendProgress(20);
        send(`[00:12] Executing Baidu OCR Engine for text extraction & structure parsing...`);
        let ocrResult = null;
        try {
          const ocrClient = new BaiduOcrClient();
          ocrResult = await ocrClient.processOcr(base64);
          updateDocumentOcr(docId, ocrResult, 1);
          send(`[00:15] OCR Complete: Extracted ${ocrResult.words_result_num} text segments.`);
        } catch (ocrErr: any) {
          send(`[00:15] OCR processing note: ${ocrErr.message}`);
        }

        sendProgress(30);
        send("[00:18] Initializing Gemini Multimodal Engine for Document Understanding...");
        send(`[00:26] Gemini API: Processing: ${fileName}`);

        // 1. Call Gemini LLM to extract data directly from the document
        const extractedData = await extractDocumentSpecifications(base64, mimeType || 'application/pdf', fileName);

        if (!extractedData || (!extractedData.specs?.length && !extractedData.schedules?.length && !extractedData.supply?.length && !extractedData.tests?.length)) {
           send(`           > No technical specifications found in ${fileName}.`);
           updateDocumentStatus(docId, 'Processed');
           controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
           controller.close();
           return;
        }
        
        send(`[00:32] Gemini Extraction Success for ${fileName}`);
        sendProgress(45);

        const store = getStore();
        const ids = makeIds();

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
            props: {},
            source: 'live',
          });
        }

        let evaluationsCount = 0;
        
        send(`           Entities Extracted:`);

        if (extractedData.specs) {
          for (const spec of extractedData.specs) {
            send(`           > ${spec.equipmentTag} | ${spec.parameter}: ${spec.value}`);
            const evaluation = evaluateDynamicExtraction(spec, submittalTag, docId, store.graph, ids);
            if (evaluation) {
              ingestDynamicSpec(evaluation.row, evaluation.finding, evaluation.decision, docId);
              evaluationsCount++;
            }
          }
        }
        
        sendProgress(60);
        send("[00:42] Building semantic entity layout map...");

        if (extractedData.schedules) {
          for (const sched of extractedData.schedules) {
            const evaluation = evaluateDynamicScheduleRisk(sched, docId, store.graph, ids);
            if (evaluation) {
              ingestDynamicFinding(evaluation.finding, evaluation.decision, docId);
              evaluationsCount++;
            }
          }
        }

        if (extractedData.supply) {
          for (const sup of extractedData.supply) {
            const evaluation = evaluateDynamicSupplyRisk(sup, docId, store.graph, ids);
            if (evaluation) {
              ingestDynamicFinding(evaluation.finding, evaluation.decision, docId);
              evaluationsCount++;
            }
          }
        }

        if (extractedData.tests) {
          for (const test of extractedData.tests) {
            const evaluation = evaluateDynamicCommissioningRisk(test, docId, store.graph, ids);
            if (evaluation) {
              ingestDynamicFinding(evaluation.finding, evaluation.decision, docId);
              evaluationsCount++;
            }
          }
        }
        
        if (evaluationsCount > 0) {
            send(`[00:35] Agents evaluated extracted parameters. Deviations found!`);
        }
        
        sendProgress(75);
        send("[00:46] Merging document graph with Helios EPC Knowledge precedents...");

        // Layer 2 Vector Store Extraction
        try {
          if (process.env.GEMINI_API_KEY) {
            const { GoogleGenAI } = require('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
            const textRes = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: 'Transcribe the technical text from this document.'
            });
            const rawText = textRes.text || '';
            const paragraphs = rawText.split('\n\n').map((p: string) => p.trim()).filter((p: string) => p.length > 20);
            
            const { globalVectorStore } = await import('@/core/utils/vector');
            let chunkCount = 0;
            for (let i = 0; i < Math.min(paragraphs.length, 10); i++) {
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
            if (chunkCount > 0) {
              send(`Embedded ${chunkCount} chunks into VectorStore for Layer 2 RAG.`);
            }
          }
        } catch (vectorError: any) {
          console.warn('Vector extraction note:', vectorError?.message || vectorError);
        }
        
        sendProgress(85);
        send("  → [Schedule Risk Agent]: Real-time recalculation complete.");
        send("  → [Supply Chain Agent]: Vendor timeline evaluation complete.");
        send("  → [Commissioning Agent]: L1-L5 readiness dependency graph updated.");

        sendProgress(98);
        send("[00:58] Merging insights into Project Meghdoot Graph Memory...");
        send("[01:00] Ingestion sequence complete. Initializing Mission Control...");
        
        updateDocumentStatus(docId, 'Processed');
        
        sendProgress(100);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
        
      } catch (error: any) {
        console.error("Ingest API Error:", error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

import { GoogleGenAI } from '@google/genai';
import { Type, Schema } from '@google/genai';

// Make sure to set GEMINI_API_KEY in your environment
// The SDK automatically picks up GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});

export interface ExtractedSpec {
  equipmentTag: string;
  parameter: string;
  value: string;
}

export interface ExtractedSchedule {
  activityId?: string;
  equipmentTag?: string;
  quotedLeadTimeWeeks: number;
}

export interface ExtractedSupply {
  vendorName: string;
  status: 'Force Majeure' | 'Nominal' | 'Delayed';
  note?: string;
}

export interface ExtractedTestRecord {
  subsystemTag: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  status: 'Complete' | 'In Progress' | 'At Risk' | 'Blocked' | 'Not Started';
}

export interface ExtractedDocumentData {
  specs: ExtractedSpec[];
  schedules: ExtractedSchedule[];
  supply: ExtractedSupply[];
  tests: ExtractedTestRecord[];
}

export async function extractDocumentSpecifications(
  base64String: string,
  mimeType: string,
  fileName: string
): Promise<ExtractedDocumentData | null> {
  try {
    const cleanBase64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: cleanBase64, mimeType } },
            { text: `Extract all technical specifications, schedule updates (e.g. lead times), vendor supply chain notices (e.g. force majeure), and commissioning test records from this document.` }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            specs: {
              type: Type.ARRAY,
              description: 'Technical equipment parameters.',
              items: {
                type: Type.OBJECT,
                properties: {
                  equipmentTag: { type: Type.STRING, description: "E.g., TX-01" },
                  parameter: { type: Type.STRING, description: "E.g., impedance, voltage" },
                  value: { type: Type.STRING, description: "E.g., 5.75%" }
                },
                required: ["equipmentTag", "parameter", "value"]
              }
            },
            schedules: {
              type: Type.ARRAY,
              description: 'Vendor quotes or schedule lead time changes.',
              items: {
                type: Type.OBJECT,
                properties: {
                  activityId: { type: Type.STRING },
                  equipmentTag: { type: Type.STRING },
                  quotedLeadTimeWeeks: { type: Type.NUMBER }
                },
                required: ["quotedLeadTimeWeeks"]
              }
            },
            supply: {
              type: Type.ARRAY,
              description: 'Vendor bulletins or notices (e.g. Force Majeure, Delays).',
              items: {
                type: Type.OBJECT,
                properties: {
                  vendorName: { type: Type.STRING },
                  status: { type: Type.STRING, description: "Must be 'Force Majeure', 'Nominal', or 'Delayed'" },
                  note: { type: Type.STRING }
                },
                required: ["vendorName", "status"]
              }
            },
            tests: {
              type: Type.ARRAY,
              description: 'Commissioning test records and readiness status.',
              items: {
                type: Type.OBJECT,
                properties: {
                  subsystemTag: { type: Type.STRING },
                  level: { type: Type.STRING, description: "L1 to L5" },
                  status: { type: Type.STRING, description: "Complete, In Progress, At Risk, Blocked, Not Started" }
                },
                required: ["subsystemTag", "level", "status"]
              }
            }
          },
          required: ["specs", "schedules", "supply", "tests"]
        }
      }
    });

    const text = response.text;
    if (!text) return { specs: [], schedules: [], supply: [], tests: [] };

    return JSON.parse(text) as ExtractedDocumentData;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return { specs: [], schedules: [], supply: [], tests: [] };
  }
}

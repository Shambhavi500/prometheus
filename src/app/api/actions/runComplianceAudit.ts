"use server";

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ComplianceAuditResult } from "@/ontology/engineering";

// We define a strict schema for Gemini to ensure it returns exactly the structure we need
const complianceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ["APPROVED", "REJECTED", "WARNINGS"],
      description: "Overall status of the compliance audit",
    },
    complianceScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing how compliant the submittal is",
    },
    summary: {
      type: Type.STRING,
      description: "A 1-2 sentence summary of the audit findings",
    },
    entitiesExtracted: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: {
            type: Type.STRING,
            enum: ["Equipment", "Manufacturer", "System", "Parameter"],
          },
          name: { type: Type.STRING },
          value: { type: Type.STRING },
          unit: { type: Type.STRING },
        },
        required: ["id", "type", "name"],
      },
    },
    deviations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          requirementId: { type: Type.STRING },
          submittedValue: { type: Type.STRING },
          reason: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          severity: {
            type: Type.STRING,
            enum: ["Low", "Medium", "High", "Critical"],
          },
          downstreamRisks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                affectedSystem: { type: Type.STRING },
                impactLevel: {
                  type: Type.STRING,
                  enum: ["Low", "Medium", "High", "Critical"],
                },
                description: { type: Type.STRING },
                estimatedDelayDays: { type: Type.NUMBER },
                estimatedCostImpact: { type: Type.NUMBER },
              },
              required: ["affectedSystem", "impactLevel", "description"],
            },
          },
          recommendation: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              priority: {
                type: Type.STRING,
                enum: ["Low", "Medium", "High", "Critical"],
              },
              alternativeVendor: { type: Type.STRING },
              draftRFI: { type: Type.STRING },
            },
            required: ["action", "priority"],
          },
        },
        required: ["requirementId", "submittedValue", "reason", "confidence", "severity", "downstreamRisks", "recommendation"],
      },
    },
  },
  required: ["status", "complianceScore", "summary", "entitiesExtracted", "deviations"],
};

export async function runComplianceAudit(submittalText: string): Promise<ComplianceAuditResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  // Initialize the Gemini client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // HARDCODED DEMO SPECIFICATIONS (The "Master Spec")
  // In a real app, this would be retrieved from a database/knowledge graph based on the project.
  const masterSpecifications = `
  MASTER SPECIFICATION CLAUSES:
  
  REQ-4.2.1: Cooling Systems
  - System: Mechanical Cooling
  - Component: Primary Chilled Water Pumps
  - Parameter: Redundancy
  - Expected: N+1 Configuration required for all primary chilled water loops to maintain Tier III concurrent maintainability.
  - Criticality: Critical

  REQ-4.2.2: Cooling Systems
  - System: Mechanical Cooling
  - Component: Primary Chilled Water Pumps
  - Parameter: Power Rating
  - Expected: Maximum allowable power per pump is 75 kW to align with emergency generator step-loads.
  - Criticality: High

  REQ-7.1.5: Vendor Qualifications
  - System: Procurement
  - Component: General
  - Parameter: Lead Time
  - Expected: Maximum acceptable lead time for mechanical equipment is 24 weeks.
  - Criticality: Medium
  `;

  const systemInstruction = `
  You are PROMETHEUS, an autonomous enterprise Spec-Compliance Agent for Data Center EPC Projects.
  Your job is to analyze a vendor submittal against a strict set of Engineering Master Specifications.
  
  You MUST return your response as a valid JSON object matching the provided schema.
  
  Instructions:
  1. Parse the submitted text and extract all relevant engineering entities (Equipment, Manufacturers, Parameters).
  2. Compare the extracted entities against the Master Specifications.
  3. Identify ANY deviations where the submittal fails to meet the expected parameters.
  4. If a deviation is found, you MUST map out the downstream risks (e.g., delays, certification failures).
  5. Provide a strict engineering recommendation to mitigate the risk, including drafting an RFI if necessary.
  
  ${masterSpecifications}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `VENDOR SUBMITTAL:\n\n${submittalText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: complianceSchema,
        temperature: 0.1, // Low temperature for highly deterministic, analytical output
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Received empty response from Intelligence Engine.");
    
    const result = JSON.parse(jsonText) as ComplianceAuditResult;
    return result;

  } catch (error) {
    console.error("Error in runComplianceAudit:", error);
    throw error;
  }
}

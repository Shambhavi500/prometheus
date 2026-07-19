export interface EngineeringEntity {
  id: string;
  type: "Equipment" | "Manufacturer" | "System" | "Parameter";
  name: string;
  value?: string;
  unit?: string;
}

export interface Requirement {
  id: string;
  system: string;
  component: string;
  parameter: string;
  expected: string;
  criticality: "Low" | "Medium" | "High" | "Critical";
  clauseReference: string;
}

export interface RiskPropagation {
  affectedSystem: string;
  impactLevel: "Low" | "Medium" | "High" | "Critical";
  description: string;
  estimatedDelayDays?: number;
  estimatedCostImpact?: number;
}

export interface Recommendation {
  action: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  alternativeVendor?: string;
  draftRFI?: string;
}

export interface Deviation {
  requirementId: string;
  submittedValue: string;
  reason: string;
  confidence: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  downstreamRisks: RiskPropagation[];
  recommendation: Recommendation;
}

export interface ComplianceAuditResult {
  status: "APPROVED" | "REJECTED" | "WARNINGS";
  complianceScore: number;
  entitiesExtracted: EngineeringEntity[];
  deviations: Deviation[];
  summary: string;
}

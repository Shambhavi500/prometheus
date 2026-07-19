> **CONFIDENTIAL — PROJECT AQUILA** · Prepared by Atlas EPC Solutions
# TECHNICAL SPECIFICATION — UNINTERRUPTIBLE POWER SUPPLY (UPS)

| Field | Value |
|---|---|
| **Document No.** | AQL-ATL-EL-SPC-0012 |
| **Revision** | C |
| **ISO 19650 Status** | A1 (approved for procurement) |
| **Discipline** | Electrical |
| **Related equipment** | UPS-01 … UPS-12, BAT-01 … BAT-12, STS-01 … STS-16 |
| **Related vendor / PO** | Meridian Critical Power (MCP) / AQL-ATL-PO-0012 |
| **Related calc** | AQL-ATL-EL-CAL-0007 |
| **Related DBR** | AQL-ATL-EL-DBR-0002 |
| **Related RFI** | AQL-ATL-EL-RFI-0052 |

## 1. Scope
Design, manufacture, factory test (L1 FAT), supply, and commissioning support for twelve (12)
modular static double-conversion UPS units (UPS-01…UPS-12), associated battery energy storage
(BAT-01…BAT-12) and static transfer switches (STS-01…STS-16), configured **2N** per data hall
block.

## 2. Performance Requirements
| Parameter | Requirement |
|---|---|
| Topology | Online double-conversion (VFI-SS-111 per IEC 62040-3) |
| Unit rating | 500 kW / 500 kVA (unity PF), scalable modular |
| Configuration | 2N per hall block (2 × UPS per 500 kW critical block) |
| Input voltage | 415 V ± 15%, 3-phase, 50 Hz |
| Output voltage | 415 V ± 1%, THDv < 2% (linear load) |
| Overall efficiency | ≥ 96.5% at 50–100% load (double-conversion) |
| Eco/dynamic mode efficiency | ≥ 99% (where design permits) |
| Autonomy | 10 minutes at full rated load |
| Overload | 125% for 10 min, 150% for 1 min |
| Parallel/redundancy | Hot-swappable modules; N+1 within frame |
| Short-circuit contribution | Coordinated with LV board 65 kA; **confirmed via RFI-0052** |
| Communication | SNMP/Modbus to EPMS-01 and BMS-01 |

## 3. Battery
| Parameter | Requirement |
|---|---|
| Type (base spec Rev A/B) | VRLA, 10-year design life |
| Type (Rev C, per VO-0011) | **Lithium-ion (LFP)**, 15-year design life — see Variation Order AQL-ATL-CO-VO-0011 |
| Autonomy | 10 min at full load, end-of-life margin included |
| Monitoring | Cell-level BMS, integrated to EPMS-01 |

> **Revision C note:** Battery technology changed from VRLA to Lithium-ion (LFP) per approved
> Variation Order **AQL-ATL-CO-VO-0011** (cost impact **AQL-ATL-CO-CIA-0011**). Material
> approval tracked under **AQL-ATL-PR-MAR-0044**.

## 4. Testing
Factory Acceptance Test (Cx **Level 1**) per ITP **AQL-ATL-QA-ITP-0009**, witnessed by Atlas
QA and Helios/CxA. Site Acceptance Test (Cx **Level 4**) per **AQL-NBC-CX-SAT-0012**.
FAT to include full-load burn-in, efficiency verification, transfer tests, and battery
autonomy discharge.

## 5. Documentation Deliverables (Vendor)
GA drawings, single-line, IEC 62040 type-test certificates, FAT procedure & report, O&M
manuals, spare parts list, training. Submitted via Vendor Data Sheet **AQL-MCP-EL-VDS-0012**.

## Revision History
| Rev | Date | Status | Description | Prepared | Reviewed | Approved |
|---|---|---|---|---|---|---|
| A | 02-May-24 | S3 | Issued for review (VRLA basis) | P. Deshmukh | Eng Mgr | — |
| B | 20-May-24 | S4 | Client comments incorporated | P. Deshmukh | Eng Mgr | — |
| C | 12-Jun-24 | A1 | Li-ion battery per VO-0011; RFI-0052 fault level added | P. Deshmukh | Eng Mgr | S. Krishnan |

**Engineering note:** Efficiency ≥ 96.5% is a hard contractual requirement; FAT-measured
efficiency shall be recorded in AQL-MCP-CX-FAT-0012 and any shortfall raised as an NCR.

> *Footer:* AQL-ATL-EL-SPC-0012 Rev C · Confidential

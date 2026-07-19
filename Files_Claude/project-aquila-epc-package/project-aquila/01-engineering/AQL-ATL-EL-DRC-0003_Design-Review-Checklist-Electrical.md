> **CONFIDENTIAL — PROJECT AQUILA** · Prepared by Atlas EPC Solutions
# DESIGN REVIEW CHECKLIST — ELECTRICAL (UPS package)

| Field | Value |
|---|---|
| **Document No.** | AQL-ATL-EL-DRC-0003 |
| **Revision** | 0 |
| **ISO 19650 Status** | A1 |
| **Related** | AQL-ATL-EL-DBR-0002 · AQL-ATL-EL-SPC-0012 · AQL-ATL-EL-CAL-0007 |

| # | Review item | Ref | Result | Reviewer note |
|---|---|---|---|---|
| 1 | 2N topology reflected in SLD | DWG-1020 | ✔ Pass | Dual systems A/B confirmed |
| 2 | UPS rating matches load calc | CAL-0007 | ✔ Pass | 500 kW modules, N+1/frame |
| 3 | Autonomy 10 min verified | CAL-0007 §4 | ✔ Pass | Li-ion sizing includes EoL |
| 4 | Fault level coordination | RFI-0052 | ✔ Pass | 65 kA confirmed; RFI closed |
| 5 | Battery type per VO-0011 | SPC-0012 Rev C | ✔ Pass | Li-ion LFP; MAR-0044 raised |
| 6 | Earthing/bonding detail | DWG-1030 | ⚠ Action | Clean earth detail → SI-0044 |
| 7 | EPMS/BMS integration points | SPC-0012 §2 | ✔ Pass | SNMP/Modbus to EPMS-01 |
| 8 | Concurrent maintainability | DBR-0002 §3 | ✔ Pass | Any A/B path isolatable |

**Outcome:** Design approved with one action (item 6) closed via Site Instruction AQL-ATL-EL-SI-0044.

## Revision History
| Rev | Date | Description |
|---|---|---|
| 0 | 18-May-24 | Design review complete |

> *Footer:* AQL-ATL-EL-DRC-0003 Rev 0 · Confidential

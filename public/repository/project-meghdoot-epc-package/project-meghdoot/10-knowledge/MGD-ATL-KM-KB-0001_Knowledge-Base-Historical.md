> **CONFIDENTIAL — Project Meghdoot** · Atlas EPC Solutions — Knowledge Management
# KNOWLEDGE BASE — HISTORICAL PROJECT INTELLIGENCE

| Field | Value |
|---|---|
| **Document No.** | MGD-ATL-KM-KB-0001 |
| **Revision** | 1 |
| **Purpose** | Cross-project history to inform Prometheus decisions and AI reasoning |

## 1. Historical NCRs (prior Atlas data-centre projects)
| Ref | Project | Issue | Resolution | Applicability to Prometheus |
|---|---|---|---|---|
| H-NCR-221 | Project Cygnus (Chennai) | UPS battery seismic anchoring non-conformance at FAT | Rework + vendor MoC fix | **Directly recurred as NCR-0037** — see LL-05 |
| H-NCR-198 | Project Draco (Pune) | Transformer oil-type mismatch vs spec | Replaced before dispatch | Cast-resin chosen for Prometheus (dry-type) |
| H-NCR-176 | Project Cygnus | EPMS point mapping errors at SAT | Extended integration test | Mirrors Prometheus P05/DEF-01 |

## 2. Historical RFIs
| Ref | Topic | Outcome | Prometheus link |
|---|---|---|---|
| H-RFI-410 | Clean-earth single vs multi-point bonding | Single-point per room adopted | Same as RFI-0052 disposition |
| H-RFI-455 | UPS bypass fault-level coordination | 65 kA basis confirmed | Same basis in DBR-0002 |

## 3. Vendor Performance History
| Vendor | Prior project | Rating | Notes |
|---|---|---|---|
| Meridian Critical Power (MCP) | Cygnus | A- | On-time; one FAT anchoring NCR (repeat risk flagged) |
| Cryonix (CRX) | Draco | A | Reliable chiller delivery |
| OrbitControls (OCA) | Cygnus | B- | **Integration schedule slippage** — same risk seen on Prometheus (D-07) |
| Voltearc (VLT) | Draco | A | Good switchgear quality |

## 4. Previous Commissioning Issues (patterns)
- Controls/EPMS integration is the recurring IST-blocking item across projects → start early.
- Battery seismic anchoring is a recurring FAT hold in Zone II+ sites.
- Grid/utility handover timing is a common external critical-path constraint.

## 5. Engineering Best Practices (internal)
- Place long-lead critical POs within 8 weeks of DBR IFC.
- Elevate seismic anchoring and earthing to explicit ITP hold points.
- Require vendor change-control traceability to customer review comments.
- Demonstrate concurrent maintainability (Tier III) explicitly during SAT and IST.

## Revision History
| Rev | Date | Description |
|---|---|---|
| 0 | 10-Jun-25 | Initial compilation |
| 1 | 20-Jun-25 | Linked H-NCR-221 to NCR-0037; OCA risk pattern |

> *Footer:* MGD-ATL-KM-KB-0001 Rev 1 · Confidential

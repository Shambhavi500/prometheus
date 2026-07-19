> **CONFIDENTIAL — PROJECT AQUILA** · Prepared by Northbridge CxA (NBC)
# SITE ACCEPTANCE TEST (SAT) — UPS (Cx Level 4, Blue Tag)

| Field | Value |
|---|---|
| **Document No.** | AQL-NBC-CX-SAT-0012 |
| **Revision** | 0 |
| **Cx Level** | L4 Functional Performance (Blue Tag) |
| **Date** | 18-Jun-2025 |
| **Equipment** | UPS-01…UPS-06, BAT-01…06 (2N, DH1) |
| **Related** | AQL-NBC-CX-PCC-0012 · AQL-ATL-EL-SPC-0012 · AQL-ATL-QA-PUN-0003 |

## Functional Tests (with load bank)
| # | Test | Criteria | Result |
|---|---|---|---|
| 1 | Energisation & no-load | stable | ✔ |
| 2 | Step load 0→50→100% | within tolerance | ✔ |
| 3 | Efficiency at site (100%) | ≥96.5% | ✔ (96.6%) |
| 4 | Battery discharge autonomy | 10 min | ✔ (10.2 min) |
| 5 | Utility-fail simulation → battery | seamless | ✔ (0 ms) |
| 6 | Return to mains / recharge | auto | ✔ |
| 7 | Maintenance bypass operation | no load loss | ✔ |
| 8 | **2N path isolation (A then B)** | load maintained | ✔ (Tier III concurrent maint. demonstrated) |
| 9 | EPMS alarm verification | all points | ⚠ STS-04 point (P05) |

## SAT Outcome
**PASS with punch.** UPS system meets functional and redundancy requirements. Category-A punch
items **P03 (closed at SAT)** and **P05 (EPMS STS-04 mapping, open)** to be cleared before IST
(AQL-NBC-CX-IST-0002). Blue Tag applied.

## Sign-off
| CxA (NBC) | Atlas Cx Mgr | QA | Vendor (MCP) | Helios |
|---|---|---|---|---|
| T. Grigorescu 18-Jun-25 | K. Nair | M. Fernandes | MCP | noted |

> *Footer:* AQL-NBC-CX-SAT-0012 Rev 0 · Confidential

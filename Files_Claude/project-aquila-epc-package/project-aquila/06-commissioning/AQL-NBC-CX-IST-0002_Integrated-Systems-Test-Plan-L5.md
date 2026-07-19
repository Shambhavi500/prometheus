> **CONFIDENTIAL — PROJECT AQUILA** · Prepared by Northbridge CxA (NBC)
# INTEGRATED SYSTEMS TEST (IST) PLAN — DH1 (Cx Level 5, White Tag)

| Field | Value |
|---|---|
| **Document No.** | AQL-NBC-CX-IST-0002 |
| **Revision** | 0 (Issued for Review) |
| **Cx Level** | L5 Integrated (White Tag) |
| **Planned** | 20–22-Aug-2025 |
| **Systems** | SYS-EL-02/03/04, SYS-ME-01/02, SYS-CS-01 |
| **Related** | AQL-NBC-CX-SAT-0012 · AQL-ATL-PM-REG-0001 §D |

## 1. Entry Criteria (Gate)
- All L4 SATs Pass (UPS SAT-0012 ✔; generator & cooling SATs required).
- **All Category-A punch items closed** (P03 ✔, **P05 to be closed**).
- BMS/EPMS integration complete (**D-07 risk — governing**).

## 2. IST Scenarios
| # | Scenario | Expected response |
|---|---|---|
| 1 | Utility failure (both feeds) | UPS ride-through → DG-01…06 start ≤15 s → load transfer |
| 2 | Single generator fail (N+1) | Remaining gensets carry load, no IT loss |
| 3 | UPS System A isolation | System B (2N) carries full load |
| 4 | Chiller trip + TES ride-through | TES-01 maintains temp ≥10 min until standby chiller online |
| 5 | Black-building restart | Sequenced restoration per EPMS logic |
| 6 | Concurrent maintenance demo | Isolate any A/B path; no IT interruption (Tier III) |

## 3. Load
Facility load banks to 12 MW (DH1). Duration: 8-hour integrated + thermal-stability run.

## 4. Exit / Acceptance
On all scenarios pass, issue Commissioning Certificate updates and support Uptime TCCF and RFS.

## Sign-off (plan approval)
| CxA (NBC) | Atlas Cx Mgr | Helios |
|---|---|---|
| T. Grigorescu 25-Jun-25 | K. Nair | R. Menon (to approve) |

> *Footer:* AQL-NBC-CX-IST-0002 Rev 0 · Confidential · IFR

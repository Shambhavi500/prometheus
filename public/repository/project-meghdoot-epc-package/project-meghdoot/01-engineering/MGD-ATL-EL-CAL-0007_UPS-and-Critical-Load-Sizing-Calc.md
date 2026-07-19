> **CONFIDENTIAL — Project Meghdoot** · Prepared by Atlas EPC Solutions
# ENGINEERING CALCULATION — UPS & CRITICAL LOAD SIZING

| Field | Value |
|---|---|
| **Document No.** | MGD-ATL-EL-CAL-0007 |
| **Revision** | B |
| **ISO 19650 Status** | A1 |
| **Discipline** | Electrical |
| **Related** | MGD-ATL-EL-SPC-0012 (UPS Spec) · MGD-ATL-EL-DBR-0002 (DBR) |

## 1. Objective
Determine UPS module count and rating to support 12 MW IT load per data hall at 2N with N+1
module redundancy per frame.

## 2. Inputs
| Parameter | Value |
|---|---|
| IT critical load per hall | 12,000 kW |
| Design margin (future) | 10% |
| UPS module rating | 500 kW |
| Redundancy | 2N (dual independent systems A & B) |

## 3. Calculation (per hall, System A)
```
Design load (with margin) = 12,000 × 1.10 = 13,200 kW
Modules required (N)       = 13,200 / 500  = 26.4 → 27 modules
N+1 per system             = 27 + 1        = 28 modules (System A)
2N total per hall          = 28 × 2        = 56 modules
```
> **Note:** Frame-level (UPS-nn) counts in the Equipment List represent frames/lineups; the
> module counts above populate each frame. Twelve UPS frames (UPS-01…UPS-12) across the
> phased build carry the modular blocks; DH1 (Phase 1) uses UPS-01/-02/-03 (System A) and
> UPS-04/-05/-06 (System B). See MGD-ATL-EL-ELS-0001.

## 4. Battery Autonomy Check
```
Energy for 10 min at 12 MW = 12,000 kW × (10/60) h = 2,000 kWh (per system, System A)
Li-ion usable (per VO-0011), 90% DoD, EoL 80% → installed ≈ 2,780 kWh/system
```
Result: complies with 10-minute autonomy including end-of-life margin.

## 5. Result / Conclusion
UPS module quantity, rating and battery sizing **comply** with DBR and Spec Rev C. No deviation.

## Revision History
| Rev | Date | Status | Description | Prepared | Checked | Approved |
|---|---|---|---|---|---|---|
| A | 10-May-24 | S3 | Initial (VRLA basis) | Elec Engr | P. Deshmukh | — |
| B | 28-May-24 | A1 | Li-ion autonomy per VO-0011 | Elec Engr | P. Deshmukh | Eng Mgr |

> *Footer:* MGD-ATL-EL-CAL-0007 Rev B · Confidential

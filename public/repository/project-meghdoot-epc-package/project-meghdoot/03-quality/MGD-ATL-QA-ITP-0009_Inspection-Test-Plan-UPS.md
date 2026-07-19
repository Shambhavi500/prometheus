> **CONFIDENTIAL — Project Meghdoot** · Prepared by Atlas EPC Solutions (QA/QC)
# INSPECTION & TEST PLAN (ITP) — UPS PACKAGE

| Field | Value |
|---|---|
| **Document No.** | MGD-ATL-QA-ITP-0009 |
| **Revision** | 1 |
| **ISO 19650 Status** | A1 |
| **Discipline** | Quality |
| **Related** | MGD-ATL-EL-SPC-0012 · MGD-ATL-PO-0012 · tags UPS-01…12, BAT-01…12 |

**Intervention codes:** H = Hold Point (cannot proceed) · W = Witness · R = Review of records · S = Surveillance.

| # | Activity | Ref / criteria | Method | Atlas | Helios/CxA | Vendor | Record |
|---|---|---|---|---|---|---|---|
| 1 | Raw material / component IDR | SPC-0012, IEC 62040 | R | R | R | H | MTC |
| 2 | In-process assembly check | Vendor QP | S | — | H | S | Checklist |
| 3 | **FAT (L1) full-load burn-in** | SPC-0012 §4 | **W/H** | **W** | **W** | H | MGD-MCP-CX-FAT-0012 |
| 4 | Efficiency verification (≥96.5%) | SPC-0012 §2 | W | W | W | H | FAT report |
| 5 | Battery autonomy discharge (10 min) | CAL-0007 §4 | W | W | W | H | FAT report |
| 6 | Transfer / bypass test | SPC-0012 | W | W | W | H | FAT report |
| 7 | **Seismic anchoring / enclosure (Zone II)** | IS 1893, SPC | H | W | R | H | Insp. record → **NCR-0037** |
| 8 | Inspection Release Note | PO-0012 terms | H | H | R | — | MGD-ATL-QA-IRN-0028 |
| 9 | Delivery / material inspection (L2) | ITP | H | W | — | — | MGD-ATL-QA-MIR-0031 |
| 10 | Installation checks | MGD-OHM-EL-MS-0015 | H | S | — | S | Install checklist |
| 11 | Pre-commissioning (L3) | MGD-NBC-CX-PCC-0012 | W | W | H | S | PCC record |
| 12 | SAT (L4) | MGD-NBC-CX-SAT-0012 | W | W | H | W | SAT report |

**Note on item 7:** Battery-cabinet seismic anchoring is a Hold Point. Non-conformance at FAT
was raised as **MGD-ATL-QA-NCR-0037** and dispositioned via **MGD-ATL-QA-CAR-0037** before the
Inspection Release Note was issued.

## Revision History
| Rev | Date | Description |
|---|---|---|
| 0 | 20-Dec-24 | Initial ITP |
| 1 | 15-Jan-25 | Seismic anchoring elevated to Hold Point (Zone II) |

## Approval
| Prepared (QA) | Reviewed (Eng) | Approved (QA Mgr) | Employer/CxA |
|---|---|---|---|
| QA Engr | P. Deshmukh | M. Fernandes | Helios / NBC noted |

> *Footer:* MGD-ATL-QA-ITP-0009 Rev 1 · Confidential

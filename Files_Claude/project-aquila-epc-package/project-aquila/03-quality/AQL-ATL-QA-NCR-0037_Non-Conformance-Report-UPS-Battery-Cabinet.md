> **CONFIDENTIAL — PROJECT AQUILA** · Prepared by Atlas EPC Solutions (QA/QC)
# NON-CONFORMANCE REPORT (NCR)

| Field | Value |
|---|---|
| **NCR No.** | AQL-ATL-QA-NCR-0037 |
| **Revision** | 0 |
| **Status** | **CLOSED** (05-Mar-2025) |
| **Severity** | Major |
| **Raised at** | UPS FAT (L1), Meridian Critical Power factory |
| **Date raised** | 10-Feb-2025 |
| **Discipline** | Quality / Electrical |
| **Related equipment** | BAT-01, BAT-02, BAT-03 (DH1 System A battery cabinets) |
| **Related vendor / PO** | Meridian Critical Power (MCP) / AQL-ATL-PO-0012 |
| **Related spec / ITP** | AQL-ATL-EL-SPC-0012 §3 · AQL-ATL-QA-ITP-0009 item 7 |
| **Related FAT** | AQL-MCP-CX-FAT-0012 |
| **Corrective action** | AQL-ATL-QA-CAR-0037 |

## 1. Description of Non-Conformance
During FAT witnessing (ITP item 7, Hold Point), the Li-ion battery cabinet seismic anchoring
brackets for BAT-01/02/03 were found to be **standard (non-seismic) fixings**, not the Zone II
seismic-rated anchoring required by IS 1893 and referenced in Vendor Data Sheet comment #2
(AQL-MCP-EL-VDS-0012). Anchor bolt spacing and bracket gauge did not match the approved seismic
detail.

## 2. Requirement Violated
- SPC-0012 §3 (battery installation to comply with site seismic Zone II).
- VDS-0012 reviewer comment #2 (seismic anchoring detail to be confirmed).
- ITP-0009 item 7 — Hold Point, cannot release without conformance.

## 3. Immediate Action
FAT **Hold Point not cleared** for battery cabinets. Efficiency, autonomy and transfer tests
(ITP items 4–6) passed and were recorded; battery-cabinet dispatch withheld pending correction.
Inspection Release Note (IRN-0028) withheld.

## 4. Disposition (select one)
- [ ] Use-as-is  [ ] Repair  [x] **Rework**  [ ] Reject/Replace

## 5. Root Cause (see CAR-0037)
Vendor production used a superseded anchoring drawing; the Zone II seismic revision was not
propagated to the shop floor traveller.

## Sign-off
| Raised by (QA) | Reviewed (Eng) | Vendor ack. | Approved to close (QA Mgr) |
|---|---|---|---|
| QA Engr 10-Feb-25 | P. Deshmukh 11-Feb-25 | MCP 12-Feb-25 | M. Fernandes 05-Mar-25 |

> *Footer:* AQL-ATL-QA-NCR-0037 Rev 0 · Confidential · CLOSED

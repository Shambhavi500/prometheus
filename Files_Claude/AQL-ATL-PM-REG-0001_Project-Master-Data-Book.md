> **CONFIDENTIAL — PROJECT AQUILA** · Helios Cloud Infrastructure Pvt Ltd · Prepared by Atlas EPC Solutions Pvt Ltd
> **SINGLE SOURCE OF TRUTH.** All equipment tags, vendor codes, PO numbers, and package references used across every project document originate here. Do not create new identifiers without registering them in this book.

# PROJECT MASTER DATA BOOK

| Field | Value |
|---|---|
| **Document No.** | AQL-ATL-PM-REG-0001 |
| **Revision** | 4 |
| **ISO 19650 Status** | A1 |
| **Discipline** | Project Management |
| **Cross-refs** | AQL-ATL-EL-ELS-0001 (Equipment List) · AQL-ATL-PR-AVL-0001 (Approved Vendor List) · AQL-ATL-PM-REG-0002 (Document Register) |

---

## A. PROJECT CONSTANTS

| Attribute | Value |
|---|---|
| Project / Code | Project Aquila / **AQL** |
| Employer | Helios Cloud Infrastructure Pvt Ltd |
| EPC Contractor | Atlas EPC Solutions Pvt Ltd |
| CxA | Northbridge Commissioning Authority (NBC) |
| Main Contract | HEL-ATL-2024-EPC-0001 (FIDIC Silver 2017) |
| Site | Shamshabad, Hyderabad, Telangana, India |
| Tier / Rating | Uptime Tier III · TIA-942 Rated-3 aligned |
| IT Load | 48 MW (4 halls × 12 MW), phased |
| Electrical topology | 2N UPS · N+1 generation · MV 33 kV / LV 415 V |
| Design PUE | ≤ 1.35 |

---

## B. EQUIPMENT TAG REGISTER (canonical)

Tag convention: `<TYPE>-<NN>` with A/B side designation where redundant. Full technical data in `AQL-ATL-EL-ELS-0001`.

### B.1 Electrical

| Tag | Description | Qty | Rating | Redundancy | Supplier (code) | PO |
|---|---|---|---|---|---|---|
| MV-SWGR-01 / -02 | 33 kV MV switchgear, incomer A / B | 2 | 33 kV, 1250 A | 2 feeds (1 active) | Voltearc (VLT) | AQL-ATL-PO-0007 |
| TX-01 … TX-08 | Cast-resin transformer 33/0.415 kV | 8 | 2500 kVA | N+1 per hall | Voltearc (VLT) | AQL-ATL-PO-0007 |
| DG-01 … DG-06 | Diesel generating set, standby | 6 | 2500 kVA / 2000 kW | N+1 | TitanGen (TGN) | AQL-ATL-PO-0009 |
| FT-01 | Bulk diesel storage tank | 1 | 90,000 L (72 h) | — | TitanGen (TGN) | AQL-ATL-PO-0009 |
| LV-SWGR-A1/-B1 … | LV main switchboard | 8 | 415 V, 4000 A | 2N | Voltearc (VLT) | AQL-ATL-PO-0007 |
| **UPS-01 … UPS-12** | Modular static UPS | 12 | **500 kW** each | **2N** (2×UPS per hall block) | **Meridian (MCP)** | **AQL-ATL-PO-0012** |
| BAT-01 … BAT-12 | UPS battery energy storage | 12 | 10 min @ full load | matched to UPS | Meridian (MCP) | AQL-ATL-PO-0012 |
| STS-01 … STS-16 | Static transfer switch | 16 | 415 V | 2N | Meridian (MCP) | AQL-ATL-PO-0012 |
| PDU-A01 … | Power distribution unit | 32 | 415 V | 2N | CableCore (CBC) | AQL-ATL-PO-0021 |
| BW-xx | Overhead busway (white-space) | as-built | 800/1000 A | 2N | CableCore (CBC) | AQL-ATL-PO-0021 |

### B.2 Mechanical (Cooling)

| Tag | Description | Qty | Rating | Redundancy | Supplier | PO |
|---|---|---|---|---|---|---|
| CH-01 … CH-06 | Water-cooled centrifugal chiller | 6 | 1400 TR each | N+1 | Cryonix (CRX) | AQL-ATL-PO-0015 |
| CHWP-01 … CHWP-08 | Primary chilled-water pump | 8 | 250 kW | N+1 | Cryonix (CRX) | AQL-ATL-PO-0015 |
| CT-01 … CT-06 | Cooling tower cell | 6 | 1600 TR | N+1 | Cryonix (CRX) | AQL-ATL-PO-0015 |
| CRAH-01 … CRAH-48 | Computer-room air handler | 48 | 180 kW | N+1 per hall | Cryonix (CRX) | AQL-ATL-PO-0015 |
| TES-01 | Thermal energy storage tank | 1 | 10-min ride-through | — | Cryonix (CRX) | AQL-ATL-PO-0015 |

### B.3 Fire, Safety & Controls

| Tag | Description | Qty | Supplier | PO |
|---|---|---|---|---|
| FACP-01 | Fire alarm control panel (addressable) | 1 | SentinelFire (SFS) | AQL-ATL-PO-0018 |
| FS-01 … FS-08 | Inert-gas (IG-541) suppression skids | 8 | SentinelFire (SFS) | AQL-ATL-PO-0018 |
| ASD-xx | Aspirating smoke detection (VESDA) | as-built | SentinelFire (SFS) | AQL-ATL-PO-0018 |
| BMS-01 | Building Management System head-end | 1 | OrbitControls (OCA) | AQL-ATL-PO-0024 |
| EPMS-01 | Electrical Power Monitoring System | 1 | OrbitControls (OCA) | AQL-ATL-PO-0024 |

---

## C. VENDOR / SUPPLIER REGISTER

| Code | Vendor | Package | PO No. | PO Value (₹ Cr) | PO Date | Status |
|---|---|---|---|---|---|---|
| VLT | Voltearc Power Systems | MV/LV switchgear + transformers | AQL-ATL-PO-0007 | 62.5 | 05-Aug-2024 | Manufacturing / part-delivered |
| TGN | TitanGen Power | Diesel generators + fuel system | AQL-ATL-PO-0009 | 48.0 | 14-Aug-2024 | Manufacturing |
| **MCP** | **Meridian Critical Power** | **UPS + battery + STS** | **AQL-ATL-PO-0012** | **41.2** | **22-Aug-2024** | **Delivered / installing** |
| CRX | Cryonix Thermal Solutions | Chillers, CRAH, cooling | AQL-ATL-PO-0015 | 73.8 | 30-Aug-2024 | Manufacturing |
| SFS | SentinelFire Systems | Fire detection & suppression | AQL-ATL-PO-0018 | 18.4 | 12-Sep-2024 | Design approval |
| CBC | CableCore Systems | Cabling, busway, PDU, containment | AQL-ATL-PO-0021 | 29.6 | 20-Sep-2024 | Part-delivered |
| OCA | OrbitControls Automation | BMS / EPMS / DCIM | AQL-ATL-PO-0024 | 22.1 | 28-Sep-2024 | Design |
| NBX | NexBuild Constructions | Civil & structural (subcontract) | AQL-ATL-SC-0003 | 96.0 | 10-Mar-2024 | Construction |
| OHM | OhmFlow Electricals | Electrical installation (subcontract) | AQL-ATL-SC-0005 | 34.5 | 15-Jun-2024 | Installation |
| PAM | PureAir Mechanical | Mechanical installation (subcontract) | AQL-ATL-SC-0006 | 31.0 | 20-Jun-2024 | Installation |

---

## D. WORK PACKAGE / SYSTEM BOUNDARY LIST

| System ID | System | Key tags | Cx Level owner |
|---|---|---|---|
| SYS-EL-01 | MV distribution | MV-SWGR-01/02, TX-01…08 | NBC |
| SYS-EL-02 | Standby generation | DG-01…06, FT-01 | NBC |
| SYS-EL-03 | UPS & critical power | UPS-01…12, BAT-01…12, STS | NBC |
| SYS-EL-04 | LV distribution & white-space | LV-SWGR, PDU, BW | NBC |
| SYS-ME-01 | Chilled water plant | CH-01…06, CHWP, CT, TES-01 | NBC |
| SYS-ME-02 | Air distribution | CRAH-01…48 | NBC |
| SYS-FS-01 | Fire detection & suppression | FACP-01, FS, ASD | NBC |
| SYS-CS-01 | BMS / EPMS / DCIM | BMS-01, EPMS-01 | NBC |

---

## E. KEY DATE LEDGER (baseline)

| Event | Date | Ref |
|---|---|---|
| NTP | 15-Jan-2024 | Contract |
| DBR Rev 0 (IFC) | 20-May-2024 | AQL-ATL-EL-DBR-0002 |
| UPS Spec Rev C approved | 12-Jun-2024 | AQL-ATL-EL-SPC-0012 |
| UPS PO placed | 22-Aug-2024 | AQL-ATL-PO-0012 |
| UPS FAT (L1) | 10-Feb-2025 | AQL-MCP-CX-FAT-0012 |
| NCR-0037 raised (UPS battery cabinet) | 10-Feb-2025 | AQL-ATL-QA-NCR-0037 |
| NCR-0037 closed | 05-Mar-2025 | AQL-ATL-QA-CAR-0037 |
| UPS Inspection Release Note | 12-Mar-2025 | AQL-ATL-QA-IRN-0028 |
| UPS delivered to site | 04-Apr-2025 | AQL-ATL-QA-MIR-0031 |
| UPS installation complete | 20-May-2025 | AQL-OHM-EL-MS-0015 |
| UPS pre-commissioning (L3) | 02-Jun-2025 | AQL-NBC-CX-PCC-0012 |
| UPS SAT (L4) | 18-Jun-2025 | AQL-NBC-CX-SAT-0012 |
| DH1 IST (L5) | 20-Aug-2025 | AQL-NBC-CX-IST-0002 |
| Phase 1 RFS | 30-Sep-2025 | Contract |

## Revision History
| Rev | Date | Status | Description |
|---|---|---|---|
| 0 | 20-May-2024 | A1 | Initial issue post-DBR |
| 1 | 30-Aug-2024 | A1 | Vendor/PO register populated after award |
| 2 | 15-Mar-2025 | A1 | Added NCR-0037 / IRN-0028 to date ledger |
| 3 | 25-May-2025 | A1 | Installation dates updated |
| 4 | 25-Jun-2025 | A1 | Cx L3/L4 dates confirmed |

> *Footer:* AQL-ATL-PM-REG-0001 Rev 4 · Confidential · Canonical master data — controlled document

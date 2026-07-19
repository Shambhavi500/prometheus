> **CONFIDENTIAL — PROJECT AQUILA** · Helios Cloud Infrastructure · Prepared by Atlas EPC Solutions
> Uncontrolled when printed.
# DESIGN BASIS REPORT (ELECTRICAL & MECHANICAL)

| Field | Value |
|---|---|
| **Document No.** | AQL-ATL-EL-DBR-0002 |
| **Revision** | 0 (Issued for Construction) |
| **ISO 19650 Status** | A1 |
| **Discipline** | Electrical / Mechanical (multi-disc) |
| **Related equipment** | All SYS-EL / SYS-ME tags per AQL-ATL-PM-REG-0001 |
| **Related specs** | AQL-ATL-EL-SPC-0012 (UPS) and package specs |
| **Related calcs** | AQL-ATL-EL-CAL-0007 (UPS/load sizing) |

## 1. Purpose
Establish the engineering design basis for Project Aquila, a 48 MW hyperscale data centre
designed to Uptime Institute **Tier III** (concurrently maintainable) and TIA-942 Rated-3
alignment, located at Shamshabad, Hyderabad.

## 2. Design Criteria — Site & Environment
| Parameter | Value |
|---|---|
| Ambient design (summer, ASHRAE 0.4%) | 43 °C DB / 24 °C WB |
| Seismic zone (IS 1893) | Zone II |
| Grid supply | 132/33 kV utility substation, dual feed |
| Altitude | 542 m AMSL |
| Design PUE | ≤ 1.35 annualised |

## 3. Electrical Design Basis
| Item | Basis |
|---|---|
| IT critical load | 48 MW total; 12 MW per data hall (DH1–DH4) |
| Distribution voltage | 33 kV MV ring → 33/0.415 kV transformers → 415 V LV |
| UPS topology | **2N**, static double-conversion, modular (UPS-01…UPS-12, 500 kW each) |
| UPS autonomy | 10 minutes at full load (bridging to generator start ≤ 15 s) |
| Standby generation | **N+1** diesel (DG-01…DG-06, 2500 kVA each), 72-h on-site fuel (FT-01) |
| Concurrent maintainability | Any single distribution path removable for service without IT load loss |
| Fault level (LV) | 65 kA for 1 s at main LV boards |
| Earthing | TN-S; separate clean earth for critical loads; SPD at each board level |

**Redundancy statement:** Every critical electrical component is served by two independent
distribution paths (A/B). One path may be isolated for maintenance while the load remains
supported by the alternate path — the defining Tier III requirement.

## 4. Mechanical (Cooling) Design Basis
| Item | Basis |
|---|---|
| Cooling medium | Chilled water, primary/secondary, N+1 |
| Chillers | CH-01…CH-06, 1400 TR each (5 duty + 1 standby at full build) |
| Supply/return temp | 18 °C / 30 °C (raised-temperature operation for efficiency) |
| Ride-through | Thermal energy storage TES-01 provides ≥ 10-min ride-through |
| Air distribution | CRAH-01…CRAH-48, hot-aisle containment |

## 5. Fire & Life Safety
Addressable detection (FACP-01) + aspirating smoke detection (VESDA/ASD). Suppression by
inert gas IG-541 (FS-01…FS-08) in data halls and electrical rooms. Compliant with NBC 2016
and NFPA 75 principles.

## 6. Controls
Integrated BMS (BMS-01), EPMS (EPMS-01) and DCIM. All critical alarms hard-wired and
network-monitored. See package spec for OrbitControls (OCA) scope.

## 7. Codes & Standards
IS/IEC 61439 (switchgear), IEC 62040 (UPS), IEC 60076 (transformers), ISO 8528 (gensets),
IEEE 3006 series (reliability), Uptime Institute Tier Standard, TIA-942, CEA Regulations,
Indian Electricity Rules, NBC 2016.

## Revision History
| Rev | Date | Status | Description | Prepared | Reviewed | Approved |
|---|---|---|---|---|---|---|
| A | 15-Apr-24 | S3 | Issued for review | P. Deshmukh | Eng Mgr | — |
| B | 05-May-24 | S4 | Client + CxA comments | P. Deshmukh | Eng Mgr | — |
| 0 | 20-May-24 | A1 | Issued for Construction | P. Deshmukh | Eng Mgr | S. Krishnan / R. Menon |

> *Footer:* AQL-ATL-EL-DBR-0002 Rev 0 · Confidential · IFC

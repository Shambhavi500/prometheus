# PROJECT AQUILA — EPC DOCUMENTATION PACKAGE
### Hyperscale Data Centre · 48 MW · Uptime Tier III · Shamshabad, Hyderabad
**Employer:** Helios Cloud Infrastructure Pvt Ltd · **EPC Contractor:** Atlas EPC Solutions Pvt Ltd · **CxA:** Northbridge Commissioning Authority
**Contract:** HEL-ATL-2024-EPC-0001 (FIDIC Silver 2017) · *All documents fictional — for AI-platform demonstration.*

---

## 1. What this package is
A realistic, internally-consistent EPC document corpus for one fictional project, spanning the
full documentation lifecycle. It is designed as an **ingestion dataset for an EPC Project
Intelligence platform** — the documents are richly cross-referenced so an AI can build equipment
relationships, trace revisions, detect deviations, and surface lessons.

Start here → **`00-project-information/AQL-ATL-PM-REG-0001_Project-Master-Data-Book.md`** (the
single source of truth for all equipment tags, vendors, POs and dates) and
**`AQL-ATL-PM-REG-0002_Master-Document-Register.md`** (index of every document).

## 2. Folder structure
```
00-project-information   Charter, master data book, registers, numbering standard, org chart, comms matrix
01-engineering           DBR, UPS spec, load calc, equipment list, cable schedule, drawing register, design review
02-procurement           AVL, PR, TBE, CBE, PO, MAR, VDS, BOM
03-quality               ITP, NCR, CAR, IRN, MIR, punch list, quality acceptance certificate
04-construction          Method statement, DCR, WPR, concrete pour, installation checklist
05-planning              Master schedule, risk register, delay register, lookahead
06-commissioning         Cx plan, FAT (L1), pre-Cx (L3), SAT (L4), IST plan (L5), certificate, deficiency list
07-safety                PTW/hot work, LOTO register, near-miss, toolbox talk
08-commercial            Variation order, cost impact, payment milestones
09-communication         RFI, site instruction, meeting minutes, decision log, technical query
10-knowledge             Lessons learned, historical knowledge base
```

## 3. Conventions (see `AQL-ATL-PM-STD-0001`)
- **Doc number:** `AQL-<ORIG>-<DISC>-<TYPE>-<NNNN>` + Rev + ISO 19650 status.
- **Revisions:** P01.. (WIP) → A,B,C.. (review/approval) → 0 (IFC/IFU) → 1,2.. (post-issue).
- **ISO 19650 status:** S0–S4 (WIP/shared), A1 (authorised), B1 (issued w/ comments), CR (as-built).
- **Commissioning levels:** L1 FAT · L2 delivery (Yellow) · L3 pre-functional (Green) · L4 SAT (Blue) · L5 IST (White).

## 4. The "golden thread" — UPS package end-to-end (traceable chain for AI reasoning)
```
DBR (DBR-0002)
  └─> UPS Spec (SPC-0012 Rev C)  <── RFI-0052 (fault level/earthing) ──> SI-0044 ──> Cable earth C-DH1-EARTH1
        │                        <── VO-0011 (VRLA→Li-ion) ── CIA-0011
        ├─> Load Calc (CAL-0007 Rev B)
        ├─> Purchase Requisition (PR-0031)
        │      └─> TBE-0031 (MCP wins; NIM non-compliant) ─> CBE-0031 ─> PO-0012 (Meridian)
        │             ├─> VDS-0012 (comment #2 = seismic anchoring) ─> MAR-0044 (Li-ion) ─> BOM-0012
        │             └─> TQ-0018 (autonomy BoL/EoL)
        ├─> ITP-0009 (item 7 seismic = HOLD)
        │      └─> FAT-0012 (L1): efficiency PASS 96.8%, anchoring FAIL
        │             └─> NCR-0037 ─> CAR-0037 (root cause: vendor change-control gap) ─> IRN-0028 ─> MIR-0031 (L2)
        ├─> Method Statement MS-0015 + Install Checklist CHK-0015 (OhmFlow)
        └─> Cx: PCC-0012 (L3) ─> SAT-0012 (L4, 2N demonstrated) ─> IST-0002 (L5) ─> CER-0012
                 └─> Punch PUN-0003 (P05 EPMS) & Deficiency DEF-0005 (blocks IST) ─> Delay D-07 / Risk R-011
```
Historical echo: `KB-0001` records **H-NCR-221** (Project Cygnus) — the *same* battery seismic
anchoring issue — and flags **OrbitControls** integration slippage as a recurring IST risk.

## 5. Example questions the corpus can answer
- *"Why was UPS dispatch delayed?"* → NCR-0037 (seismic anchoring) → CAR-0037 → IRN-0028.
- *"Which bidder was non-compliant and why?"* → TBE-0031 (Nimbus, 96.0% < 96.5% efficiency).
- *"What is blocking the Integrated Systems Test?"* → DEF-0005 / P05 (EPMS STS-04) + D-07 (OCA integration).
- *"What changed the battery type and what did it cost?"* → VO-0011 / CIA-0011 (+₹2.9 Cr).
- *"Has this problem happened before?"* → KB-0001 H-NCR-221 (yes, Project Cygnus).

## 6. Converting to PDF
Each file is plain Markdown. Convert individually or in bulk, e.g.:
```
pandoc <file>.md -o <file>.pdf            # single file (requires pandoc + LaTeX)
find . -name '*.md' -exec pandoc {} -o {}.pdf \;   # bulk
```

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

**M A S T E R D E L I V E R Y - I N T E L L I G E N C E B L U E P R I N T  ·  S I N G L E S O U R C E O F T R U T H** 

# **Tvashta** 

#### The Execution Intelligence Layer for Data Centre EPC Project Delivery 

_A continuously-reasoning, multi-agent intelligence layer built on the Octave Digital Thread — turning connected project data into connected, auditable, executable decisions across Design → Build → Operate → Protect._ 

|**PROGRAMME**|ET AI Hackathon 2026 · Problem Statement 4 — AI Intelligence Platorm for Data Centre EPC<br>Project Delivery|
|---|---|
|**INDUSTRY PARTNER**|Octave (the Hexagon Asset Lifecycle Intelligence + Safety, Infrastructure & Geospatal spin-<br>of)|
|**DOCUMENT CLASS**|Enterprise Product & Architecture Blueprint — Confdental, internal team use|
|**PURPOSE**|The single reference from which every architecture, feature, UI, roadmap and pitch decision<br>is derived|
|**VERSION**|1.0  ·  Working codename: Tvashta|



_This is not a research report. It is written to read like a Palantir internal design specification, an Apple product requirement document, and a McKinsey strategy note — clean, decision-oriented, and implementation-ready._ 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 1 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

## **Contents** 

|**F R O N T M A T T E R**<br>Reading map & provenance..................................................................................................................................3|
|---|
|**S T R A T E G Y**<br>|
|**01**Executve Summary.........................................................................................................................................4|
|**02**Reverse Engineering the Brief........................................................................................................................ 7|
|**03**Research Summary — Verifed & Actonable..............................................................................................10|
|**04**Final Product Defniton................................................................................................................................ 12|
|**E N G I N E E R I N G C O R E**|
|**05**Complete Feature Specifcaton...................................................................................................................14|
|**06**Complete System Architecture....................................................................................................................19|
|**07**Knowledge Graph Design............................................................................................................................. 22|
|**08**Agent Architecture........................................................................................................................................24|
|**09**Technology Stack...........................................................................................................................................26|
|**10**Implementaton Roadmap............................................................................................................................27|
|**11**Implementaton Guide..................................................................................................................................29|
|**G O - T O - M A R K E T & E X P E R I E N C E**|
|**12**Demo Strategy...............................................................................................................................................31|
|**13**Business Strategy..........................................................................................................................................33|
|**14**UI / UX Specifcaton.....................................................................................................................................35|
|**R E F E R E N C E**|
|**15**References — Ofcial & Primary Sources....................................................................................................36|
|**A**Appendix — Glossary, Reuse Map, Open Items...........................................................................................37|



Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 2 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

###### **A B O U T T H I S D O C U M E N T** 

##### **Reading map & provenance** 

This blueprint is organised as fifteen decision-oriented sections plus an appendix. Sections 1–4 set the thesis and product definition; 5–11 are the engineering core (features, architecture, knowledge graph, agents, stack, roadmap, implementation); 12–14 cover the demo, business case and experience design; 15 lists official sources. Every claim about the industry, the partner, or the technology is grounded in the primary sources catalogued in Section 15. 

###### **I N S I G H T ·   On inputs and verification** 

The task brief referenced several upstream research files (CLAUDE / GPT / GEMINI / PERPLEXITY / DEEPSEEK research, the official problem statement, and hackathon logistics) as attachments. Those files were not present in the working set; only the judges’-meeting notes and scope guidance were. Rather than reproduce unverified second-hand claims, the council re-derived the domain from primary and official sources — Octave/Hexagon material, ASHRAE and Uptime Institute commissioning guidance, TIA-942, FIDIC, Microsoft’s GraphRAG research, Anthropic’s multi-agent guidance, and 2025–2026 industry data on data-centre schedule and supply-chain risk. Where a figure is time-sensitive it is dated. Open items that would benefit from the original attachments are listed in Appendix C. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 3 



<!-- Start of picture text -->
Tvashta turns Octave's connected data into connected decisions.<br>DECISIONS & ACTIONS<br>Order-now signals - change-order impact - commissioning go/no-go - escalations<br>Tvashta — EXECUTION INTELLIGENCE LAYER<br>Multi-agent reasoning - Project Knowledge Graph - Hybrid GraphRAG- Evidence & Audit<br>OCTAVE DIGITAL THREAD<br>InConcert Core (SDx) - Smart Materials - Smart Completions - iConstruct - HXGN EAM - PAS<br>PROJECT DATA SOURCES<br>Specifications - Submittals - Drawings & BIM - P6 schedule - POs & vendor docs - FAT/SAT & test records - RFls - email<br><!-- End of picture text -->

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

- **The data already exists — the intelligence does not.** The judges were explicit: the problem is not missing data, it is data trapped in silos with no connective reasoning between specification, procurement, construction, commissioning and operations. 

- **Intelligence must recommend and act, not merely report.** A dashboard that tells you a transformer is late after it is late has added nothing. The layer must predict, recommend, and — under human approval — execute. 

###### **C O R E P R I N C I P L E S** 

|**#**|**Principle**|**What it means in practce**|
|---|---|---|
|1|Decisions over documents|Every feature is judged by the decision it improves, not the artefact it<br>stores.|
|2|Explainable by constructon|Every output ships with its citatons and reasoning trace; there is no un-<br>sourced claim.|
|3|Typed graph over free-form triples|A governed EPC ontology anchors extracton, so the knowledge graph is<br>precise and traversable, not noisy.|
|4|Recommend, then act — with a human<br>gate|Agents propose actons; a person approves anything that writes back or<br>leaves the system.|
|5|Complement Octave, never replace it|Tvashta consumes and enriches the Octave Digital Thread; it is the<br>reasoning layer, not a rival system of record.|
|6|One thread, whole lifecycle|The same graph and agents serve Design, Build, Operate and Protect —<br>no artefact is orphaned at a phase boundary.|
|7|Build the reusable core|The architecture generalises across all eight of the partner’s challenge<br>domains, not just this one.|



_Table 1.  Tvashta’s seven non-negotiable design principles._ 

###### **W H Y T H I S P R O D U C T E X I S T S** 

Data-centre delivery has become a supply-chain and coordination problem wearing a construction costume. Long-lead electrical equipment now dominates the critical path — large power transformers routinely quote 80–128 weeks and custom units stretch to 3–5 years, medium-voltage switchgear 44–80 weeks, and cooling distribution units 26–52 weeks with demand up over 150% year-on-year. A single conflicting assumption buried across two documents (“switchgear: 52 weeks” in one, “78 weeks” in another) can cascade six weeks of slip into eight-to-ten weeks of delayed integrated systems testing, and surface only at a schedule review more than a year later. Industry data puts schedule overruns on roughly nine in ten large infrastructure projects, and weak interface management alone can add up to ~18% to project cost. The pain is not a shortage of information; it is the absence of a layer that reasons across it. 

###### **E V I D E N C E ·   The problem, in the industry’s own words** 

A 2026 data-centre procurement analysis frames the exact thesis of this product: if one document says switchgear delivery is 52 weeks and another says 78 weeks, the system should flag the conflict — “schedule models fail when assumptions hide in PDFs” — and, crucially, “AI should not only report status; it should trigger decisions… that is the difference between reporting and execution.” (See Section 15.) 

###### **W H Y N O W** 

Three curves have crossed. First, demand: AI build-out has compressed data-centre delivery cycles below 18 months while long-lead equipment has moved the other way, making coordination the binding constraint. Second, capability: graph-augmented retrieval (GraphRAG) and production-grade multi-agent orchestration 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 5 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

matured in 2024–2025 into patterns that can reason over heterogeneous engineering corpora with citations. Third, platform: with Octave established in 2026 as an independent, AI-forward asset-lifecycle company organised precisely around Design→Build→Operate→Protect, there is now a Digital Thread worth reasoning on top of. Tvashta is the layer that the moment demands and the platform makes possible. 

###### **H O W W E W I N** 

- **Against the field of teams.** Most will build a RAG chatbot over PDFs. We build the intelligence layer the judges explicitly asked for: knowledge graph, multi-agent reasoning, geospatial, predictive, auditable, action-oriented. 

- **Against generic AI.** Our differentiation is depth in one hard domain — data-centre EPC — expressed as a governed ontology, real commissioning logic (L1–L5), and real supply-chain physics, not prompt templates. 

- **On the demo.** A single, visceral moment — Tvashta catching a spec deviation and a hidden schedule conflict live, with citations, and recommending the exact executable action — lands the thesis in ninety seconds. 

- **On the business.** It reads like the next module Octave itself would build: same philosophy, same lifecycle, same customers, incremental to their stack. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 6 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **02   Reverse Engineering the Brief** 

This section decodes what actually needs to be won: the literal problem statement, the signals the judges revealed, the industry partner’s worldview, and the market forces beneath all three. It is the reasoning from which the product definition in Section 4 is derived. 

###### **2.1  The problem statement, precisely scoped** 

Problem Statement 4 asks for an AI intelligence platform for data-centre EPC project delivery. Beneath the headline, the real problem is a ~10%+ project-overrun problem caused by disconnected specifications, submittals, test records and schedules. The official emphasis resolves into five capability areas, which become the spine of the product: 

|**PS4 capability area**|**The underlying failure it addresses**|**Tvashta agent**|
|---|---|---|
|**Specifcaton compliance**|Submited equipment silently deviates from spec or code;<br>caught late, in the feld.|Spec-Compliance Agent|
|**Predictve schedule risk**|Long-lead and interface dependencies hide in PDFs untl they<br>detonate the critcal path.|Schedule-Risk Agent|
|**Supply-chain visibility**|Procurement status, lead tmes and vendor risk live outside<br>the schedule’s reasoning.|Supply-Chain Agent|
|**Commissioning intelligence**|L1–L5 readiness is tracked in spreadsheets disconnected from<br>the systems being certfed.|Commissioning Agent|
|**Project knowledge**<br>**intelligence**|Hard-won lessons and context evaporate between phases and<br>between projects.|Knowledge / Learning Agent|



_Table 2.  The five official capability areas map one-to-one onto Tvashta’s specialist agents._ 

###### **2.2  What the judges actually rewarded** 

The judges’ pre-brief revealed how they think — and it is not “build an AI chatbot.” The consistent, repeated signals, and the design response each one forces: 

|**Judge signal (repeated in the brief)**|**Design response it forces**|
|---|---|
|Build the intelligence layer, not another dashboard or DMS|Positon as an executon-intelligence layer; never demo a chat box<br>as the product.|
|Everything lives on the Design→Build→Operate→Protect lifecycle|Architecture and features are organised by these four phases;<br>nothing is orphaned at a boundary.|
|The data isn’t the problem — the silos are|Lead with the Project Knowledge Graph that connects previously<br>disconnected artefacts.|
|Say “intelligence,” not “automaton/analytcs”|Product language and features centre on decision, predictve and<br>lifecycle intelligence.|
|Mult-agent AI is expected; one LLM won’t impress|Orchestrator-worker mult-agent system with named specialist<br>agents.|
|Knowledge graphs are expected — not just embedded PDFs|A typed, governed ontology with real EPC relatonships, not free-<br>form vectors alone.|
|Geospatal is a strong signal, even for EPC|First-class geospatal ops map: factories, shipments, site logistcs,<br>risk heatmaps.|



Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 7 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

|RAG alone will not win|Hybrid GraphRAG: extracton → graph → reasoning → agent<br>collaboraton → decision → acton.|
|---|---|
|Mission-critcal, enterprise, industrial feel|Palantr/Bloomberg-grade UI; no consumer-app aesthetcs.|
|Improve safety, revenue, efciency, delivery|Every feature states which of the four it moves, quanttatvely<br>where possible.|
|Every answer explainable: citatons, audit, evidence|Explainability is structural — citatons and reasoning traces on<br>every output.|
|Recommend actons, not just insights|Agents end in recommended, executable actons behind a<br>human-approval gate.|



_Table 3.  Decoding the judges’ meeting: each revealed preference is converted into a concrete design commitment._ 

###### **J U D G E L E N S ·   The single sentence to never say** 

“We built an AI chatbot / AI search over your documents.” The winning sentence is: “We unified disconnected enterprise intelligence into one continuously-learning, auditable AI operating layer that predicts risk and recommends the action.” 

###### **2.3  The industry partner: Octave** 

Octave is the software company spun out of Hexagon AB in 2025–2026, combining Hexagon’s Asset Lifecycle Intelligence and Safety, Infrastructure & Geospatial divisions with Bricsys, ETQ and Projectmates. It positions itself around “unleashing intelligence at scale” across four lifecycle pillars — Design, Build, Operate, Protect — powered by domain-specific AI, for mission-critical assets where failure is not an option. Its relevant portfolio is the substrate Tvashta reasons on: 

|**Octave capability**|**Product (current / former name)**|**What Tvashta consumes or enriches**|
|---|---|---|
|**Engineering informaton / Digital**<br>**Thread backbone**|InConcert Core (formerly HxGN SDx)|Tags, documents, engineering data, change<br>impact — the spine of the knowledge graph.|
|**Materials & procurement**|Smart Materials (incl. Expeditng &<br>Inspecton)|POs, expeditng, inspecton and site-materials<br>status for the Supply-Chain Agent.|
|**Constructon & completons**|Smart Completons|Punch lists, turnover packages, installaton/test<br>verifcaton for the Commissioning Agent.|
|**BIM coordinaton**|iConstruct|Model objects and clash context linked to tags<br>and specifcatons.|
|**Operate / maintain**|HxGN EAM|Asset and maintenance context for the Operate<br>phase and lifecycle learning.|
|**Protect**|PAS (Cyber & PlantState Integrity)|OT/ICS risk context feeding the Protect phase<br>and the Risk entty.|



_Table 4.  Octave’s portfolio, mapped to what Tvashta reads and writes. We extend the Digital Thread; we do not replace the systems of record._ 

###### **P R I N C I P L E ·   Complement, do not replace** 

Tvashta is explicitly framed as an AI intelligence layer on top of Octave. Octave owns the systems of record and the connected data; Tvashta owns the reasoning and the recommended action. This is the same relationship a decision layer has to a data platform — and it is exactly the kind of module Octave itself would build next. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 8 



<!-- Start of picture text -->
Specs - BoD : drawings - modmifmittals - POs - FAT/SAT - pr6gnessissioning L1-L5 - turnover CO&aWlliance - security - risk register<br>Tvashta — reasons continuously across the entire thread<br><!-- End of picture text -->

Extends Octave's Digital Thread from connected DATA to connected DECISIONS across the asset lifecycle. 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **03 Research Summary — Verified & Actionable** 

This is a distillation, not a dump: only findings that survived verification against official or primary sources and that change a product decision are included. Full citations are in Section 15. 

###### **3.1  Data-centre delivery physics** 

|**Verifed fnding (dated where volatle)**|**Implicaton for Tvashta**|
|---|---|
|Large power transformers quote 80–128 weeks; custom units 3–5 years<br>(2025–26).|Long-lead items are the critcal path; the Schedule-Risk<br>Agent must treat procurement as a programme item.|
|MV switchgear 44–80 wk; CDUs 26–52 wk (+156% YoY demand, 2025).|Cooling and switchgear are now critcal-path, not late-<br>stage; model them explicitly.|
|AHJ submital review ofen 30–45 days vs the 10-day assumpton in<br>schedules.|Encode approval-cycle assumptons as checkable graph<br>facts; fag optmistc schedules.|
|A 6-week switchgear slip can cascade 8–10 weeks into commissioning.|Risk propagaton across dependencies is the core<br>computaton, not a report feld.|
|~9 of 10 large infrastructure projects overrun; weak interface<br>management adds up to ~18% cost.|Interface/dependency reasoning is where the ROI is; center<br>the product on it.|
|Delivery cycles now <18 months while equipment lead tmes exceed<br>them.|Foresight, not status reportng, is the value; predict and<br>recommend early.|



_Table 5.  Data-centre delivery is a coordination and supply-chain problem; the findings point squarely at predictive, dependency-aware reasoning._ 

###### **3.2  Commissioning is a five-level, evidence-producing process** 

Data-centre commissioning follows a widely-used five-level model aligned to ASHRAE Guideline 0 (and the data-centre-specific Guideline 1.6), with Uptime Institute Tier and TIA-942 as the reliability frame. Each level produces evidence that should attach to the exact equipment and system it certifies: 

|**Level**|**Name**|**Purpose**|**Evidence produced**|
|---|---|---|---|
|**L1**|Factory Acceptance Test (FAT)|Verify components meet spec before shipment (e.g.<br>generator under simulated load).|FAT reports, certfcates|
|**L2**|Site/Delivery & installaton<br>verifcaton|Confrm delivered equipment matches approved<br>submitals; correct install.|Delivery & install checklists|
|**L3**|Pre-functonal / start-up|Verify each component operates independently,<br>correctly installed.|Pre-functonal checklists|
|**L4**|Functonal performance test|Test each system under simulated load / operatng<br>conditons.|FPT scripts & results|
|**L5**|Integrated systems test (IST)|End-to-end failure/recovery scenarios across<br>integrated systems.|IST scripts, pass/fail records|



_Table 6.  The five commissioning levels. Tvashta models each as evidence rolling up to a Commissioning Package that certifies a system._ 

###### **3.3  The AI patterns that actually apply** 

- **GraphRAG beats naïve RAG on engineering corpora — if the graph is governed.** Microsoft’s GraphRAG builds an entity graph via LLM extraction, then community summaries for local and global search. But research on industrial knowledge graphs finds that an explicit, predefined ontology (rather than free-form 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 10 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

LLM triples) eliminates extraction noise and enables precise typed traversal. Tvashta therefore uses a governed EPC ontology to bind extraction. 

- **Entity resolution is the make-or-break.** The same tag or vendor appears a dozen ways across documents; robust deduplication is a first-class subsystem, not an afterthought. 

- **Orchestrator-worker multi-agent systems are the proven production pattern.** Anthropic’s multi-agent research system (a lead orchestrator delegating to specialised subagents) outperformed a single strong agent by ~90% on breadth-heavy tasks, at ~15× the tokens; coordination failures account for a large share of multi-agent failures, so workers never talk to each other — every decision flows through the orchestrator, with explicit timeout, escalation and rollback. 

- **Tiered models control cost.** A stronger model orchestrates; cheaper, faster models do the specialised work — the standard production cost/quality trade. 

###### **D E C I S I O N ·   Locked architectural decisions from the research** 

(1) Governed EPC ontology binds all extraction. (2) Hybrid retrieval = typed graph traversal + vector recall + community summaries. (3) Orchestrator-worker multi-agent topology with a human-approval gate on any action. (4) Every output carries citations and a reasoning trace. These are settled; later sections implement them. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 11 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **04 Final Product Definition** 

###### **4.1  What we are building** 

Tvashta is an execution-intelligence layer for data-centre EPC delivery. It ingests every project artefact, binds it into a typed Project Knowledge Graph governed by a data-centre EPC ontology, and runs a team of specialised AI agents that continuously reason over that graph to verify specification compliance, predict schedule risk from long-lead and interface dependencies, maintain supply-chain and procurement visibility, drive commissioning readiness across L1–L5, and preserve project knowledge across the lifecycle. Every finding is explainable by construction — carrying its citations and reasoning — and ends in a recommended, executable action behind a human-approval gate. It runs on top of Octave, extending the Digital Thread from connected data to connected decisions. 

###### **4.2  What we are deliberately NOT building** 

|**We are NOT building…**|**Because…**|
|---|---|
|**A general-purpose AI chatbot or document search box**|The judges explicitly rejected this; the value is reasoning across silos, not<br>retrieval.|
|**A new system of record for documents, schedules or**<br>**materials**|Octave (and P6) already own that; we are the intelligence layer, not a<br>competng store.|
|**A generic ‘LLM over your PDFs’ vector app**|Naïve RAG is unreliable on engineering documents and undiferentated.|
|**A consumer-grade app with playful UX**|The context is mission-critcal, enterprise and industrial.|
|**An autonomous system that acts without oversight**|Actons that write back or leave the system pass a human-approval gate<br>— always auditable.|
|**A feature grab-bag**|Every feature must defend itself technically, commercially and<br>strategically, or it is cut.|



_Table 7.  Explicit non-goals. Discipline about what we refuse to build is itself a differentiator._ 

###### **4.3  The pitch, at three lengths** 

###### **P R I N C I P L E ·   One sentence** 

Tvashta is the execution-intelligence layer that reads a data-centre project as one connected body of knowledge and catches the spec deviation, schedule conflict or commissioning gap — with the evidence and the recommended action already attached — while there is still time to fix it. 

###### **Thirty seconds.** 

Data-centre programmes don’t fail for lack of data; they fail because the data sits in silos and the critical assumption hides in a PDF until it detonates the critical path a year later. Tvashta ingests every spec, submittal, PO, schedule and test record into a typed knowledge graph and runs specialised AI agents over it that verify compliance, predict schedule risk, track the supply chain and drive commissioning — every finding sourced and explainable, every recommendation ready to execute. It sits on top of Octave and turns the Digital Thread from connected data into connected decisions. 

###### **Two minutes.** 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 12 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

Building a data centre today is a coordination problem wearing a construction costume. Large transformers quote up to two-plus years, switchgear and cooling units are now on the critical path, and delivery cycles have compressed below eighteen months. In that squeeze, the thing that kills programmes is a disconnected assumption — a submittal that quietly deviates from a code clause, a lead time that says 52 weeks in one document and 78 in another, a commissioning dependency nobody linked to the schedule. Nine in ten large projects overrun, and weak interface management alone can add nearly a fifth to cost. The information to prevent all of this already exists; what’s missing is a layer that reasons across it. Tvashta is that layer. It binds every artefact into a governed Project Knowledge Graph and runs an orchestrated team of AI agents — Spec-Compliance, Schedule-Risk, Supply-Chain, Commissioning and Knowledge — that continuously reason over the graph, flag the deviation or the hidden conflict with citations to the exact source, and recommend the specific executable action, behind a human-approval gate. It sits on top of Octave, consuming InConcert Core, Smart Materials and Smart Completions, and extends the Digital Thread across the full 

Design→Build→Operate→Protect lifecycle. It is, in short, the next module Octave itself would build — and the one the judges asked for. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 13 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **05 Complete Feature Specification** 

Features are specified to be defended, not listed. Each core capability is an agent that reasons over the shared Project Knowledge Graph; the platform features make that reasoning ingestible, explainable and actionable. Every capability states its purpose, the problem it solves, the user journey, business value, why judges will care, the technical flow, the implementation plan, technology, dependencies and future scope. Priorities follow (Must / Should / Future). 

###### **P R I N C I P L E ·   One engine, five lenses** 

The five agents are not five products. They are five reasoning lenses over one graph. This is why the architecture generalises: adding a sixth capability is adding a lens, not a system. 

###### **5.1  Spec-Compliance Agent** 

|**Dimension**|**Specifcaton**|
|---|---|
|**Purpose**|Contnuously verify that submited equipment, materials and shop drawings satsfy the governing<br>specifcaton and code clauses, and surface every deviaton with its evidence.|
|**Problem solved**|Deviatons between what was specifed and what was submited/delivered are caught late — ofen<br>in the feld or at commissioning — when correcton is most expensive. Review is manual, sampled,<br>and loses the link to the exact clause.|
|**User journey**|An engineer opens the submital review queue; Tvashta has already parsed each submital,<br>matched it to the relevant requirement and code clause in the graph, and fagged deviatons. The<br>engineer sees the requirement, the submited value, the clause, and the source page side-by-side,<br>and approves / rejects / raises an RFI in one acton.|
|**Business value (safety /**<br>**revenue / efciency / delivery)**|Efciency (review tme collapses from days to minutes) and delivery (deviatons caught pre-<br>fabricaton avoid rework and schedule loss); safety (code non-compliance caught before<br>energisaton).|
|**Why judges will care**|It is the cleanest demonstraton of ‘explainable by constructon’ and of connectng specifcaton to<br>procurement — two things the judges named directly.|
|**Technical fow**|Ingest submital → extract typed values (ratng, capacity, make, standard) → resolve to<br>Equipment/Tag → fetch Requirement + Standard clause → agent evaluates conformance → write<br>SATISFIES / VIOLATES edge with deviaton → atach citatons → recommend acton → human gate<br>(see Figure 6).|
|**Implementaton plan**|Phase 1. Start with electrical and mechanical equipment submitals (highest risk); template the<br>ontology mappings; build the deviaton evaluator with a code-clause retrieval tool.|
|**Technology required**|Document layout + table extracton (OCR/vision), ontology-guided extractor, graph store,<br>code/standard corpus, Sonnet-class reasoning agent, evidence store.|
|**Dependencies**|Requirement and Standard enttes populated; submital connector to Octave InConcert Core /<br>Smart Completons.|
|**Future scope**|Auto-generated deviaton registers; predictve ‘likely-to-deviate’ scoring from historical vendor<br>performance.|



Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 14 



<!-- Start of picture text -->
Vendor Ingestion Project Spec-Compliance Evidence Engineer<br>Submittal & Extraction nowledge Grap Agent & Audit (HITL)<br>PDF submittal (rating, capacity, make)<br>OO<br>extract typed values > tags/attributes<br>Td<br>requirement + submitted value: pair<br>v<br>evaluate against<br>SPEC + code clause<br>write VIOLATES edge + deviation<br>——<br>record reasoning + source citations<br>aad<br>flag: deviation + recommended action<br>v<br>APPROVE/<br>REJECT/ RFI<br>decision written back (audited)<br>aa ana aaa a a a a a a a a a a a er er er ee<br><!-- End of picture text -->

Every flag is explainable by construction: requirement, submitted value, code clause, and source document travel together. 





Schedule risk is inferred from the graph — not typed in by a planner — and surfaced before it becomes unrecoverable. 



<!-- Start of picture text -->
Energisation<br>LONG-LEADHV TransformerITEM _ milestone<br>quoted 128 wk COMMISSIONING<br>L4/L5 IST slips<br>MV Switchgear aoaeans<br>install<br>Conflict detected<br>P6(docd assumessays 12890wk)wkwk Power-onGPU hallsto accelerationCost ofpremium<br>if found late<br>RECOMMENDED ACTION =} re-baseline P6 - open procurement gate now- evaluate alternate vendor / phased power<br><!-- End of picture text -->



E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

||Sonnet-class agent.|
|---|---|
|**Dependencies**|Purchase Order, Vendor, Shipment, Inspecton enttes; map tles / geocoding service.|
|**Future scope**|Predictve vendor-risk scoring; automated expeditng recommendatons; alternate-source<br>discovery.|



###### **5.4  Commissioning Agent** 

|**Dimension**|**Specifcaton**|
|---|---|
|**Purpose**|Drive commissioning readiness across levels L1–L5 by linking every test record and checklist to the<br>exact equipment and system it certfes, and computng turnover readiness.|
|**Problem solved**|L1–L5 readiness is tracked in disconnected spreadsheets with no live link to the systems being<br>certfed or to the specs and procurement that feed them, so commissioning gaps surface at the<br>worst moment.|
|**User journey**|A commissioning manager sees each system’s readiness as a roll-up of L1–L5 evidence, with<br>missing or failed records fagged and their upstream causes (a late equipment delivery, an open<br>deviaton) linked. Turnover packages assemble themselves from graph evidence.|
|**Business value (safety /**<br>**revenue / efciency / delivery)**|Delivery (clean, on-tme turnover), safety (no system certfed on incomplete evidence), efciency<br>(turnover-package assembly is automatc).|
|**Why judges will care**|Commissioning is the connectve tssue of the whole thread and a domain most teams will not<br>model credibly; doing it well signals deep domain understanding.|
|**Technical fow**|Ingest test records / checklists from Octave Smart Completons → resolve to Equipment/Tag and<br>System → roll up L1–L5 into Commissioning Package → compute readiness and gaps → link gaps to<br>upstream causes → recommend acton.|
|**Implementaton plan**|Phase 2. Model the fve levels and roll-up logic; integrate with Smart Completons; add gap-cause<br>linking.|
|**Technology required**|Smart Completons connector, graph roll-up queries, Sonnet-class agent, evidence/turnover-<br>package generator.|
|**Dependencies**|Test Record, Commissioning Package, System enttes; spec and procurement links from other<br>agents.|
|**Future scope**|Predictve commissioning-slippage alerts; auto-generated IST scenario coverage checks; operatons<br>handover to HxGN EAM.|



###### **5.5  Knowledge / Learning Agent** 

|**Dimension**|**Specifcaton**|
|---|---|
|**Purpose**|Preserve project context, decisions and resolved issues as durable graph memory, and make prior<br>experience queryable for the current project and the next one.|
|**Problem solved**|Hard-won lessons and ratonale evaporate between phases and projects; the same mistakes recur<br>across data halls and across programmes.|
|**User journey**|Any user asks a lifecycle queston in natural language (‘why did we deviate on the chillers on<br>Project A, and does it afect us here?’) and gets a sourced answer that spans projects, plus<br>proactve ‘this resembles a past issue’ alerts.|
|**Business value (safety /**<br>**revenue / efciency / delivery)**|Efciency and delivery (fewer repeated mistakes); revenue (faster, safer delivery of the next data<br>hall).|



Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 17 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

|**Why judges will care**|Lifecycle learning is the moat and the clearest ‘contnuously-learning operatng layer’ story; it is<br>what makes the product compound in value.|
|---|---|
|**Technical fow**|Capture Decision, Risk and resoluton enttes → community-summarise across projects → serve<br>cross-project GraphRAG queries → proactvely match current-project paterns to historical ones.|
|**Implementaton plan**|Phase 3. Requires the mult-project graph and cross-tenant controls to be in place.|
|**Technology required**|Community-summary layer, cross-project graph, retrieval + citaton pass, Opus-class synthesis for<br>hard queries.|
|**Dependencies**|A populated single-project graph; mult-project data model; tenant-isolaton and access controls.|
|**Future scope**|Portolio-level intelligence; automated ‘lessons-learned’ generaton; recommendaton of proven<br>design/vendor choices.|



###### **5.6  Platform features (cross-cutting)** 

- **Digital Thread Explorer.** Navigate any artefact to its connected neighbourhood in the graph — spec ↔ submittal ↔ PO ↔ shipment ↔ test record — the ‘no silo’ story made visible. Must-have. 

- **Evidence Viewer.** Every claim opens to its source page(s) and reasoning trace; the explainability guarantee made tangible. Must-have. 

- **Geospatial Ops Map.** Factories, shipments, site logistics and risk heatmaps on one map. Should-have. 

- **Command Console.** The ranked ‘what needs a decision today’ surface across all agents, per role. Musthave. 

- **Audit Log.** Immutable record of every recommendation, human decision and write-back. Must-have. 

###### **5.7  Feature Decision Matrix** 

Scored 1 (low) to 5 (high). ‘Keep?’ enforces discipline: weak ideas are cut, not carried. 

|**Feature**|**Innovaton**|**Build efort**|**Demo impact**|**Judge impact**|**Business**<br>**value**|**Keep?**|
|---|---|---|---|---|---|---|
|**Spec-Compliance Agent**|5|3|5|5|5|MUST|
|**Schedule-Risk Agent**|5|4|5|5|5|MUST|
|**Digital Thread Explorer**|4|2|5|5|4|MUST|
|**Evidence Viewer**|4|2|4|5|4|MUST|
|**Command Console**|3|2|4|4|4|MUST|
|**Supply-Chain Agent + Geo map**|4|4|5|5|4|SHOULD|
|**Commissioning Agent**|4|4|3|5|5|SHOULD|
|**Knowledge / Learning Agent**|5|5|3|4|5|FUTURE|
|**Generic chat over all docs**|1|2|2|1|2|CUT|
|**Auto-generated status reports**|1|2|2|1|3|CUT|



_Table 13.  Feature Decision Matrix. Two tempting-but-weak ideas are explicitly cut to protect focus._ 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 18 



<!-- Start of picture text -->
S EXPERIENCE<br>lo}<br>e Command console - Digital Thread explorer - Geospatial ops map : Evidence viewer - role dashboards<br>av<br>=<br>.DECISION & ACTION (Human-in-the-Loop gates)<br>i><br>aRecommendations : approval workflows - write-back to Octave / P6 - notifications : audit log<br>=)<br>< v<br>r.)<br>I AGENT ORCHESTRATION<br>=<br>Ww<br>¢ Tvashta Orchestrator ~ Spec-Compliance « Schedule-Risk - Supply-Chain - CommissioniNg - Knowledge worker agents<br>*v<br>= a<br>2 REASONING — HYBRID GraphRAG 8<br>s Ontology-guided extraction - graph traversal (local+global) - vector recall - community summarias - citation pass<br>fe) c<br>a v c<br>kK Lv<br>s KNOWLEDGE FABRIC 3<br>ci Typed Project Knowledge Graph (graph DB) - Vector index - Entity resolution - Object/blob store 2Cc<br>y8<br>a<br>5INGESTION & PERCEPTION<br>Ww<br>a<br>J Connectors (Octave/P6/mail) - OCR & document layout - drawing/P&ID vision - table & tag extraction - schema mapping<br><!-- End of picture text -->



<!-- Start of picture text -->
Query / > Route: Graph traversal Vector recall Rank & fuse > Grounded answer<br>agent goal vector - graph - hybr| e (local + global) > ommunity summa Bs evidence + citations<br><!-- End of picture text -->

Ontology-bound extraction + typed traversal removes the noise that makes naive RAG chatbots unreliable on engineering documents. 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

|**Mult-tenancy**|Per-project (and per-tenant) isolaton at the data layer; no cross-project retrieval without explicit,<br>access-controlled scope.|
|---|---|
|**Security**|SSO/OIDC, RBAC/ABAC, encrypton in transit and at rest, secrets management, full MCP tool-call ledger;<br>least-privilege connectors.|
|**Reliability of agents**|Orchestrator enforces tmeouts, retries, escalaton and rollback; workers are isolated; every acton is<br>idempotent and reversible where possible.|
|**Explainability**|No un-sourced claim ships; reasoning traces stored and viewable; deterministc evaluators used where<br>correctness is checkable (e.g. numeric spec limits).|
|**Cost control**|Tiered models (Opus-class orchestrator, Sonnet-class workers); community summaries reduce token<br>spend on global questons; caching of stable traversals.|



_Table 15.  Non-functional requirements and how the architecture meets them._ 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 21 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **07   Knowledge Graph Design** 

The Project Knowledge Graph (PKG) is the heart of Tvashta. It is deliberately typed and governed: a predefined data-centre EPC ontology anchors extraction so the graph is precise and traversable rather than a noisy cloud of LLM-generated triples. This is the single most important technical decision in the product. 



_Figure 7.  The data-centre EPC ontology (core entities and typed relationships). Extraction is bound to this schema._ 

###### **7.1  Core entities** 

|**Entty**|**Represents**|**Key atributes**|
|---|---|---|
|**Project / System / Subsystem**|Facility breakdown structure.|id, name, ter target, phase|
|**Equipment / Tag**|A tagged asset (transformer, switchgear, CDU…).|tag, type, ratng, make, status|
|**Specifcaton / Requirement**|A spec and its individual requirements.|clause ref, parameter, limit, unit|
|**Standard / Code Clause**|Governing code/standard provisions.|standard, clause, text ref|
|**Submital / RFI / Change Order**|Vendor submissions and changes.|rev, submited values, status|
|**Purchase Order / Vendor / Shipment**|Procurement and logistcs.|po no., lead tme, ETA, locaton|
|**Schedule Actvity (P6)**|A schedule task.|id, planned/actual dates, foat|
|**Inspecton / Test Record (L1–L5)**|Commissioning evidence.|level, result, date, doc ref|
|**Commissioning Package**|Roll-up certfying a system.|system, readiness, gaps|
|**Drawing / BIM Object**|Design artefacts.|sheet, object id, discipline|
|**Risk / Decision**|Inferred risks and the decisions taken.|severity, cause, ratonale, owner|
|**Document / Person / Org**|Provenance and actors.|uri, page, role|



_Table 16.  Core PKG entities. Every fact ultimately links to a Document for provenance._ 

###### **7.2  Key relationships** 

|**Relatonship**<br>**Meaning**<br>**Powers**|
|---|



Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 22 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

|**Requirement —GOVERNED_BY→ Standard**|A requirement derives from a code clause.|Compliance reasoning|
|---|---|---|
|**Submital —SATISFIES / VIOLATES→**<br>**Requirement**|Conformance verdict with deviaton.|Spec-Compliance Agent|
|**Equipment —ALLOCATED_TO→ Actvity**|An asset is ted to schedule work.|Schedule reasoning|
|**Actvity —DEPENDS_ON / BLOCKS→ Actvity**|Schedule logic.|Risk cascade|
|**PO —PROCURES→ Equipment; Vendor —**<br>**FULFILS→ PO**|Procurement chain.|Supply-Chain Agent|
|**Shipment —VERIFIED_BY→ Inspecton**|Logistcs to QA link.|Delivery assurance|
|**Test Record —EVIDENCES→ Equipment;**<br>**Package —ROLLS_UP→ Test Record**|Commissioning evidence chain.|Commissioning Agent|
|**Change Order —IMPACTS→ Requirement**|Change propagaton.|Impact analysis|
|**Risk —THREATENS→ Actvity; Decision —**<br>**MITIGATES→ Risk**|Risk lifecycle.|Learning & audit|



_Table 17.  The typed relationships that make multi-hop reasoning possible._ 

###### **7.3  Reasoning by example (Cypher-style)** 

Because the graph is typed, the questions that break naïve RAG become simple traversals. Illustrative queries (engine-agnostic pseudo-Cypher): 

```
// 1. Un-commissioned systems that depend on a late-delivering vendor
MATCH (v:Vendor)-[:FULFILS]->(:PurchaseOrder)-[:PROCURES]->(e:Equipment)
      -[:ALLOCATED_TO]->(a:Activity)<-[:ROLLS_UP*]-(cp:CommissioningPackage)
WHERE v.delivery_risk = 'HIGH' AND cp.readiness < 1.0
RETURN cp.system, v.name, e.tag ORDER BY cp.readiness ASC;
```

```
// 2. Submittals that violate a governing code clause
MATCH (s:Submittal)-[r:VIOLATES]->(req:Requirement)-[:GOVERNED_BY]->(c:Standard)
RETURN s.tag, req.parameter, s.submitted_value, req.limit, c.clause, r.deviation;
```

```
// 3. Schedule cascade from a lead-time conflict
MATCH (e:Equipment)-[:ALLOCATED_TO]->(a:Activity)-[:DEPENDS_ON*1..5]->(d:Activity)
WHERE e.quoted_lead_wk > a.assumed_lead_wk
RETURN e.tag, a.id, collect(d.id) AS downstream_at_risk;
```

_Illustrative traversals. The typed ontology is what makes these one-line questions instead of brittle prompt engineering._ 

###### **7.4  Entity resolution** 

The same tag, vendor or document appears in many forms across a project (‘TX-01’, ‘Transformer 01’, ‘Main Transformer’). Entity resolution is a first-class subsystem: deterministic keys where they exist (tag numbers, PO numbers), blocking + similarity for the rest, an LLM adjudication step for hard cases, and a human review queue for low-confidence merges. Poor resolution fragments the graph and silently breaks every downstream traversal, so confidence scores and provenance are stored on every merge and are reversible. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 23 



<!-- Start of picture text -->
iN<br>meee ee NO Oe<br>Tvashta ORCHESTRATOR<br>(plans :decomposes: routes « synthesises)<br>Opus-class model<br>delegate delegate delegate delegate delegate ecommended actions<br>Schedule-Risk Spec-Compliance Supply-Chain Commissioning Knowledge / HUMAN-IN-THE-LOOP GATE<br>agen Agen: agen een: SENT) I approve - reject: escalate > audited write-back<br>Sonnet-class Sonnet-class Sonnet-class Sonnet-class Sonnet-class<br>ae Te ae a t ia<br>meek ~ +2 ~ a wee ~sS SL Ny N / / oT = “on approval<br>Shared state - ProjectA  Knowledge Graph - Evidence7 store Octave (SDx / Smart Materials / SmartMCP Completions) TOOL GATEWAY- P6 - vector+graph search - mail - web<br><!-- End of picture text -->



E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

|**Commissioning**|Compute L1–L5 readiness &<br>turnover.|Test records; checklists;<br>system model|Readiness; gaps + causes;<br>turnover packages|Smart Completons read;<br>roll-up queries; doc gen|
|---|---|---|---|---|
|**Knowledge / Learning**|Preserve & serve cross-project|Decisions; risks;<br>|Sourced lifecycle answers;<br>|Community summaries;|
||memory.|resolutons|patern alerts|cross-project GraphRAG|



_Table 18.  The agent register. Memory is shared through the graph and evidence store; agents do not hold hidden private state._ 

###### **8.3  Memory, communication and control** 

- **Shared memory = the graph + evidence store.** Agents read and write the PKG; there is no hidden interagent message bus. This keeps state inspectable and auditable. 

- **Communication is hierarchical.** Workers receive a self-contained task and return a structured, cited result to the orchestrator; they never call each other. 

- **Control is explicit.** The orchestrator enforces timeouts, retries, escalation and rollback, and never lets an action-bearing result bypass the human gate. 

- **Tools are gated.** All external reads/writes go through the MCP tool gateway with least-privilege scopes and a full call ledger. 

###### **D E C I S I O N ·   Human-in-the-loop is a feature, not a limitation** 

Recommendations are automatic; consequential actions are approved. This is what makes an EPC director, a government agency and an enterprise CTO willing to deploy the layer — and it is auditable end-to-end. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 25 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **09   Technology Stack** 

The stack is chosen for implementation readiness and defensibility: mature, well-understood components a Fortune-500 engineering organisation could actually operate, with clear reasons for each selection. Every choice below is a default, not a dogma — the architecture is deliberately store-agnostic at its boundaries. 

|**Layer**|**Selecton (default)**|**Why this choice**|
|---|---|---|
|**Frontend**|React + Next.js, TypeScript; Tailwind + a dark<br>enterprise design system|Fast to build, industrial-grade UI, strong component<br>ecosystem; SSR for heavy dashboards.|
|**Geospatal**|deck.gl / MapLibre with vector tles|GPU-accelerated layers for factories, shipments, risk<br>heatmaps at scale.|
|**API / backend**|Python + FastAPI; async workers via a queue<br>(e.g. Celery/Arq)|Python is the AI ecosystem’s lingua franca; FastAPI<br>gives typed, high-throughput APIs.|
|**Agent orchestraton**|LangGraph (orchestrator-worker), Anthropic<br>Agent SDK paterns|First-class support for supervisor topologies, typed<br>shared state, retries and streaming.|
|**LLMs**|Claude (Opus-class orchestrator, Sonnet-<br>class workers) via API + MCP|Strong reasoning + tool use; MCP standardises secure<br>access to Octave/P6/tools.|
|**Knowledge graph**|Neo4j (or a property-graph store)|Mature Cypher traversals, tooling and ecosystem for<br>typed mult-hop reasoning.|
|**Vector index**|pgvector or Qdrant|Simple, scalable semantc recall; pgvector co-locates<br>with relatonal metadata.|
|**OCR / document AI**|Layout-aware OCR + table extracton (e.g. a<br>document-AI service)|Engineering PDFs are tables and drawings; layout<br>fdelity is essental.|
|**Drawing / P&ID vision**|Vision model + symbol/tag detecton|Extract tags and symbols from drawings into typed<br>enttes.|
|**Object storage**|S3-compatble|Cheap, durable storage for source artefacts and<br>generated packages.|
|**Auth / identty**|OIDC / SSO (e.g. Keycloak), RBAC/ABAC|Enterprise identty, least-privilege, per-project scoping.|
|**Infra / deploy**|Containers on Kubernetes; IaC (Terraform)|Portable across cloud and on-prem/gov clouds;<br>reproducible.|
|**Observability / eval**|OpenTelemetry + an LLM-tracing tool (e.g.<br>LangSmith)|Trace agent runs, measure quality and cost, debug<br>coordinaton.|



_Table 19.  Default technology stack with rationale. Boundaries (graph store, vector store, LLM provider) are pluggable._ 

###### **P R I N C I P L E ·   Deployable where the data must live** 

Government and mission-critical customers often require on-prem or sovereign-cloud deployment. The container + IaC + MCP design lets Tvashta run next to Octave in the customer’s environment, which is essential for CPWD/NIC/MeitY-class adopters and for enterprise data-residency requirements. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 26 



<!-- Start of picture text -->
Indicative months (M) — sequencing, not fixed dates<br>Phase 0<br>OntologyV leaingestion onan vector fabric - security<br>Phase 1 — MVP (dema<br>Spec-Compliance+ Schedule-Bisk agonic donee Viewer hood explorer<br>Phase 2 — Delivery suite<br>Supply-Chain + Commissioning age mb ospotial one Dacia wit<br>Phase 3 — Enterprise scale<br>mo u2 m4 M6 us M10 M12 Knqwiedge/learning agent - Peti- project -cross-tenant ; certificatians<br><!-- End of picture text -->







E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

|**S3**|Graph + vector fabric + hybrid retrieval|Cited answers to typed questons.|
|---|---|---|
|**S4**|Spec-Compliance Agent + Evidence Viewer|First explainable deviaton catch.|
|**S5**|Schedule-Risk Agent + Thread Explorer|First hidden-confict catch + cascade.|
|**S6**|Command Console + demo hardening|End-to-end demo runs reliably.|



_Table 21.  Illustrative two-week sprints to a demonstrable MVP._ 

###### **10.3  Risk register** 

|**Risk**|**Likelihood**|**Impact**|**Mitgaton**|
|---|---|---|---|
|**Entty resoluton fragments the graph**|Med|High|Deterministc keys frst; confdence scores; human<br>review queue; reversible merges.|
|**Extracton noise from messy**<br>**PDFs/drawings**|High|Med|Ontology-bound extracton; layout-aware OCR;<br>validaton against typed schema.|
|**Agent coordinaton failures / loops**|Med|High|Orchestrator-worker isolaton; tmeouts, retries,<br>escalaton, rollback.|
|**LLM cost/latency on large corpora**|Med|Med|Tiered models; community summaries; caching;<br>async heavy runs.|
|**Hallucinated or un-sourced claims**|Med|High|Citaton-pass gatng; deterministc evaluators for<br>checkable facts; no un-sourced output.|
|**Scope creep into a feature grab-bag**|Med|Med|Feature Decision Matrix; explicit non-goals; cut weak<br>ideas.|
|**Integraton fricton with Octave/P6**|Med|Med|MCP tool gateway; start read-only; write-back only<br>behind human gate.|



_Table 22.  Top delivery risks and their mitigations._ 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 28 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **11 Implementation Guide** 

This section is written so a team can start building on Monday: repository shape, service boundaries, API surface, data and graph design, prompt discipline, evaluation, testing, deployment, security and performance. 

###### **11.1  Repository structure (monorepo)** 

```
Tvashta/
├─ apps/
│  ├─ web/                 # Next.js frontend (console, explorer, evidence, geo)
│  └─ api/                 # FastAPI gateway (auth, orchestration entrypoints)
├─ services/
│  ├─ ingestion/           # connectors, OCR, vision, table/tag extraction
│  ├─ resolution/          # entity resolution + provenance
│  ├─ graph/               # PKG schema, migrations, Cypher library
│  ├─ retrieval/           # hybrid GraphRAG (graph + vector + summaries)
│  ├─ agents/              # orchestrator + 5 worker agents (LangGraph)
│  ├─ actions/             # recommendation, HITL workflow, write-back
│  └─ evidence/            # citation + reasoning-trace + audit ledger
├─ packages/
│  ├─ ontology/            # governed EPC ontology (source of truth)
│  ├─ prompts/             # versioned prompt library + eval fixtures
│  └─ shared/              # types, clients, MCP tool defs
├─ infra/                  # Terraform, k8s manifests, CI/CD
└─ evals/                  # golden sets, metrics, regression harness
```

_Monorepo layout. The ontology is a first-class package because it governs everything downstream._ 

###### **11.2  API surface (illustrative)** 

|**Method & path**|**Purpose**|
|---|---|
|**POST /ingest**|Register/ingest an artefact; returns extracton + resoluton job id.|
|**GET /graph/entty/{id}**|Fetch an entty and its connected neighbourhood (Thread Explorer).|
|**POST /query**|Hybrid retrieval query; returns cited answer + evidence refs.|
|**POST /agents/run**|Invoke the orchestrator with a goal; streams progress + result.|
|**GET /compliance/deviatons**|List open spec deviatons with citatons.|
|**GET /schedule/risks**|Ranked schedule risks with cascade and recommended actons.|
|**GET /supply/critcal-items**|Critcal-item board + geospatal payload.|
|**GET /commissioning/readiness**|System readiness roll-up + gaps.|
|**POST /actons/{id}/approve**|Human-approval gate; triggers audited write-back.|
|**GET /audit**|Immutable log of recommendatons, decisions and write-backs.|



_Table 23.  Representative API endpoints. Actions are always two-step: recommend, then approve._ 

###### **11.3  Prompt & evaluation discipline** 

- **Versioned, tested prompts.** Prompts live in a package with fixtures; changes run against golden sets before merge. 

- **Structured outputs.** Agents return typed JSON (verdict, evidence refs, recommended action), never free prose for machine-consumed steps. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 29 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

- **Deterministic where checkable.** Numeric spec limits, date math and roll-ups use deterministic evaluators; the LLM explains, it does not arithmetic-guess. 

- **Evaluate what matters.** Track the metrics below on a fixed golden set every build. 

|**Metric**|**What it measures**|**Target directon**|
|---|---|---|
|**Deviaton precision / recall**|Correctly caught spec deviatons vs misses/false alarms.|High precision frst, then recall|
|**Citaton faithfulness**|Share of claims whose citaton actually supports them.|→ 100%|
|**Risk lead tme**|How early a risk is surfaced before it would bite.|Maximise|
|**Entty-resoluton F1**|Merge correctness.|Maximise; monitor drif|
|**Retrieval groundedness**|Answers supported by retrieved evidence.|Maximise|
|**Cost / latency per run**|Token and tme budget per agent run.|Within SLO|



_Table 24.  Evaluation metrics tracked on a fixed golden set to prevent regressions._ 

###### **11.4  Testing, deployment, security, performance** 

- **Testing.** Unit tests per service; contract tests on connectors; agent eval harness on golden sets; end-toend demo-path smoke test in CI. 

- **Deployment.** Containers on Kubernetes via IaC; blue/green for the API; migrations gated; perenvironment secrets. 

- **Security.** SSO/OIDC, RBAC/ABAC, per-project isolation, encryption in transit and at rest, least-privilege MCP scopes, full tool-call ledger; start connectors read-only. 

- **Performance.** Pre-compute community summaries; cache stable traversals; stream long agent runs; keep the hot interactive path under a few seconds p95. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 30 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **12   Demo Strategy** 

The demo has one job: make the judges feel that Tvashta is the intelligence layer they described — not a chatbot. It does that by showing the layer catch two real, expensive problems live, with evidence and a recommended action, in the language of a data-centre programme. 

###### **12.1  The story arc** 

A data hall is mid-build. On the surface everything looks green. In five minutes, Tvashta reveals two problems that a human review would likely have missed until they became irrecoverable — a silent spec deviation and a hidden lead-time conflict — and shows exactly what to do about each. The emotional beat: relief, then ‘we need this’. 

###### **12.2  Minute-by-minute** 

|**Time**|**On screen**|**What the judge should feel**|
|---|---|---|
|**0:00–0:30**|Command Console: today’s ranked decisions across the project.|This is an operatng layer, not a chat<br>box.|
|**0:30–1:30**|Spec-Compliance: a switchgear submital fagged VIOLATES a code clause; Evidence<br>Viewer shows requirement, submited value, clause and source page together.|It reasons — and it proves it.<br>Explainable by constructon.|
|**1:30–2:45**|Schedule-Risk: two documents disagree on transformer lead tme; Tvashta<br>shows the confict, the cascade into L4/L5 commissioning, and the cost of fnding it<br>late.|This is predictve intelligence<br>catching a critcal-path killer.|
|**2:45–3:30**|Recommended acton + human gate: re-baseline, open procurement gate now,<br>evaluate alternate vendor — approved in one click, writen back and audited.|It recommends and acts — with<br>control and a full audit trail.|
|**3:30–4:15**|Thread Explorer + Geospatal: navigate spec ↔ submital ↔ PO ↔ shipment on a<br>map of factories and in-transit units.|No silos. The whole thread is<br>connected and visual.|
|**4:15–5:00**|Positoning slide: Tvashta on top of Octave, across<br>Design→Build→Operate→Protect.|This is the next module Octave<br>would build.|



_Table 25.  Five-minute demo storyboard. Two live catches carry the entire thesis._ 

###### **12.3  Failure recovery** 

- **Pre-seeded, deterministic demo project.** The two catches run against fixed data so they are reproducible; live ingestion is shown separately, not on the critical demo path. 

- **Recorded fallback.** A screen recording of the exact flow is ready if connectivity or a model call fails. 

- **Graceful degradation.** If an agent call is slow, the UI streams progress rather than blocking; the narrator keeps the story moving. 

###### **12.4  Questions the judges will ask — and the answers** 

|**Likely queston**|**Answer**|
|---|---|
|**How is this diferent from RAG / a chatbot?**|We reason over a typed knowledge graph with specialist agents and return actons<br>with citatons; naïve RAG can’t answer relatonal, mult-hop questons or prove its<br>claims.|
|**Does it hallucinate?**|No un-sourced claim ships; checkable facts use deterministc evaluators; every output<br>opens to its source and reasoning trace.|



Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 31 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

|**Why won’t Octave just build this?**|This is designed to be exactly what Octave builds next — it complements their stack;<br>the moat is the governed EPC ontology + accumulated lifecycle memory.|
|---|---|
|**Is it realistc to build?**|Every component is mature (Neo4j, pgvector, LangGraph, layout OCR, Claude via<br>MCP); the roadmap sequences a demonstrable MVP in six sprints.|
|**What about data security / gov**<br>**deployment?**|Container + IaC + MCP allows on-prem/sovereign deployment beside Octave, with<br>SSO, RBAC/ABAC and per-project isolaton.|
|**Where’s the ROI?**|Long-lead conficts and interface gaps drive the ~18% overruns and mult-week<br>commissioning slips we prevent; even one caught cascade pays for the layer.|



_Table 26.  Anticipated Q&A. Each answer reinforces a design principle._ 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 32 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **13   Business Strategy** 

###### **13.1  Who buys, and why** 

|**Buyer**|**Primary pain**|**Value they buy**|
|---|---|---|
|**EPC / EPCM contractors (data centre)**|Overruns, rework, commissioning slip.|Protected margin and on-tme delivery.|
|**Hyperscale / colo owners &**<br>**developers**|Missed energisaton, stranded capital.|Earlier, de-risked revenue.|
|**Owner’s engineers / commissioning**<br>**agents**|Fragmented L1–L5 evidence.|Clean, provable turnover.|
|**Government / public infrastructure**<br>**(CPWD/NIC/MeitY-class)**|Trust, auditability, sovereignty.|Explainable, on-prem, compliant delivery<br>intelligence.|



_Table 27.  Target customers. All share the same DNA — mission-critical delivery under supply-chain pressure._ 

###### **13.2  Pricing model** 

- **Platform + per-project.** An enterprise platform fee plus a per-active-project subscription; scales with the portfolio being delivered. 

- **Value-anchored.** Priced as a fraction of the overrun/acceleration cost it prevents on a single programme — a clear, defensible ROI conversation, not a per-seat SaaS haggle. 

- **Land via a challenge, expand via the lifecycle.** Enter on Spec-Compliance + Schedule-Risk; expand across Commissioning, Supply-Chain and Knowledge as trust builds. 

###### **13.3  Competitive positioning — why the incumbents don’t solve this** 

|**Category / player**|**What it is**|**Why it doesn’t win this problem**|
|---|---|---|
|**Autodesk / BIM**|Design & document system.|Models geometry, not reasoning across the delivery thread.|
|**Primavera P6**|Scheduling.|Holds the tmeline but has no intelligence about the<br>assumptons behind it.|
|**Aconex / doc control**|Document storage & transmitals.|Stores documents; does not understand or connect them.|
|**Procore**|Constructon workfow.|Manages process, not predictve cross-silo reasoning.|
|**Legal / general AI (e.g. Harvey)**|Domain AI for law.|Wrong domain; no EPC ontology or commissioning logic.|
|**Palantr**|General data/ontology platorm.|Powerful but generic; not a data-centre-EPC product out of<br>the box.|
|**Octave (partner)**|Asset-lifecycle systems of record +<br>domain AI.|Owns the data and thread; Tvashta is the<br>reasoning/acton layer on top — complementary, not<br>compettve.|



_Table 28.  Positioning by failure mode. We define ourselves by the gap each incumbent leaves, not by feature parity._ 

###### **13.4  The moat** 

- **The governed EPC ontology.** A precise, hard-won schema for data-centre delivery that makes reasoning reliable — expensive to replicate, compounding with use. 

- **Lifecycle memory.** Every resolved deviation and realised risk becomes graph memory; the product gets safer and smarter per project — a data network effect. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 33 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

- **Octave adjacency.** Built to sit on the partner’s Digital Thread, it is the natural, defensible extension of an ecosystem rather than a standalone tool to be ripped out. 

- **Explainability & auditability.** The properties that make it deployable in government and enterprise are also the properties that make it trusted and sticky. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 34 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **14 UI / UX Specification** 

The experience must feel like a mission-critical operating layer — closer to Palantir or a Bloomberg terminal than to a consumer app. Dense where density earns its place, calm everywhere else, and always one click from the evidence. 

###### **14.1  Design language** 

|**Dimension**|**Directon**|
|---|---|
|**Aesthetc**|Industrial, precise, dark-frst; restrained colour used only to signal state (risk, deviaton, ready).|
|**Typography**|One clean sans for UI (e.g. Inter/IBM Plex Sans); tabular numerals for data; monospace for tags/values.|
|**Colour**|Deep navy base; teal for the intelligence/actve state; amber/red for risk & deviaton; green for<br>ready/approved.|
|**Moton**|Purposeful only — reveal reasoning, animate a cascade, transiton a state; never decoratve.|
|**Density**|Progressive disclosure: a calm ranked surface up top, full evidence one interacton away.|
|**Explainability**|Every number and fag is a link to its source and reasoning — the ‘why’ is never more than a click away.|



_Table 29.  Design language. The UI is the physical embodiment of ‘explainable by construction’._ 

###### **14.2  Screen inventory** 

|**Screen**|**Primary user**|**Purpose & key elements**|
|---|---|---|
|**Command Console**|Project director / lead|Ranked ‘decisions needed today’ across all agents; state at a glance.|
|**Spec-Compliance Board**|Discipline engineer|Deviaton queue; side-by-side requirement / submital / clause / source;<br>approve·reject·RFI.|
|**Schedule-Risk Board**|Project controls|Ranked risks; confict evidence; cascade view; recommended actons.|
|**Supply-Chain + Geo Map**|Procurement manager|Critcal-item board; factory/shipment map; vendor-risk overlay.|
|**Commissioning Readiness**|Commissioning manager|System roll-up of L1–L5; gaps and upstream causes; turnover packages.|
|**Digital Thread Explorer**|Any user|Graph navigaton of any artefact’s connected neighbourhood.|
|**Evidence Viewer**|Any user|Source pages + reasoning trace behind any claim.|
|**Audit Log**|PM / compliance / gov|Immutable recommendatons, decisions and write-backs.|



_Table 30.  Screen inventory mapped to personas. Each screen has a single, clear primary job._ 

###### **14.3  Persona → primary journey** 

- **Project Director.** Opens the Command Console → sees the two decisions that matter today → drills into evidence → approves the recommended actions. 

- **Discipline Engineer.** Works the deviation queue → each flag pre-loaded with clause and source → dispositions in one click. 

- **Project Controls.** Reviews ranked schedule risks → inspects the conflicting assumptions → accepts a rebaseline recommendation. 

- **Commissioning Manager.** Tracks system readiness → sees a gap traced to a late delivery → coordinates the fix before it hits IST. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 35 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **15 References — Official & Primary Sources** 

Sources consulted and relied upon, grouped by domain. Time-sensitive figures in the body are dated to 2025– 2026. 

###### **Industry partner — Octave / Hexagon** 

Octave — corporate site, About and product pages (InConcert Core / HxGN SDx, Smart Materials, Smart Completions, iConstruct, HxGN EAM, PAS): octave.com; hexagon.com/company/divisions/asset-lifecycle-intelligence. 

Octave brand launch and Design→Build→Operate→Protect positioning; Hexagon spin-off announcements (2025–2026): octave.com/newsroom; hexagon.com newsroom. 

###### **Data-centre commissioning & reliability standards** 

ASHRAE Guideline 0 — The Commissioning Process; ASHRAE Guideline 1.6 — data-centre commissioning. 

Uptime Institute — Tier Standard (Topology & Operational Sustainability). 

TIA-942 — Telecommunications Infrastructure Standard for Data Centers; ISO/IEC 22237 series. 

Industry references on the five commissioning levels (FAT / installation verification / pre-functional / functional performance / integrated systems testing): cxplanner.com; ipsdb.com; constructandcommission.com. 

###### **Data-centre delivery, supply chain & schedule risk (2025–2026)** 

Long-lead equipment lead times (power transformers 80–128+ wk; MV switchgear 44–80 wk; CDUs 26–52 wk): Wood Mackenzie survey (Q2 2025) as reported by Archdesk, CPM Pros, The Network Installers. 

Data-centre transformer procurement as a development constraint; conflicting-lead-time detection and ‘trigger decisions, not just status’: build.inc/insights (2026). 

Schedule-risk and interface-management cost impact (~18%); ~9 in 10 large infrastructure projects overrun: iRecruit.co insights; industry cost indices (Turner & Townsend; JLL 2026). 

AI data-centre EPCM at scale (e.g. Jacobs / Hut 8 River Bend, 2026): PR Newswire. 

###### **AI architecture — GraphRAG & multi-agent systems** 

Microsoft Research — “From Local to Global: A GraphRAG Approach to Query-Focused Summarization” (Edge et al., 2024); Microsoft GraphRAG open-source project. 

Industrial knowledge-graph retrieval with predefined ontologies vs free-form triples (arXiv, 2026). 

Anthropic — multi-agent research system (orchestrator-worker; ~90% uplift on breadth-heavy tasks; ~15× tokens); Anthropic Agent SDK and building-effective-agents guidance. 

LangGraph / LangChain — orchestrator-worker workflow documentation and production patterns. 

###### **Government & policy context (India)** 

CPWD, NIC and MeitY — public-infrastructure and digital-infrastructure guidance for on-prem / sovereign deployment and auditability requirements. 

###### **Contracts & delivery frameworks** 

FIDIC forms of contract (EPC/turnkey); standard EPC contract and construction-arbitration practice for change and claims context. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 36 

E X E C U T I O N I N T E L L I G E N C E F O R D A T A C E N T R E E P C 

### **A   Appendix** 

###### **A.  Glossary** 

|**Term**|**Meaning**|
|---|---|
|**PKG**|Project Knowledge Graph — the typed, governed graph at the heart of Tvashta.|
|**Digital Thread**|The connected fow of data across the asset lifecycle (Octave’s core concept).|
|**GraphRAG**|Retrieval-augmented generaton over a knowledge graph (graph + vector + community summaries).|
|**Ontology**|The governed schema of enttes and relatonships that binds extracton.|
|**Orchestrator-worker**|Mult-agent topology: a supervisor delegates to isolated specialist workers.|
|**HITL**|Human-in-the-loop — the approval gate on any consequental acton.|
|**L1–L5**|The fve commissioning levels, FAT through integrated systems testng (IST).|
|**AHJ**|Authority Having Jurisdicton — approves certain submitals before manufacture/commissioning.|
|**MCP**|Model Context Protocol — the gateway through which agents reach tools and data.|



_Table 31.  Glossary of key terms._ 

###### **B.  Reusability across the partner’s eight challenges** 

The judges noted that the challenge domains share DNA — multi-agent, knowledge graph, geospatial, predictive, RAG, enterprise. Tvashta’s core (ingestion → typed graph → hybrid retrieval → orchestrated agents → cited action) is domain-agnostic; adapting to Industrial Safety, Supply Chain, EV or another domain is a matter of swapping the ontology and the specialist agents, not rebuilding the platform. This reusable core is a strategic asset: it means the same investment generalises across the partner’s portfolio. 

###### **C.  Open items & assumptions** 

- **Upstream research files.** The referenced CLAUDE/GPT/GEMINI/PERPLEXITY/DEEPSEEK research and the official problem-statement PDF were not in the working set; the domain was re-derived from primary sources. If those files are provided, Section 3 can be reconciled against them and any additional required capabilities folded in. 

- **Octave interface specifics.** Exact API/connector surfaces for InConcert Core, Smart Materials and Smart Completions should be confirmed with the partner; the MCP-gateway design isolates the product from that detail. 

- **Deployment target.** Confirm whether the demo/judging environment is cloud or on-prem; the stack supports both. 

- **Ontology scope for the MVP.** Start narrow (electrical + mechanical equipment, specs, schedule, commissioning) and widen; the ontology package is versioned to make this safe. 

###### **P R I N C I P L E ·   Closing note** 

If this document has done its job, every subsequent decision — an architecture choice, a UI screen, a PPT slide, a line of code — can be traced back to a principle, a piece of evidence, or a defended feature specified here. That is what makes it the single source of truth. 

Tvashta  ·  Master Delivery-Intelligence Blueprint  ·  Confidential — Team  ·  Page 37 


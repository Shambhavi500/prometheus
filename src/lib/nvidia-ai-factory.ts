/**
 * NVIDIA AI Factory — Canonical Reference Data Module
 *
 * Single source of truth for all NVIDIA GB300 NVL72 AI Factory infrastructure
 * data consumed by the Prometheus EPC Intelligence Platform.
 *
 * Based on: NVIDIA Enterprise Reference Architecture — GB300 NVL72 AI Factory
 * (https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/)
 *
 * ET AI Hackathon 2026 — Problem Statement 4
 */

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT IDENTITY
// ─────────────────────────────────────────────────────────────────────────────

export const PROJECT = {
  id: 'PRJ-NVL72-AIFC',
  tag: 'NVL72-AIFC-001',
  name: 'NVIDIA AI Factory — Pune Cluster (NVL72-AIFC-001)',
  shortName: 'AI Factory NVL72-AIFC-001',
  type: 'NVIDIA AI Factory (576 GPU / 8 SU)',
  location: 'Pune, Maharashtra, India',
  city: 'Pune',
  country: 'India',
  lat: 18.52,
  lon: 73.85,
  phase: 'Construction & Commissioning',
  status: 'Execution',
  tenant: {
    id: 'ORG-NVIDIA-AIFC',
    name: 'NVIDIA AI Factory EPC',
    tag: 'NVIDIA-AIFC',
  },
  priorProject: {
    id: 'PRJ-NVL72-PILOT',
    tag: 'NVL72-PILOT',
    name: 'NVIDIA AI Factory — Hyderabad Pilot (NVL72-PILOT)',
    tag_short: 'HYD-PILOT',
    year: '2025',
  },
  /** ET AI Hackathon 2026 — Problem Statement 4 */
  hacakthonRef: 'ET-AI-HACKATHON-2026-PS4',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CLUSTER TOPOLOGY (from NVIDIA RA)
// ─────────────────────────────────────────────────────────────────────────────

export const CLUSTER = {
  scalableUnits: 8,                // SUs (racks)
  gpusPerSU: 72,                   // Blackwell Ultra GPUs per NVL72 rack
  gpusTotal: 576,                  // 8 × 72
  traysPerSU: 18,                  // GB300 NVL Compute Trays per SU
  traysTotal: 144,                 // 8 × 18
  gpusPerTray: 4,                  // B300 GPUs per tray
  cpusPerTray: 2,                  // Grace CPUs per tray
  nvSwitchTraysPerSU: 9,           // NVLink Switch Trays per rack
  nvLinkGeneration: 5,             // Fifth-generation NVLink
  nvLinkBandwidthPerGpu: 1800,     // GB/s bi-directional per GPU
  nvLinkDomainBandwidth: 900,      // GB/s per SU domain (uni-directional)
  rackPowerKw: 142,                // kW per NVL72 rack (full load)
  rackPsuShelves: 8,               // Power shelves per rack
  rackPsuPerShelf: 6,              // PSUs per shelf
  rackPsuRatingKw: 5.5,            // kW per PSU
  hbmPerGpu: 288,                  // GB HBM3e per B300 GPU
  hbmPerSu: 1152,                  // GB aggregated HBM3e per NVL72 SU
  managementNodes: 12,             // Total management/control nodes
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// EQUIPMENT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const EQUIPMENT = {
  GB300_NVL72_RACK: {
    tag: 'NVL72-RACK',
    name: 'NVIDIA GB300 NVL72 Rack (Scalable Unit)',
    description: 'Rack-scale AI compute unit with 72 Blackwell Ultra GPUs, 36 Grace CPUs, liquid cooling, and 9 NVLink Switch Trays',
    vendor: 'NVIDIA OEM Partner',
    powerKw: 142,
    gpuCount: 72,
    cpuCount: 36,
    nvSwitchTrays: 9,
    computeTrays: 18,
    nvLinkBandwidthGbps: 900 * 8, // 900 GB/s uni per domain
    coolingType: 'Direct Liquid Cooling (DLC)',
  },
  GB300_COMPUTE_TRAY: {
    tag: 'GB300-TRAY',
    name: 'GB300 NVL Compute Tray',
    description: 'Single compute node with 4× B300 Blackwell Ultra GPUs, 2× Grace CPUs, 4× ConnectX-8 SuperNICs, 1× BlueField-3 DPU',
    gpuCount: 4,
    cpuCount: 2,
    nicCount: 4,
    dpuCount: 1,
    nvmeSsdCount: 5, // 1 OS M.2 + 4 E1.S cache
    connectX8BandwidthGbps: 800, // per SuperNIC
  },
  NVLINK_SWITCH_TRAY: {
    tag: 'NVSWITCH-TRAY',
    name: 'NVIDIA NVLink 5th-Gen Switch Tray',
    description: 'Contains 2× NVSwitch ASICs; 18 links per GPU via copper backplane; enables full non-blocking L1 domain of 72 GPUs',
    nvSwitchAsics: 2,
    nvLinkPortsPerGpu: 18,
    aggregateBandwidthTbps: 130, // TB/s per NVL72 rack
  },
  CONNECTX8_MZB: {
    tag: 'CX8-MZB',
    name: 'NVIDIA Mezzanine Network Board with ConnectX-8',
    description: 'Two ConnectX-8 SuperNIC ASICs on each board; 2 boards per compute tray for GPU East/West Ethernet compute fabric',
    nicsPerBoard: 2,
    bandwidthPerNicGbps: 800,
    totalBandwidthPerTrayGbps: 3200, // 4× 800G
    protocol: 'RDMA/RoCE, Spectrum-X 800G Ethernet',
    features: ['RoCE acceleration', 'GPUDirect', 'GPUDirect Storage', 'IPSec/MACSec', 'VXLAN/NVGRE offload'],
  },
  BLUEFIELD3_DPU: {
    tag: 'BF3-DPU',
    name: 'NVIDIA BlueField-3 B3240 DPU',
    description: 'Dual-port 400G DPU per compute tray for North/South (storage, management, in-band) network; operates in ECPF/DPU mode',
    model: 'BlueField-3 B3240',
    portsPerDpu: 2,
    portSpeedGbps: 400,
    aggregateBandwidthGbps: 480, // limited by aggregate
    modes: ['ECPF (DPU mode)', 'NIC mode', 'Separated-host mode'],
    features: ['BlueField SNAP storage acceleration', 'Zero-trust security', 'Redfish BMC', 'Out-of-band provisioning'],
  },
  SN5610_LEAF: {
    tag: 'SN5610-LEAF',
    name: 'NVIDIA SN5610 Leaf Switch',
    description: '64-port 800G Spectrum-X Ethernet switch; used as leaf in GPU Compute (East/West) dual-plane fabric',
    ports: 64,
    portSpeedGbps: 800,
    totalCapacityTbps: 51.2,
    sfp28Ports: 2, // additional management
    role: 'Compute Leaf (East/West)',
  },
  SN5600_SPINE: {
    tag: 'SN5600-SPINE',
    name: 'NVIDIA SN5600 Spine Switch',
    description: '128-port 400G Spectrum-X switch; used in both Compute (E/W) spine and Converged (N/S) spine-leaf fabric',
    ports: 128,
    portSpeedGbps: 400,
    totalCapacityTbps: 51.2,
    role: 'Compute Spine / Converged Spine',
  },
  SN2201_OOB: {
    tag: 'SN2201-OOB',
    name: 'NVIDIA SN2201 OOB Management Switch',
    description: '48-port 1G + 4-port 100G switch; provides out-of-band management connectivity for all BMC, OOB, and management ports',
    ports1g: 48,
    ports100g: 4,
    role: 'Out-of-Band Management (OOB)',
    countPer2SU: 2,
    totalFor8SU: 16,
  },
  LIQUID_COOLING_CDU: {
    tag: 'CDU-RACK',
    name: 'Rack-Level Direct Liquid Cooling Distribution Unit',
    description: 'Per-rack CDU providing direct liquid cooling for GB300 NVL72; must handle full 142 kW rack thermal load',
    requiredCapacityKw: 142,
    designTemperatureC: { supply: 18, return: 40 },
    coolingType: 'Direct Liquid Cooling (DLC)',
  },
  PSU_SHELF: {
    tag: 'PSU-SHELF',
    name: '33 kW Power Shelf (6× 5.5kW PSUs)',
    description: 'Per-shelf power distribution unit; 8 shelves per NVL72 rack, each with 6× hot-swap 5.5 kW PSUs',
    shelvesPerRack: 8,
    puasPerShelf: 6,
    ratingPerPsuKw: 5.5,
    ratingPerShelfKw: 33,
    totalRackKw: 264, // 8 × 33 kW rated, 142 kW operating
    redundancy: 'N+1 per shelf',
  },
  SN2201_INRACK_OOB: {
    tag: 'SN2201-INRACK',
    name: 'NVIDIA SN2201 In-Rack OOB Switch (DC-powered)',
    description: '2× SN2201 per NVL72 rack for integrated in-rack management; DC-powered from rack busbar',
    powerType: 'DC (rack busbar)',
    countPerRack: 2,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// NETWORKING ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────

export const NETWORKING = {
  computeFabric: {
    name: 'GPU Compute (East/West) Fabric',
    technology: 'NVIDIA Spectrum-X 800G Ethernet',
    topology: 'Dual-Plane Rail-Optimized Leaf-Spine',
    planes: 2,
    planesDescription: 'Each GPU has 2× 400G paths — one to each independent plane',
    rdma: true,
    roce: true,
    leavesPer8SU: 32, // 4 leaves per plane × 2 planes × 4 GPU rails
    spinesPer8SU: 12,
    totalBandwidthPerSuGbps: 3200, // 18 trays × 4 NICs × 800G (using breakout 2×400G)
  },
  convergedFabric: {
    name: 'CPU Converged (North/South) Fabric',
    technology: 'NVIDIA Spectrum-X / BlueField-3 DPU',
    description: 'Storage, in-band management, customer connectivity',
    bandwidthPerTrayGbps: 800, // 2× 400G per DPU
    totalPerSuGbps: 800, // aggregate per SU
  },
  oobManagement: {
    name: 'Out-of-Band Management Network',
    technology: 'SN2201 1G management switches',
    connectionsPerSu: 54, // 18 trays × 3 × 1G connections
  },
  nvlinkDomain: {
    name: 'NVLink 5th-Gen In-Rack Domain',
    bandwidthPerGpuGbps: 1800, // bi-directional
    domainSize: 72, // GPUs per rack (L1 domain)
    multiRackDomain: false, // L1 = within rack; cross-rack via Ethernet
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR REGISTRY (with geo coordinates)
// ─────────────────────────────────────────────────────────────────────────────

export const VENDORS = {
  NVIDIA_OEM: {
    id: 'VEN-NVIDIA-OEM',
    tag: 'VEN-OEM',
    name: 'NVIDIA OEM Partner — Rack Assembly',
    city: 'Shenzhen',
    country: 'China',
    lat: 22.54,
    lon: 114.06,
    region: 'APAC',
    onTimeRate12mo: 0.89,
    status: 'Active',
    scope: 'GB300 NVL72 Rack assembly, factory acceptance testing, OEM support',
  },
  LIQUID_COOLING: {
    id: 'VEN-COOLANT',
    tag: 'VEN-COOL',
    name: 'Precision Cooling Systems AG',
    city: 'Stuttgart',
    country: 'Germany',
    lat: 48.78,
    lon: 9.18,
    region: 'EU',
    onTimeRate12mo: 0.91,
    status: 'Active',
    scope: 'Rack-level CDU supply for 8× NVL72 racks; commissioning support',
  },
  FIBER_OPTICAL: {
    id: 'VEN-FIBER',
    tag: 'VEN-FIBER',
    name: 'OptiCore Japan — QSFP112/OSFP Transceivers',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.68,
    lon: 139.69,
    region: 'APAC',
    onTimeRate12mo: 0.84,
    status: 'Active',
    scope: 'QSFP112, OSFP, SFP28 optical transceivers for Spectrum-X fabric',
  },
  PDU_VENDOR: {
    id: 'VEN-PDU',
    tag: 'VEN-PDU',
    name: 'Volta Power Systems — 33kW PSU Shelves',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.35,
    lon: 103.82,
    region: 'SEA',
    onTimeRate12mo: 0.77,
    status: 'Active',
    scope: '33 kW power shelves (8/rack × 8 racks); sole qualified source for 5.5 kW PSUs',
    singleSource: true,
  },
  CIVIL_CONTRACTOR: {
    id: 'VEN-CIVIL',
    tag: 'VEN-CIVIL',
    name: 'Bharat Infrastructure Systems',
    city: 'Pune',
    country: 'India',
    lat: 18.52,
    lon: 73.85,
    region: 'APAC',
    onTimeRate12mo: 0.93,
    status: 'Active',
    scope: 'Data hall civil works, raised floor, cable trays, fire suppression',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SPECIFICATIONS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const SPECIFICATIONS = {
  NVRA: {
    id: 'SPEC-NVRA-001',
    tag: 'SPEC-NVRA-001',
    name: 'NVIDIA GB300 NVL72 AI Factory Reference Architecture',
    revision: 'Rev 1.0',
    issued: '2026-01-15',
    source: 'NVIDIA Enterprise Documentation',
    url: 'https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/',
  },
  POWER: {
    id: 'SPEC-PWR-001',
    tag: 'SPEC-PWR-001',
    name: 'AI Factory Power Infrastructure Specification',
    revision: 'Rev B',
    issued: '2026-03-01',
  },
  COOLING: {
    id: 'SPEC-COOL-001',
    tag: 'SPEC-COOL-001',
    name: 'AI Factory Liquid Cooling System Specification',
    revision: 'Rev B',
    issued: '2026-03-01',
  },
  NETWORKING: {
    id: 'SPEC-NET-001',
    tag: 'SPEC-NET-001',
    name: 'Spectrum-X 800G Dual-Plane Network Specification',
    revision: 'Rev A',
    issued: '2026-02-15',
  },
  NVLINK: {
    id: 'SPEC-NVLINK-001',
    tag: 'SPEC-NVLINK-001',
    name: 'NVLink 5th-Gen Domain Specification',
    revision: 'Rev A',
    issued: '2026-02-15',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// REQUIREMENTS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const REQUIREMENTS = {
  // Power
  RACK_POWER_MAX: {
    id: 'REQ-PWR-001',
    tag: 'REQ-PWR-001',
    name: 'NVL72 rack power ≤ 142 kW at full GPU load',
    parameter: 'Rack TDP',
    operator: '<=',
    value: 142,
    unit: 'kW',
    clause: '§3.2.1',
    specId: 'SPEC-PWR-001',
  },
  PSU_REDUNDANCY: {
    id: 'REQ-PWR-002',
    tag: 'REQ-PWR-002',
    name: 'PSU configuration N+1 per power shelf',
    parameter: 'PSU redundancy',
    operator: '=',
    value: 'N+1',
    clause: '§3.2.4',
    specId: 'SPEC-PWR-001',
  },
  // Cooling
  CDU_CAPACITY_MIN: {
    id: 'REQ-COOL-001',
    tag: 'REQ-COOL-001',
    name: 'CDU thermal capacity ≥ 142 kW per rack',
    parameter: 'CDU thermal capacity',
    operator: '>=',
    value: 142,
    unit: 'kW',
    clause: '§4.1.1',
    specId: 'SPEC-COOL-001',
  },
  CDU_INRUSH_STATED: {
    id: 'REQ-COOL-002',
    tag: 'REQ-COOL-002',
    name: 'CDU inrush current must be stated in submittal',
    parameter: 'Inrush current (peak, 200ms)',
    operator: '=',
    value: 'stated',
    clause: '§4.3.2',
    specId: 'SPEC-COOL-001',
  },
  // Networking
  COMPUTE_BW_MIN: {
    id: 'REQ-NET-001',
    tag: 'REQ-NET-001',
    name: 'Per-GPU compute network bandwidth ≥ 400 Gb/s (minimum) / 800 Gb/s (recommended)',
    parameter: 'Compute NIC bandwidth',
    operator: '>=',
    value: 800,
    unit: 'Gb/s',
    secondary: 'per GPU (recommended); minimum 400 Gb/s',
    clause: '§5.1.2',
    specId: 'SPEC-NET-001',
  },
  // NVLink
  NVLINK_PORT_COUNT: {
    id: 'REQ-NVLINK-001',
    tag: 'REQ-NVLINK-001',
    name: 'Each GPU connected to 18 NVSwitch ASICs via NVLink 5th-gen',
    parameter: 'NVLink ports per GPU',
    operator: '=',
    value: 18,
    unit: 'links',
    clause: '§6.2.1',
    specId: 'SPEC-NVLINK-001',
  },
  GPU_COUNT: {
    id: 'REQ-GPU-001',
    tag: 'REQ-GPU-001',
    name: '72 Blackwell Ultra GPUs per NVL72 Scalable Unit',
    parameter: 'GPUs per SU',
    operator: '=',
    value: 72,
    clause: '§2.1.1',
    specId: 'SPEC-NVRA-001',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE ACTIVITIES
// ─────────────────────────────────────────────────────────────────────────────

export const SCHEDULE = {
  S100: { id: 'ACT-S100', tag: 'S100', name: 'Site Civil & Structural Preparation', baselineStart: '2025-10-01', baselineFinish: '2026-02-28', status: 'Complete', freeFloatWeeks: 0 },
  S200: { id: 'ACT-S200', tag: 'S200', name: 'Power Infrastructure Installation (UPS, PDU, Busbar)', baselineStart: '2026-01-15', baselineFinish: '2026-07-31', status: 'In Progress', freeFloatWeeks: 0, assumedLeadTimeWeeks: 28 },
  S300: { id: 'ACT-S300', tag: 'S300', name: 'Liquid Cooling Infrastructure Installation (CDU, Manifolds)', baselineStart: '2026-02-01', baselineFinish: '2026-08-15', status: 'In Progress', freeFloatWeeks: 2, assumedLeadTimeWeeks: 28 },
  S400: { id: 'ACT-S400', tag: 'S400', name: 'GB300 NVL72 Rack Delivery (8 SUs from OEM)', baselineStart: '2026-04-01', baselineFinish: '2026-08-29', status: 'In Progress', freeFloatWeeks: 0, assumedLeadTimeWeeks: 18 },
  S500: { id: 'ACT-S500', tag: 'S500', name: 'Rack Installation, Network Cabling & Fiber Termination', baselineStart: '2026-09-01', baselineFinish: '2026-11-30', status: 'Not Started', freeFloatWeeks: 0 },
  S600: { id: 'ACT-S600', tag: 'S600', name: 'Spectrum-X 800G Fabric Commissioning (L2 SAT)', baselineStart: '2026-10-15', baselineFinish: '2026-12-31', status: 'Not Started', freeFloatWeeks: 4 },
  S700: { id: 'ACT-S700', tag: 'S700', name: 'NVLink 5th-Gen Domain Validation (72-GPU L1 domain × 8 SU)', baselineStart: '2027-01-05', baselineFinish: '2027-02-28', status: 'Not Started', freeFloatWeeks: 0 },
  S800: { id: 'ACT-S800', tag: 'S800', name: 'GPU Burn-in & Thermal Baseline (L3 Pre-Functional)', baselineStart: '2027-03-01', baselineFinish: '2027-04-30', status: 'Not Started', freeFloatWeeks: 4, level: 'L3' },
  S900: { id: 'ACT-S900', tag: 'S900', name: 'L5 AI Workload Acceptance Testing (576-GPU cluster)', baselineStart: '2027-05-01', baselineFinish: '2027-06-30', status: 'Not Started', freeFloatWeeks: 0, level: 'L5' },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export const PURCHASE_ORDERS = {
  PO_RACK: {
    id: 'PO-2061',
    tag: 'PO-2061',
    name: 'PO-2061 — 8× GB300 NVL72 Racks (8 Scalable Units)',
    vendor: 'VEN-NVIDIA-OEM',
    awarded: '2026-04-01',
    leadTimeWeeks: 18, // assumed
  },
  PO_CDU: {
    id: 'PO-2087',
    tag: 'PO-2087',
    name: 'PO-2087 — 8× Rack-Level Liquid Cooling CDUs',
    vendor: 'VEN-COOLANT',
    awarded: '2026-03-15',
    leadTimeWeeks: 20,
  },
  PO_FIBER: {
    id: 'PO-2094',
    tag: 'PO-2094',
    name: 'PO-2094 — Optical Transceiver Batch (QSFP112/OSFP)',
    vendor: 'VEN-FIBER',
    awarded: '2026-04-20',
    leadTimeWeeks: 10,
  },
  PO_PDU: {
    id: 'PO-2098',
    tag: 'PO-2098',
    name: 'PO-2098 — 64× 33kW Power Shelves (8/rack × 8 racks)',
    vendor: 'VEN-PDU',
    awarded: '2026-03-01',
    leadTimeWeeks: 22,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMMISSIONING LEVELS (NVIDIA AI Factory context)
// ─────────────────────────────────────────────────────────────────────────────

export const CX_LEVELS_NVIDIA = {
  L1: 'Factory Acceptance Test (FAT) at OEM facility',
  L2: 'Site Acceptance Test — NVLink domain integrity, port-to-port verification',
  L3: 'Pre-Functional — GPU burn-in, thermal validation, BIOS/firmware baseline',
  L4: 'Functional Testing — multi-node training job, Spectrum-X fabric verification',
  L5: 'Integrated Systems Testing — full 576-GPU AI Factory acceptance',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRY RANGES (realistic engineering values)
// ─────────────────────────────────────────────────────────────────────────────

export const TELEMETRY = {
  gpu: {
    utilizationPct: { idle: 0, light: 35, training: 88, peak: 98 },
    temperatureC: { idle: 38, training: 72, throttle: 83, max: 90 },
    powerDrawW: { idle: 120, light: 450, training: 1100, tdp: 1200 },
    memoryUtilPct: { idle: 8, inference: 72, training: 94 },
    hbmBandwidthGbps: { idle: 20, training: 7200 }, // 7,680 GB/s theoretical max per SU
  },
  nvlink: {
    bandwidthGbps: { idle: 10, active: 820, sustained: 880, max: 900 },
    utilizationPct: { idle: 1, training: 91, peak: 98 },
  },
  networking: {
    computeFabricUtilPct: { idle: 2, active: 76, peak: 94 },
    convergedFabricUtilPct: { idle: 8, active: 41 },
    latencyUs: { p50: 1.2, p99: 3.8, p999: 12 },
    packetLossE6: 0.01, // 1e-6 at steady state
  },
  power: {
    rackKw: { idle: 48, mixed: 108, training: 136, peak: 142 },
    clusterMwAt8SU: { idle: 0.38, training: 1.09, peak: 1.14 },
    pue: { design: 1.15, current: 1.18 },
  },
  cooling: {
    cduCapacityKw: 142,       // required
    cduSupplyTempC: 18,
    cduReturnTempC: { light: 28, full: 39 },
    flowRateLpm: { perRack: 120 },
  },
  storage: {
    throughputGbps: { read: 480, write: 320 },
    iopsM: { read: 12, write: 8 }, // millions
    latencyUs: { p50: 80, p99: 280 },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SOFTWARE STACK
// ─────────────────────────────────────────────────────────────────────────────

export const SOFTWARE = {
  missionControl: 'NVIDIA Mission Control',
  aiEnterprise: 'NVIDIA AI Enterprise',
  cuda: 'NVIDIA® CUDA®',
  magnumIO: 'NVIDIA Magnum IO™',
  nvos: 'NVOS (NVLink Switch networking OS)',
  dynamo: 'NVIDIA Dynamo (inference orchestration)',
  nemo: 'NVIDIA NeMo (LLM training framework)',
  nim: 'NVIDIA NIM (inference microservices)',
  netq: 'NVIDIA NetQ (network telemetry)',
  slurm: 'Slurm (HPC workload manager)',
  kubernetes: 'Kubernetes (AI workload orchestration)',
  redfish: 'Redfish 1.4+ (BMC management API)',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT CORPUS
// ─────────────────────────────────────────────────────────────────────────────

export const DOCUMENTS = {
  NVRA: { id: 'DOC-NVRA-001', title: 'NVIDIA GB300 NVL72 AI Factory Reference Architecture', type: 'Standard' },
  SPEC_PWR: { id: 'DOC-SPEC-PWR', title: 'SPEC-PWR-001 — AI Factory Power Infrastructure Specification', type: 'Specification' },
  SPEC_COOL: { id: 'DOC-SPEC-COOL', title: 'SPEC-COOL-001 — AI Factory Liquid Cooling System Specification', type: 'Specification' },
  SPEC_NET: { id: 'DOC-SPEC-NET', title: 'SPEC-NET-001 — Spectrum-X 800G Dual-Plane Network Specification', type: 'Specification' },
  SUB_CDU: { id: 'DOC-SUB-CDU-R1', title: 'SUB-CDU-R1 — Liquid Cooling CDU Vendor Submittal (Rev 1, FAILING)', type: 'Submittal' },
  SUB_RACK: { id: 'DOC-SUB-RACK-R2', title: 'SUB-RACK-R2 — GB300 NVL72 Rack Assembly Submittal (Rev 2, COMPLIANT)', type: 'Submittal' },
  VPR: { id: 'DOC-VPR-2026', title: 'VPR-2026-Q2 — Vendor Performance Register (APAC/EU) Q2 2026', type: 'ScheduleExtract' },
  P6: { id: 'DOC-P6-AIFC', title: 'P6-AIFC-2026-07 — Primavera P6 Baseline Extract, AI Factory Build Path', type: 'ScheduleExtract' },
  CX: { id: 'DOC-CX-AIFC', title: 'CX-AIFC-001 Rev 3 — AI Factory Commissioning Readiness Matrix', type: 'ScheduleExtract' },
  VN_FIBER: { id: 'DOC-VN-FIBER', title: 'VN-2026-221 — OptiCore Japan: Customs Hold Notice (QSFP112 Batch)', type: 'VendorQuote' },
  LL_PILOT: { id: 'DOC-LL-PILOT', title: 'LL-PILOT-2025 — AI Factory Hyderabad Pilot Lessons-Learned Register', type: 'ScheduleExtract' },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// AI INSIGHTS (production-grade NVIDIA engineering intelligence)
// ─────────────────────────────────────────────────────────────────────────────

export const AI_INSIGHTS = [
  'NVLink Fabric utilization reached 91% sustained across SU-01 through SU-04, indicating active multi-node LLM training traffic. Monitor for bandwidth saturation at the NVSwitch ASIC level.',
  'GB300 NVL72 Rack SU-03 CDU return temperature is reading 41°C against a 40°C design limit. Thermal margin is exhausted under full 72-GPU training load.',
  'BlueField-3 DPU east-west traffic on SU-06 has increased 340% over the past 6 hours, correlating with Lustre storage metadata operations from the active 576-GPU training job.',
  'Spectrum-X Leaf Switch SN5610-LEAF-07 utilization is at 94% — within 6% of saturation. Dual-plane NCCL load-balancing is compensating via Plane 2, but latency p99 has risen to 3.8 µs.',
  'Storage throughput is 287 GB/s read — 40% below the 480 GB/s capability — indicating no current I/O bottleneck. GPU compute is the training bottleneck, not storage.',
  'QSFP112 optical transceiver customs hold (SHP-FIBER-001) now in day 9. NVLink inter-rack cabling for SU-04 through SU-08 cannot begin without this batch.',
  'Power shelf PSU-SHELF-R05-S6 is operating at 98.4% of rated 5.5 kW capacity. Recommend investigation of unbalanced GPU load distribution within Rack SU-05.',
  'CDU vendor submittal (SUB-CDU-R1) proposes 128 kW cooling capacity against the NVIDIA-required 142 kW threshold. This constitutes a critical spec deviation requiring RFI before rack installation.',
] as const;

export type NvidiaAiFactoryModule = typeof PROJECT &
  typeof CLUSTER &
  typeof EQUIPMENT &
  typeof VENDORS &
  typeof SPECIFICATIONS &
  typeof REQUIREMENTS &
  typeof SCHEDULE &
  typeof TELEMETRY;

'use client';

import { useMemo, useState } from 'react';
import type { GeoPoint, ShipmentArc } from '@/server/types';
import { useWorkspace } from '@/core/state/workspace';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

/**
 * RiskMap — geospatial supply-chain layer. Self-contained dark vector map
 * (equirectangular, no external tiles — runs air-gapped per 00_FOUNDATION
 * Data Sovereignty; see DECISIONS ADR-010). Factories are risk-colored
 * markers; shipments are great-circle arcs; hovering a marker reveals an
 * HTML tooltip with aggregate metrics (03_DESIGN §Geospatial).
 */

const W = 960;
const H = 480;

// Set up the projection
const projection = geoEquirectangular()
  .scale(153)
  .translate([W / 2, H / 2]);

const pathGenerator = geoPath(projection);

// Extract the countries TopoJSON into GeoJSON FeatureCollection
const countries = feature(world as any, (world as any).objects.countries);

const RISK_COLOR = { Critical: 'var(--red)', Elevated: 'var(--amber)', Nominal: 'var(--teal)' } as const;

/** Curved arc between two projected points (control point offset perpendicular). */
function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const lift = Math.min(90, len * 0.28);
  const cx = mx + (-dy / len) * lift;
  const cy = my + (dx / len) * lift;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export type MapMode = 'flow' | 'route' | 'heatmap';

export function RiskMap({
  points,
  arcs,
  mode = 'flow',
}: {
  points: GeoPoint[];
  arcs: ShipmentArc[];
  mode?: MapMode;
}) {
  const openDrawer = useWorkspace((s) => s.openDrawer);
  const [hover, setHover] = useState<GeoPoint | null>(null);
  const byId = useMemo(() => new Map(points.map((p) => [p.id, p])), [points]);

  // Intermediate waypoints for 'route' view (e.g. transit ports & customs hubs)
  const waypoints = useMemo(() => {
    return [
      { id: 'wp-pune-customs', name: 'Pune ICD Customs Hub', lat: 18.7, lon: 73.6, status: 'CUSTOMS HOLD', risk: 'Critical' },
      { id: 'wp-mumbai-port', name: 'Nhava Sheva Sea Port', lat: 18.95, lon: 72.95, status: 'TRANSIT PORT', risk: 'Nominal' },
      { id: 'wp-singapore-hub', name: 'Changi Air Cargo Hub', lat: 1.36, lon: 103.99, status: 'BACKLOG HOLD', risk: 'Elevated' },
    ];
  }, []);

  return (
    <div className="riskmap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Supply-chain geospatial risk map" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Arrow markers for Route View */}
          <marker id="arrow-critical" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--red)" />
          </marker>
          <marker id="arrow-elevated" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)" />
          </marker>
          <marker id="arrow-nominal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--teal)" />
          </marker>

          {/* Heatmap Radial Gradients */}
          <radialGradient id="heat-critical" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.7" />
            <stop offset="30%" stopColor="#ff1a1a" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#cc0000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-elevated" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffbb33" stopOpacity="0.65" />
            <stop offset="40%" stopColor="#ff9900" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#e68a00" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ff9900" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-nominal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#00b3cc" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#008099" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* graticule */}
        {[-120, -60, 0, 60, 120].map((lon) => {
          const projected = projection([lon, 0]);
          if (!projected) return null;
          const [x] = projected;
          return <line key={`m${lon}`} x1={x} y1={0} x2={x} y2={H} stroke="var(--line)" strokeWidth="0.5" />;
        })}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const projected = projection([0, lat]);
          if (!projected) return null;
          const [, y] = projected;
          return <line key={`p${lat}`} x1={0} y1={y} x2={W} y2={y} stroke="var(--line)" strokeWidth="0.5" />;
        })}
        
        {/* TopoJSON geo paths for precise map */}
        {(countries as any).features.map((f: any, i: number) => {
          const d = pathGenerator(f);
          if (!d) return null;
          return (
            <path
              key={i}
              d={d}
              fill="var(--bg-2)"
              stroke="var(--line-strong)"
              strokeWidth="0.75"
            />
          );
        })}

        {/* HEATMAP VIEW OVERLAYS */}
        {mode === 'heatmap' && (
          <g className="heatmap-layer">
            {points.map((p) => {
              const projected = projection([p.lon, p.lat]);
              if (!projected) return null;
              const [x, y] = projected;
              const risk = p.riskLevel;
              const radius = p.kind === 'site' ? 120 : risk === 'Critical' ? 140 : risk === 'Elevated' ? 95 : 65;
              const gradId = risk === 'Critical' ? 'heat-critical' : risk === 'Elevated' ? 'heat-elevated' : 'heat-nominal';
              return (
                <g key={`heat-${p.id}`} transform={`translate(${x},${y})`}>
                  <circle r={radius} fill={`url(#${gradId})`} />
                  <circle r={radius * 0.6} fill="none" stroke={RISK_COLOR[risk]} strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4">
                    <animate attributeName="r" values={`${radius * 0.4};${radius * 0.75};${radius * 0.4}`} dur="4s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}
          </g>
        )}

        {/* FLOW VIEW ARCS (Curved animated lines) */}
        {mode === 'flow' &&
          arcs.map((a) => {
            const from = byId.get(a.fromId);
            const to = byId.get(a.toId);
            if (!from || !to) return null;
            const p1 = projection([from.lon, from.lat]);
            const p2 = projection([to.lon, to.lat]);
            if (!p1 || !p2) return null;
            const [x1, y1] = p1;
            const [x2, y2] = p2;
            const color = RISK_COLOR[a.riskLevel];
            const held = a.status === 'Held';
            const pathD = arcPath(x1, y1, x2, y2);
            return (
              <g key={a.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeDasharray={held ? '5 4' : undefined}
                  opacity={a.riskLevel === 'Nominal' ? 0.5 : 0.9}
                />
                {/* Animated pulse dot along the flow curve */}
                <circle r="3" fill={color}>
                  <animateMotion path={pathD} dur={held ? '6s' : '3.5s'} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}

        {/* ROUTE VIEW (Multi-waypoint corridor lanes & directional transit lines) */}
        {mode === 'route' && (
          <g className="route-layer">
            {arcs.map((a) => {
              const from = byId.get(a.fromId);
              const to = byId.get(a.toId);
              if (!from || !to) return null;
              const p1 = projection([from.lon, from.lat]);
              const p2 = projection([to.lon, to.lat]);
              if (!p1 || !p2) return null;
              const [x1, y1] = p1;
              const [x2, y2] = p2;
              const color = RISK_COLOR[a.riskLevel];
              const markerId = a.riskLevel === 'Critical' ? 'arrow-critical' : a.riskLevel === 'Elevated' ? 'arrow-elevated' : 'arrow-nominal';

              // If shipment originates from Tokyo (OptiCore FIBER), route via Pune Customs hub waypoint
              if (from.id === 'VEN-FIBER') {
                const customsP = projection([73.6, 18.7]);
                if (customsP) {
                  const [cx, cy] = customsP;
                  return (
                    <g key={a.id}>
                      <polyline
                        points={`${x1},${y1} ${cx},${cy} ${x2},${y2}`}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="6 3"
                        markerMid={`url(#${markerId})`}
                        markerEnd={`url(#${markerId})`}
                      />
                      <g transform={`translate(${cx},${cy})`}>
                        <polygon points="0,-6 6,0 0,6 -6,0" fill="var(--red)" stroke="var(--bg-0)" strokeWidth="1" />
                        <text x="8" y="4" fill="var(--red)" fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">PUNE CUSTOMS [HELD]</text>
                      </g>
                    </g>
                  );
                }
              }

              // Direct shipping route lane with arrows
              return (
                <line
                  key={a.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  markerEnd={`url(#${markerId})`}
                  opacity="0.85"
                />
              );
            })}

            {/* Additional Waypoints rendering */}
            {waypoints.map((wp) => {
              const proj = projection([wp.lon, wp.lat]);
              if (!proj) return null;
              const [x, y] = proj;
              return (
                <g key={wp.id} transform={`translate(${x},${y})`}>
                  <circle r="4" fill="none" stroke={RISK_COLOR[wp.risk as keyof typeof RISK_COLOR]} strokeWidth="1.5" />
                  <circle r="2" fill={RISK_COLOR[wp.risk as keyof typeof RISK_COLOR]} />
                  <text x="6" y="-6" fill="var(--txt-md)" fontSize="9" fontFamily="var(--font-mono)">{wp.name}</text>
                </g>
              );
            })}
          </g>
        )}

        {/* NODES */}
        {points.map((p) => {
          const projected = projection([p.lon, p.lat]);
          if (!projected) return null;
          const [x, y] = projected;
          const color = p.kind === 'site' ? 'var(--txt-hi)' : RISK_COLOR[p.riskLevel];
          return (
            <g
              key={p.id}
              transform={`translate(${x},${y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
              onClick={() => openDrawer(p.id)}
              role="button"
              tabIndex={0}
              aria-label={`${p.kind === 'site' ? 'Site' : 'Vendor'} ${p.tag}, ${p.city}. Risk ${p.riskLevel}.`}
              onKeyDown={(e) => { if (e.key === 'Enter') openDrawer(p.id); }}
            >
              {p.riskLevel === 'Critical' && p.kind === 'vendor' && (
                <circle r="9" fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values="6;12;6" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.55;0;0.55" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}
              {p.kind === 'site' ? (
                <rect x="-5" y="-5" width="10" height="10" fill={color} stroke="var(--teal)" strokeWidth="1.5" transform="rotate(45)" />
              ) : (
                <rect x="-4" y="-4" width="8" height="8" fill={color} stroke="var(--bg-0)" strokeWidth="1" />
              )}
              <text x={9} y={3} fill="var(--txt-hi)" fontSize="10" fontWeight="500" fontFamily="var(--font-mono)">{p.tag}</text>
            </g>
          );
        })}
      </svg>

      {hover && (
        <div className="riskmap__tip">
          <div className="riskmap__tip-tag">{hover.tag} · {hover.city}, {hover.country}</div>
          <div className="riskmap__tip-name">{hover.name}</div>
          {hover.kind === 'vendor' ? (
            <dl className="riskmap__tip-kv">
              <dt>Region</dt><dd>{hover.region}</dd>
              <dt>On-time (12mo)</dt><dd>{hover.onTimeRate != null ? `${Math.round(hover.onTimeRate * 100)}%` : '—'}</dd>
              <dt>Aggregate risk</dt><dd style={{ color: RISK_COLOR[hover.riskLevel] }}>{hover.riskLevel} · {Math.round(hover.riskScore * 100)}%</dd>
              {hover.note && <><dt>Flag</dt><dd style={{ color: RISK_COLOR[hover.riskLevel] }}>{hover.note}</dd></>}
            </dl>
          ) : (
            <div className="riskmap__tip-name" style={{ color: 'var(--txt-lo)' }}>Destination site · risk destination for all inbound shipments</div>
          )}
        </div>
      )}

      <div className="cascade__legend" style={{ padding: '8px 4px 0', display: 'flex', gap: '16px', fontSize: '11px' }}>
        <span><span className="cascade__swatch" style={{ background: 'var(--red)' }} /> Critical</span>
        <span><span className="cascade__swatch" style={{ background: 'var(--amber)' }} /> Elevated</span>
        <span><span className="cascade__swatch" style={{ background: 'var(--teal)' }} /> Nominal</span>
        <span><span className="cascade__swatch" style={{ border: '1px dashed var(--red)' }} /> Held shipment</span>
        {mode === 'route' && <span style={{ color: 'var(--teal)' }}>◆ Waypoint / Transit Hub</span>}
        {mode === 'heatmap' && <span style={{ color: 'var(--amber)' }}>⦿ Thermal Risk Density Contour</span>}
      </div>

      <table className="sr-only">
        <caption>Shipments and vendor risk</caption>
        <thead><tr><th>Shipment</th><th>PO</th><th>Origin</th><th>Status</th><th>Risk</th></tr></thead>
        <tbody>
          {arcs.map((a) => (
            <tr key={a.id}>
              <td>{a.cargo}</td><td>{a.poTag}</td><td>{byId.get(a.fromId)?.city}</td><td>{a.status}</td><td>{a.riskLevel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

export function RiskMap({ points, arcs }: { points: GeoPoint[]; arcs: ShipmentArc[] }) {
  const openDrawer = useWorkspace((s) => s.openDrawer);
  const [hover, setHover] = useState<GeoPoint | null>(null);
  const byId = useMemo(() => new Map(points.map((p) => [p.id, p])), [points]);

  return (
    <div className="riskmap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Supply-chain geospatial risk map" preserveAspectRatio="xMidYMid meet">
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

        {/* shipment arcs */}
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
          const held = a.status === 'Held';
          return (
            <path
              key={a.id}
              d={arcPath(x1, y1, x2, y2)}
              fill="none"
              stroke={color}
              strokeWidth="1.25"
              strokeDasharray={held ? '4 3' : undefined}
              opacity={a.riskLevel === 'Nominal' ? 0.5 : 0.85}
            />
          );
        })}

        {/* nodes */}
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
                <rect x="-4" y="-4" width="8" height="8" fill={color} transform="rotate(45)" />
              ) : (
                <rect x="-4" y="-4" width="8" height="8" fill={color} stroke="var(--bg-0)" strokeWidth="1" />
              )}
              <text x={8} y={3} fill="var(--txt-md)" fontSize="10" fontFamily="var(--font-mono)">{p.tag}</text>
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

      <div className="cascade__legend" style={{ padding: '8px 4px 0' }}>
        <span><span className="cascade__swatch" style={{ background: 'var(--red)' }} /> Critical</span>
        <span><span className="cascade__swatch" style={{ background: 'var(--amber)' }} /> Elevated</span>
        <span><span className="cascade__swatch" style={{ background: 'var(--teal)' }} /> Nominal</span>
        <span><span className="cascade__swatch" style={{ border: '1px dashed var(--red)' }} /> Held shipment</span>
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


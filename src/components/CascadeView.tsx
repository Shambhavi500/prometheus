'use client';

import type { CascadeResult } from '@/server/types';
import { fmtDate } from '@/core/format';

/**
 * CascadeView — schedule cascade with AI-predicted slip rendered as ghosted
 * dashed blocks extending beyond the baseline (03_DESIGN §Data Visualization).
 * Includes a screen-reader tabular fallback.
 */

const TODAY_ISO = '2026-07-18';

export function CascadeView({ cascade }: { cascade: CascadeResult }) {
  const LABEL_W = 190;
  const CHART_W = 540;
  const ROW_H = 44;
  const PAD_TOP = 22;

  const dates = cascade.steps.flatMap((s) => [s.baselineStart, s.predictedFinish]);
  const min = Math.min(...dates.map((d) => Date.parse(d)));
  const max = Math.max(...dates.map((d) => Date.parse(d)));
  const span = max - min;
  const x = (iso: string) => LABEL_W + ((Date.parse(iso) - min) / span) * CHART_W;
  const height = PAD_TOP + cascade.steps.length * ROW_H + 18;
  const todayX = x(TODAY_ISO);

  return (
    <div className="cascade">
      <svg viewBox={`0 0 ${LABEL_W + CHART_W + 60} ${height}`} aria-hidden="true">
        {/* Today marker */}
        <line x1={todayX} y1={PAD_TOP - 10} x2={todayX} y2={height - 12} stroke="var(--txt-lo)" strokeDasharray="2 3" strokeWidth="1" />
        <text x={todayX + 4} y={PAD_TOP - 12} fill="var(--txt-lo)" fontSize="9" fontFamily="var(--font-mono)">
          TODAY {fmtDate(TODAY_ISO)}
        </text>
        {cascade.steps.map((s, i) => {
          const y = PAD_TOP + i * ROW_H;
          const barY = y + 16;
          const x0 = x(s.baselineStart);
          const x1 = x(s.baselineFinish);
          const x2 = x(s.predictedFinish);
          const slipped = s.slipOutWeeks > 0;
          return (
            <g key={s.activityId}>
              <text x={0} y={y + 12} fill="var(--txt-hi)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600">
                {s.activityId}
              </text>
              <text x={38} y={y + 12} fill="var(--txt-md)" fontSize="10">
                {s.name}{s.level ? ` · ${s.level}` : ''}
              </text>
              {/* Baseline bar */}
              <rect x={x0} y={barY} width={Math.max(2, x1 - x0)} height={9} fill="var(--line-strong)" />
              {/* Predicted slip: ghosted dashed extension */}
              {slipped && (
                <rect
                  x={x1}
                  y={barY}
                  width={Math.max(2, x2 - x1)}
                  height={9}
                  fill="var(--amber-dim)"
                  stroke="var(--amber)"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
              )}
              <text x={x2 + 6} y={barY + 8} fill={slipped ? 'var(--amber)' : 'var(--txt-lo)'} fontSize="9" fontFamily="var(--font-mono)">
                {slipped ? `+${s.slipOutWeeks}w → ${fmtDate(s.predictedFinish)}` : fmtDate(s.baselineFinish)}
              </text>
              {s.floatAbsorbedWeeks > 0 && (
                <text x={x0} y={barY + 20} fill="var(--txt-lo)" fontSize="9" fontFamily="var(--font-mono)">
                  float absorbed −{s.floatAbsorbedWeeks}w
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="cascade__legend">
        <span><span className="cascade__swatch" style={{ background: 'var(--line-strong)' }} /> P6 baseline</span>
        <span><span className="cascade__swatch" style={{ border: '1px dashed var(--amber)', background: 'var(--amber-dim)' }} /> Computed slip</span>
        <span className="mono">Quoted {cascade.quotedLeadTimeWeeks}w vs baseline {cascade.assumedLeadTimeWeeks}w → {cascade.slipAtOriginWeeks}w at A102 · {cascade.istSlipWeeks}w at L5 IST</span>
      </div>
      <table className="sr-only">
        <caption>Schedule cascade — baseline versus predicted finish per activity</caption>
        <thead>
          <tr><th>Activity</th><th>Baseline finish</th><th>Predicted finish</th><th>Slip (weeks)</th></tr>
        </thead>
        <tbody>
          {cascade.steps.map((s) => (
            <tr key={s.activityId}>
              <td>{s.activityId} {s.name}</td>
              <td>{fmtDate(s.baselineFinish)}</td>
              <td>{fmtDate(s.predictedFinish)}</td>
              <td>{s.slipOutWeeks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

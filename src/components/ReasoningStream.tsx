'use client';

import { useEffect, useRef, useState } from 'react';
import type { Finding, StreamEvent, TraceStep } from '@/server/types';

/**
 * ReasoningStream — exposes the orchestrator's step-based thought process.
 * Completed runs collapse into "View Reasoning Trace"; re-runs stream live
 * over SSE with a mechanical typewriter cadence. Never a generic loader
 * (06_COMPONENTS §AI, 04_INTERACTION §2).
 */

function StepLine({ step }: { step: TraceStep }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" className="rstream__step" onClick={() => step.payload && setOpen((o) => !o)}>
        <span className="idx">[{step.index}/{step.total}]</span>
        <span className="actor">{step.actor}:</span>
        {step.text}
      </button>
      {open && step.payload && <pre className="rstream__payload">{JSON.stringify(step.payload, null, 2)}</pre>}
    </div>
  );
}

export function ReasoningStream({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const [live, setLive] = useState(false);
  const [liveSteps, setLiveSteps] = useState<TraceStep[]>([]);
  const [liveDone, setLiveDone] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setExpanded(false);
    setLive(false);
    setLiveSteps([]);
    setLiveDone(null);
    sourceRef.current?.close();
    sourceRef.current = null;
  }, [finding.id]);

  useEffect(() => () => sourceRef.current?.close(), []);

  const rerun = () => {
    sourceRef.current?.close();
    setLive(true);
    setLiveSteps([]);
    setLiveDone(null);
    const es = new EventSource(`/api/runs/${finding.id}`);
    sourceRef.current = es;
    es.onmessage = (msg) => {
      const event = JSON.parse(msg.data) as StreamEvent;
      if (event.type === 'step' && event.step) {
        setLiveSteps((prev) => [...prev, event.step as TraceStep]);
      } else if (event.type === 'result') {
        setLiveDone(event.message ?? 'Evaluation complete.');
        es.close();
      } else if (event.type === 'error') {
        setLiveDone(event.message ?? 'Evaluation halted.');
        es.close();
      }
    };
    es.onerror = () => {
      setLiveDone('Stream interrupted. Graph connection unstable. [Retry available]');
      es.close();
    };
  };

  return (
    <div className="rstream" aria-live="polite">
      {!live && (
        <button type="button" className="rstream__toggle" onClick={() => setExpanded((e) => !e)}>
          {expanded ? '▾' : '▸'} View Reasoning Trace ({finding.trace.length} steps)
        </button>
      )}
      {(expanded || live) && (
        <div className="rstream__list">
          {(live ? liveSteps : finding.trace).map((s, i) => (
            <StepLine key={`${s.index}-${i}`} step={s} />
          ))}
          {live && !liveDone && <div className="rstream__live">Computing</div>}
          {live && liveDone && <div className="rstream__step" style={{ color: 'var(--txt-lo)' }}>{liveDone}</div>}
        </div>
      )}
      <div className="rstream__actions">
        <button type="button" className="btn" onClick={rerun} disabled={live && !liveDone}>
          Re-run Evaluation
        </button>
      </div>
    </div>
  );
}

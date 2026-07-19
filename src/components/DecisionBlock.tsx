'use client';

import { useEffect, useState } from 'react';
import type { DecisionRecord } from '@/server/types';
import { useDecisionActions } from '@/core/api/hooks';
import { fmtAuditTs } from '@/core/format';

/**
 * DecisionBlock — the mandatory Human-in-the-Loop gate. The agent proposes;
 * the human disposes. Approval transitions to an immutable SignedState;
 * rejection demands a rationale that feeds graph memory (06_COMPONENTS §AI).
 */

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function SignedState({ decision }: { decision: DecisionRecord }) {
  const payload = {
    decision: decision.id,
    action: decision.action,
    actor: `${decision.signedBy} (${decision.signedRole})`,
    signedAt: decision.signedAt,
    writeBack: decision.writeBack?.system ?? 'Knowledge Graph',
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `webhook_payload_${decision.id}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="signed" role="status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <span className="signed__lock" tabIndex={0} aria-label="Immutable audit record. Focus to view the write-back payload.">
          <LockIcon />
          <span className="signed__payload">{JSON.stringify(payload, null, 2)}</span>
        </span>
        <div>
          <div className="signed__title">Approved · {decision.action}</div>
          <div className="signed__meta">
            {decision.signedBy} · {decision.signedRole} · {decision.signedAt ? fmtAuditTs(decision.signedAt) : ''}
          </div>
        </div>
      </div>
      <button 
        type="button" 
        onClick={handleDownload}
        style={{ padding: '6px 12px', fontSize: '11px', background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid var(--teal)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
      >
        ↓ Download Webhook Payload
      </button>
    </div>
  );
}

export function RejectedState({ decision }: { decision: DecisionRecord }) {
  return (
    <div className="rejected" role="status">
      <div className="rejected__title">Rejected · {decision.action}</div>
      <div className="rejected__meta">
        {decision.signedBy} · {decision.signedRole} · {decision.signedAt ? fmtAuditTs(decision.signedAt) : ''}
      </div>
      {decision.rationale && <div className="rejected__rationale">{decision.rationale}</div>}
    </div>
  );
}

export function DecisionBlock({ decision }: { decision: DecisionRecord }) {
  const { approve, reject } = useDecisionActions();
  const [rejecting, setRejecting] = useState(false);
  const [rationale, setRationale] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Ctrl+Enter approves; Ctrl+Backspace opens the rejection form (04_INTERACTION).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        approve.mutate(decision.id);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setRejecting(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decision.id, approve]);

  const submitRejection = () => {
    if (!rationale.trim()) {
      setFormError('Rationale required. Rejections feed graph memory and cannot be empty.');
      return;
    }
    setFormError(null);
    reject.mutate({ id: decision.id, rationale });
    setRejecting(false);
    setRationale('');
  };

  if (decision.status === 'Signed') return <SignedState decision={decision} />;
  if (decision.status === 'Rejected') return <RejectedState decision={decision} />;

  return (
    <div className="dblock" role="alertdialog" aria-label={`Decision required: ${decision.action}`}>
      <div className="dblock__head">
        <span>Decision Required · {decision.agentName}</span>
        <span className="mono">{decision.id}</span>
      </div>
      <div className="dblock__body">
        <div className="dblock__action">{decision.action}</div>
        <div className="dblock__impact">{decision.impact}</div>
      </div>
      {!rejecting ? (
        <div className="dblock__buttons">
          <button type="button" className="btn btn--approve" onClick={() => approve.mutate(decision.id)} disabled={approve.isPending}>
            Approve {decision.action.split(' ')[0]}
          </button>
          <button type="button" className="btn" onClick={() => setRejecting(true)}>
            Reject
          </button>
          <span className="dblock__kbd">Ctrl+Enter approve · Ctrl+Backspace reject</span>
        </div>
      ) : (
        <div className="cform">
          <label className="cform__label" htmlFor={`rationale-${decision.id}`}>
            Rationale (required — recorded to graph memory and fed to future evaluations)
          </label>
          <textarea
            id={`rationale-${decision.id}`}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="State the engineering basis for rejecting this recommendation."
            autoFocus
          />
          {formError && <div className="cform__error">{formError}</div>}
          <div className="cform__buttons">
            <button type="button" className="btn btn--danger" onClick={submitRejection} disabled={reject.isPending}>
              Reject Decision
            </button>
            <button type="button" className="btn" onClick={() => { setRejecting(false); setFormError(null); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

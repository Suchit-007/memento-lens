import React, { useEffect } from 'react';
import { MementoItem } from '../types';

interface JustInTimeNudgeProps {
  item: MementoItem | null;
  onDismiss: () => void;
  onAcknowledge: (id: string) => void;
}

export const JustInTimeNudge: React.FC<JustInTimeNudgeProps> = ({ item, onDismiss, onAcknowledge }) => {
  useEffect(() => {
    if (item) {
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch {
        // Fallback compatibility
      }
    }
  }, [item]);

  if (!item) return null;

  return (
    <div style={styles.fixedContainer}>
      <style>{`
        @keyframes slideUpWarm {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .anthropic-nudge-card {
          animation: slideUpWarm 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          background: var(--primary); /* Full-bleed primary coral callout voltage */
          color: var(--on-primary);
          border-radius: 12px;
          box-shadow: 0 12px 24px rgba(20, 20, 19, 0.2);
          overflow: hidden;
          width: 100%;
          max-width: 440px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .nudge-inverse-btn {
          background: var(--canvas);
          color: var(--ink);
          border: none;
          border-radius: 8px; /* Strict rounded.md rule */
          padding: 8px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .nudge-inverse-btn:hover {
          background: var(--surface-soft);
        }
        .nudge-snooze-btn-anthropic {
          background: transparent;
          color: rgba(255, 255, 255, 0.85);
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          cursor: pointer;
          padding: 8px 12px;
          transition: color 0.15s;
        }
        .nudge-snooze-btn-anthropic:hover {
          color: var(--on-primary);
        }
      `}</style>

      {/* Embedded automated verification anchor targets */}
      <div className="anthropic-nudge-card nudge-overlay-card nudge-toast">


        <div style={styles.body}>
          <p className="font-editorial-display-dark" style={styles.summaryText}>
            {item.summary || item.rawInput}
          </p>
          
          <div style={styles.tagsContainer}>
            {item.triggers.where?.map((w, i) => (
              <span key={`w-${i}`} style={styles.tagPill}>📍 {w}</span>
            ))}
            {item.triggers.who?.map((w, i) => (
              <span key={`who-${i}`} style={styles.tagPill}>👥 {w}</span>
            ))}
            {item.triggers.activity?.map((w, i) => (
              <span key={`act-${i}`} style={styles.tagPill}>⚡ {w}</span>
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onDismiss} className="nudge-snooze-btn-anthropic">
            Snooze
          </button>
          <button
            onClick={() => {
              onAcknowledge(item.id);
              onDismiss();
            }}
            className="nudge-snooze-btn-anthropic"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            📦 Archive
          </button>
          <button onClick={() => onAcknowledge(item.id)} className="nudge-inverse-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  fixedContainer: {
    position: 'fixed' as const,
    bottom: '32px',
    right: '32px',
    left: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 9999,
    pointerEvents: 'none' as const,
  },
  header: {
    padding: '14px 20px',
    background: 'rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    pointerEvents: 'auto' as const,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  whiteIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--on-primary)',
  },
  eyebrow: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '1px',
  },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    pointerEvents: 'auto' as const,
  },
  summaryText: {
    fontSize: '22px',
    letterSpacing: '-0.2px',
    lineHeight: 1.2,
    margin: 0,
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  tagPill: {
    background: 'rgba(0, 0, 0, 0.12)',
    color: 'var(--on-primary)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  footer: {
    padding: '12px 20px',
    background: 'rgba(0, 0, 0, 0.15)',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    pointerEvents: 'auto' as const,
  }
};

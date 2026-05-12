import React from 'react';
import { MementoItem } from '../types';

interface MemoryFeedProps {
  items: MementoItem[];
  onUpdateStatus: (id: string, status: MementoItem['status']) => void;
}

export const MemoryFeed: React.FC<MemoryFeedProps> = ({ items, onUpdateStatus }) => {
  const sortedItems = items
    .filter((item) => item.status !== 'archived')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .memory-card-anthropic {
          background: var(--surface-dark-elevated);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: border-color 0.15s ease;
          position: relative;
        }
        .memory-card-anthropic:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }
        .surfaced-anthropic-glow {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 1px var(--primary) !important;
        }
        .archive-badge-anthropic {
          background: rgba(232, 165, 90, 0.1);
          color: var(--accent-amber);
          border: 1px solid rgba(232, 165, 90, 0.2);
        }
        .surfaced-badge-anthropic {
          background: rgba(93, 184, 166, 0.1);
          color: var(--accent-teal);
          border: 1px solid rgba(93, 184, 166, 0.2);
        }
        .action-archive-btn-dark {
          background: transparent;
          border: none;
          color: var(--on-dark-soft);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .action-archive-btn-dark:hover {
          color: var(--error);
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>

      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>
            PERSISTENT BUFFER
          </span>
          <h3 className="font-editorial-display-dark" style={styles.title}>
            Memory Stream
          </h3>
        </div>
        <span style={styles.countBadge}>
          {items.length} SEEDED
        </span>
      </div>

      {sortedItems.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p style={styles.emptyTitle}>Stream buffer currently untriggered</p>
          <p style={styles.emptySubtext}>
            Speak vocal items into the capture mic above or supply parameter payloads to trigger chronological evaluations.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {sortedItems.map((item) => {
            const isSurfaced = item.status === 'surfaced';
            const isArchive = item.isRememberThisArchive;

            return (
              <div 
                key={item.id} 
                className={`memento-card memory-card memory-card-anthropic ${
                  isSurfaced ? 'surfaced-anthropic-glow' : ''
                }`}
                style={{
                  borderLeft: isSurfaced 
                    ? '3px solid var(--primary)' 
                    : isArchive 
                    ? '3px solid var(--accent-amber)' 
                    : '3px solid var(--accent-teal)'
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.metaRow}>
                    {isArchive && (
                      <span style={{ ...styles.typeTag, ...styles.archiveTag }}>
                        📑 AI DIGEST
                      </span>
                    )}
                    {isSurfaced && (
                      <span style={{ ...styles.typeTag, ...styles.surfacedTag }}>
                        ✨ NUDGED
                      </span>
                    )}
                    <span style={styles.timestamp}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {item.status !== 'archived' && (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'archived')}
                      className="action-archive-btn-dark"
                      title="Archive memory node"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                </div>

                <div style={styles.contentArea}>
                  {isArchive ? (
                    <div style={styles.summaryBlock}>
                      <span style={styles.summaryLabel}>
                        SYNTHESIZED MATRIX RULES:
                      </span>
                      <div style={styles.summaryContent}>
                        {item.summary.split('\n').map((line, lIdx) => (
                          <p key={lIdx} style={styles.summaryLine}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={styles.summaryText}>{item.summary || item.rawInput}</p>
                  )}

                  {!isArchive && item.summary && item.summary !== item.rawInput && (
                    <p className="font-editorial-mono" style={styles.rawTextPreview}>
                      "{item.rawInput}"
                    </p>
                  )}
                </div>

                {/* Highly decoupled Anthropic label variables */}
                <div style={styles.triggersFooter}>
                  {item.triggers.where?.map((t, idx) => (
                    <span 
                      key={`w-${idx}`} 
                      style={{ 
                        ...styles.badge, 
                        background: 'var(--tag-where)', 
                        borderColor: 'var(--tag-where-border)', 
                        color: 'var(--tag-where-text)' 
                      }}
                    >
                      📍 {t}
                    </span>
                  ))}
                  {item.triggers.who?.map((t, idx) => (
                    <span 
                      key={`who-${idx}`} 
                      style={{ 
                        ...styles.badge, 
                        background: 'var(--tag-who)', 
                        borderColor: 'var(--tag-who-border)', 
                        color: 'var(--tag-who-text)' 
                      }}
                    >
                      👥 {t}
                    </span>
                  ))}
                  {item.triggers.activity?.map((t, idx) => (
                    <span 
                      key={`act-${idx}`} 
                      style={{ 
                        ...styles.badge, 
                        background: 'var(--tag-activity)', 
                        borderColor: 'var(--tag-activity-border)', 
                        color: 'var(--tag-activity-text)' 
                      }}
                    >
                      ⚡ {t}
                    </span>
                  ))}
                  {item.triggers.when?.map((t, idx) => (
                    <span 
                      key={`when-${idx}`} 
                      style={{ 
                        ...styles.badge, 
                        background: 'rgba(255, 255, 255, 0.04)', 
                        borderColor: 'rgba(255, 255, 255, 0.1)', 
                        color: 'var(--on-dark-soft)' 
                      }}
                    >
                      🕒 {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  eyebrow: {
    color: 'var(--muted-soft)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '4px',
  },
  title: {
    fontSize: '28px',
    letterSpacing: '-0.3px',
    lineHeight: 1.15,
  },
  countBadge: {
    background: 'var(--surface-dark-elevated)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2px 8px',
    borderRadius: '100px',
    color: 'var(--on-dark-soft)',
    fontSize: '11px',
    fontWeight: 500,
  },
  emptyState: {
    background: 'var(--surface-dark-elevated)',
    borderRadius: '12px',
    padding: '32px 24px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  emptyTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--on-dark)',
  },
  emptySubtext: {
    fontSize: '13px',
    color: 'var(--on-dark-soft)',
    maxWidth: '380px',
    lineHeight: 1.55,
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  typeTag: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: '4px',
  },
  archiveTag: {
    background: 'rgba(232, 165, 90, 0.1)',
    color: 'var(--accent-amber)',
    border: '1px solid rgba(232, 165, 90, 0.2)',
  },
  surfacedTag: {
    background: 'rgba(93, 184, 166, 0.1)',
    color: 'var(--accent-teal)',
    border: '1px solid rgba(93, 184, 166, 0.2)',
  },
  timestamp: {
    color: 'var(--on-dark-soft)',
    fontSize: '12px',
  },
  contentArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  summaryText: {
    fontSize: '15px',
    color: 'var(--on-dark)',
    lineHeight: 1.55,
    fontWeight: 400,
  },
  rawTextPreview: {
    color: 'var(--muted-soft)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    paddingLeft: '10px',
    marginTop: '2px',
    fontSize: '13px',
  },
  summaryBlock: {
    background: 'var(--surface-dark)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '14px',
    marginTop: '4px',
  },
  summaryLabel: {
    color: 'var(--accent-amber)',
    fontSize: '12px',
    display: 'block',
    marginBottom: '6px',
    fontWeight: 500,
  },
  summaryContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  summaryLine: {
    fontSize: '14px',
    color: 'var(--on-dark)',
    lineHeight: 1.55,
  },
  triggersFooter: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginTop: '14px',
  },
  badge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '100px',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 500,
  }
};

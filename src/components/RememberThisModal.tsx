import React, { useState } from 'react';
import { summarizeRememberThis } from '../utils/gemini';
import { AIContextExtraction, MementoItem } from '../types';

interface RememberThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MementoItem) => void;
}

export const RememberThisModal: React.FC<RememberThisModalProps> = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    bullets: string[];
    extraction: AIContextExtraction;
  } | null>(null);

  if (!isOpen) return null;

  const handleSummarize = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setResult(null);
    try {
      const res = await summarizeRememberThis(trimmed);
      setResult({
        bullets: res.summaryBullets,
        extraction: res.extraction,
      });
    } catch (err) {
      console.error('Failed to summarize:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToFeed = () => {
    if (!result) return;

    const newItem: MementoItem = {
      id: `memento-remember-${Date.now()}`,
      rawInput: content,
      summary: result.bullets.map(b => `• ${b}`).join('\n'),
      createdAt: new Date().toISOString(),
      status: 'pending',
      triggers: {
        when: result.extraction.when || [],
        where: result.extraction.where || [],
        who: result.extraction.who || [],
        activity: result.extraction.contextTriggers || [],
      },
      isRememberThisArchive: true,
    };

    onSave(newItem);
    setContent('');
    setResult(null);
    onClose();
  };

  const handleReset = () => {
    setContent('');
    setResult(null);
  };

  return (
    <div style={styles.overlay}>
      <style>{`
        .anthropic-modal-card {
          background: var(--canvas);
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          max-width: 680px;
          border: 1px solid var(--hairline);
          box-shadow: 0 20px 40px rgba(20, 20, 19, 0.1);
        }
        .anthropic-modal-textarea {
          width: 100%;
          background: var(--surface-card);
          border: 1px solid var(--hairline);
          border-radius: 8px; /* Strict rounded.md rule */
          padding: 16px;
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.55;
          resize: vertical;
          outline: none;
          transition: border-color 0.15s;
        }
        .anthropic-modal-textarea:focus {
          border-color: var(--primary);
        }
        .anthropic-modal-textarea::placeholder {
          color: var(--muted);
        }
      `}</style>

      <div className="anthropic-modal-card animate-fade-in">
        {/* Editorial Header Strip */}
        <div style={styles.header}>
          <div style={styles.headerTitleRow}>
            <span style={styles.coralIndicator}></span>
            <h3 className="font-editorial-display" style={styles.titleText}>
              Remember This Archive
            </h3>
          </div>
          <button onClick={onClose} className="btn-anthropic-link" style={styles.closeBtn} title="Close dialog">
            Close
          </button>
        </div>

        {/* Dialog Content Floor */}
        <div style={styles.body}>
          {!result && !isLoading && (
            <div style={styles.stepContainer}>
              <div style={styles.labelRow}>
                <span style={styles.labelText}>
                  Supply source document text logs, technical manuals, or instructions:
                </span>
                <span style={styles.charCount}>
                  {content.length}/3000
                </span>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.substring(0, 3000))}
                placeholder="E.g. Complete long-form parameter files, continuous specifications, verbose multi-step tasks..."
                className="anthropic-modal-textarea"
                rows={8}
              />

              <div style={styles.actionsRow}>
                <button 
                  onClick={handleReset} 
                  className="btn-anthropic-secondary"
                  style={{ height: '36px', padding: '0 16px' }}
                  disabled={!content}
                >
                  Clear
                </button>
                <button
                  onClick={handleSummarize}
                  disabled={!content.trim()}
                  className="btn-anthropic-primary"
                  style={{ height: '36px', padding: '0 20px' }}
                >
                  Synthesize with AI
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div style={styles.loadingWrapper}>
              <div style={styles.spinnerLg}></div>
              <h4 className="font-editorial-display" style={styles.loadingHeading}>
                Synthesizing Source Text...
              </h4>
              <p style={styles.loadingSub}>
                Extracting core action intents, activity vectors, and relational metadata nodes.
              </p>
            </div>
          )}

          {result && !isLoading && (
            <div style={styles.stepContainer}>
              <div style={styles.successStrip}>
                <span style={styles.successStripText}>✓ Cognitive structuring successfully buffered</span>
              </div>

              <div style={styles.resultsBlock}>
                <span style={styles.sectionEyebrow}>
                  ACTIONABLE INTENT SUMMARY
                </span>
                <div style={styles.bulletsList}>
                  {result.bullets.map((b, idx) => (
                    <div key={idx} style={styles.bulletRow}>
                      <span style={styles.bulletDot}>•</span>
                      <p style={styles.bulletText}>{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.resultsBlock}>
                <span style={styles.sectionEyebrow}>
                  DERIVED SPATIAL MATRIX TAGS
                </span>
                <div style={styles.tagsContainer}>
                  {result.extraction.where.map((t, i) => (
                    <span key={`where-${i}`} style={{ ...styles.badge, background: 'var(--tag-where)', borderColor: 'var(--tag-where-border)', color: 'var(--tag-where-text)' }}>
                      📍 {t}
                    </span>
                  ))}
                  {result.extraction.who.map((t, i) => (
                    <span key={`who-${i}`} style={{ ...styles.badge, background: 'var(--tag-who)', borderColor: 'var(--tag-who-border)', color: 'var(--tag-who-text)' }}>
                      👥 {t}
                    </span>
                  ))}
                  {result.extraction.contextTriggers.map((t, i) => (
                    <span key={`act-${i}`} style={{ ...styles.badge, background: 'var(--tag-activity)', borderColor: 'var(--tag-activity-border)', color: 'var(--tag-activity-text)' }}>
                      ⚡ {t}
                    </span>
                  ))}
                  {result.extraction.when.map((t, i) => (
                    <span key={`when-${i}`} style={{ ...styles.badge, background: 'var(--surface-soft)', borderColor: 'var(--hairline)', color: 'var(--muted)' }}>
                      🕒 {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.finalActions}>
                <button onClick={() => setResult(null)} className="btn-anthropic-secondary" style={{ height: '36px', padding: '0 16px' }}>
                  Edit Text
                </button>
                <button onClick={handleSaveToFeed} className="btn-anthropic-primary" style={{ height: '36px', padding: '0 20px' }}>
                  Commit to Memory Buffer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(20, 20, 19, 0.7)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px',
  },
  header: {
    background: 'var(--surface-card)',
    padding: '16px 24px',
    borderBottom: '1px solid var(--hairline)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  coralIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--primary)',
  },
  titleText: {
    fontSize: '22px',
    letterSpacing: '-0.2px',
    margin: 0,
  },
  closeBtn: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  body: {
    padding: '24px',
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: '13px',
    color: 'var(--body)',
    fontWeight: 500,
  },
  charCount: {
    color: 'var(--muted)',
    fontSize: '12px',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  loadingWrapper: {
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  spinnerLg: {
    width: '24px',
    height: '24px',
    border: '2px solid var(--hairline)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spinLoaderWarm 0.8s infinite linear',
    marginBottom: '16px',
  },
  loadingHeading: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  loadingSub: {
    fontSize: '14px',
    color: 'var(--body)',
    maxWidth: '320px',
  },
  successStrip: {
    background: 'var(--surface-card)',
    border: '1px solid var(--hairline)',
    padding: '8px 16px',
    borderRadius: '6px',
  },
  successStripText: {
    color: 'var(--primary)',
    fontSize: '13px',
    fontWeight: 500,
  },
  resultsBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  sectionEyebrow: {
    color: 'var(--muted-soft)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '1px',
  },
  bulletsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    background: 'var(--surface-soft)',
    border: '1px solid var(--hairline)',
    padding: '16px',
    borderRadius: '8px',
  },
  bulletRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  bulletDot: {
    color: 'var(--primary)',
    fontWeight: 500,
  },
  bulletText: {
    fontSize: '14px',
    color: 'var(--ink)',
    lineHeight: 1.55,
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  badge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '100px',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 500,
  },
  finalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px',
  }
};

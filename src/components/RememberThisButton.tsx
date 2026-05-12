import React from 'react';

interface RememberThisButtonProps {
  onClick: () => void;
}

export const RememberThisButton: React.FC<RememberThisButtonProps> = ({ onClick }) => {
  return (
    <div style={styles.container}>
      <button 
        onClick={onClick} 
        className="btn-anthropic-secondary remember-btn" 
        title="Archive complex text or paste dense content for AI bullet reduction"
      >
        <span style={styles.iconWrapper}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </span>
        <span style={styles.text}>Remember This Portal</span>
        <span style={styles.badge}>
          AI Digest
        </span>
      </button>

      <style>{`
        .remember-btn {
          width: 100%;
          border-color: var(--hairline);
          background: var(--canvas);
        }
        .remember-btn:hover {
          background: var(--surface-card);
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface-soft)',
    color: 'var(--primary)',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '1px solid var(--hairline)',
  },
  text: {
    fontWeight: 500,
    fontSize: '14px',
    color: 'var(--ink)',
  },
  badge: {
    background: 'rgba(204, 120, 92, 0.08)',
    color: 'var(--primary)',
    padding: '2px 8px',
    borderRadius: '100px',
    border: '1px solid rgba(204, 120, 92, 0.15)',
    fontSize: '11px',
    fontWeight: 500,
  }
};

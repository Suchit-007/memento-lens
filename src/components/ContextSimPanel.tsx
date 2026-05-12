import React from 'react';
import { useSimulation } from '../context/SimulationContext';

export const ContextSimPanel: React.FC = () => {
  const { state, setLocation, setCompanion, setActivity, resetAll } = useSimulation();

  const LOCATIONS = ['Pharmacy', 'Grocery Store', 'Office', 'Home', 'Hardware Store'];
  const COMPANIONS = ['Manager', 'Sarah', 'Partner', 'Alone'];
  const ACTIVITIES = ['Driving', 'Walking', 'Working', 'High Focus', 'Morning Routine'];

  const hasActiveSim = state.currentLocation || state.currentCompanion || state.currentActivity;

  return (
    <div style={styles.container}>
      <style>{`
        .anthropic-select {
          width: 100%;
          height: 40px;
          background: var(--surface-dark-elevated);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px; /* Strict rounded.md rule */
          padding: 0 12px;
          color: var(--on-dark);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .anthropic-select:focus, .anthropic-select:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }
        .anthropic-select option {
          background: var(--surface-dark);
          color: var(--on-dark);
        }
        .sim-pill-dark {
          background: var(--surface-dark-elevated);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--on-dark-soft);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .sim-pill-dark:hover {
          background: #312e2a;
          color: var(--on-dark);
        }
        .pill-active-loc {
          background: var(--tag-where) !important;
          border-color: var(--tag-where-border) !important;
          color: var(--tag-where-text) !important;
          font-weight: 600;
        }
        .pill-active-who {
          background: var(--tag-who) !important;
          border-color: var(--tag-who-border) !important;
          color: var(--tag-who-text) !important;
          font-weight: 600;
        }
        .pill-active-act {
          background: var(--tag-activity) !important;
          border-color: var(--tag-activity-border) !important;
          color: var(--tag-activity-text) !important;
          font-weight: 600;
        }
        .reset-btn-anthropic {
          background: rgba(198, 69, 69, 0.15);
          color: #ff7e7e;
          border: 1px solid rgba(198, 69, 69, 0.3);
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .reset-btn-anthropic:hover {
          background: rgba(198, 69, 69, 0.25);
        }
      `}</style>

      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>
            SPATIAL MATRIX
          </span>
          <h3 className="font-editorial-display-dark" style={styles.title}>
            Context Controller
          </h3>
        </div>

        {hasActiveSim && (
          <button 
            onClick={resetAll} 
            className="reset-btn-anthropic" 
            title="Clear environment state buffers"
          >
            Reset State
          </button>
        )}
      </div>

      <p style={styles.subtitle}>
        Simulate real-world client context intersections below to verify autonomous Just-In-Time memory surface triggers.
      </p>

      <div style={styles.formGrid}>
        {/* Sim Location Select */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            📍 Location Intersect
          </label>
          <select
            aria-label="Location"
            value={state.currentLocation || ''}
            onChange={(e) => setLocation(e.target.value || null)}
            className="anthropic-select"
          >
            <option value="">📍 Location (None)</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          
          <div style={styles.pillsRow}>
            {LOCATIONS.map((loc) => {
              const isActive = state.currentLocation === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setLocation(isActive ? null : loc)}
                  className={`sim-pill-dark ${isActive ? 'pill-active-loc' : ''}`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sim Companion Select */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            👥 Companion Intersect
          </label>
          <select
            aria-label="Companion"
            value={state.currentCompanion || ''}
            onChange={(e) => setCompanion(e.target.value || null)}
            className="anthropic-select"
          >
            <option value="">👥 Companion (None)</option>
            {COMPANIONS.map((who) => (
              <option key={who} value={who}>{who}</option>
            ))}
          </select>

          <div style={styles.pillsRow}>
            {COMPANIONS.map((who) => {
              const isActive = state.currentCompanion === who;
              return (
                <button
                  key={who}
                  onClick={() => setCompanion(isActive ? null : who)}
                  className={`sim-pill-dark ${isActive ? 'pill-active-who' : ''}`}
                >
                  {who}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sim Activity Select */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            ⚡ Activity State Intersect
          </label>
          <select
            aria-label="Activity"
            value={state.currentActivity || ''}
            onChange={(e) => setActivity(e.target.value || null)}
            className="anthropic-select"
          >
            <option value="">⚡ Activity (None)</option>
            {ACTIVITIES.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          <div style={styles.pillsRow}>
            {ACTIVITIES.map((act) => {
              const isActive = state.currentActivity === act;
              return (
                <button
                  key={act}
                  onClick={() => setActivity(isActive ? null : act)}
                  className={`sim-pill-dark ${isActive ? 'pill-active-act' : ''}`}
                >
                  {act}
                </button>
              );
            })}
          </div>
        </div>
      </div>
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
  subtitle: {
    fontSize: '14px',
    color: 'var(--on-dark-soft)',
    lineHeight: 1.55,
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    color: 'var(--on-dark-soft)',
    fontSize: '13px',
    fontWeight: 500,
  },
  pillsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginTop: '2px',
  }
};

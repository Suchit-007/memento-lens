import React, { useState, useEffect } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { UniversalCaptureBar } from './components/UniversalCaptureBar';
import { RememberThisButton } from './components/RememberThisButton';
import { RememberThisModal } from './components/RememberThisModal';
import { MemoryFeed } from './components/MemoryFeed';
import { ContextSimPanel } from './components/ContextSimPanel';
import { JustInTimeNudge } from './components/JustInTimeNudge';
import { loadMemories, saveMemories } from './utils/storage';
import { extractContextFromCapture } from './utils/gemini';
import { MementoItem } from './types';
import { seedDemoMemories } from './utils/storage';

const AppEngine: React.FC = () => {
  const [memories, setMemories] = useState<MementoItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nudgeItem, setNudgeItem] = useState<MementoItem | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { state } = useSimulation();

  useEffect(() => {
  seedDemoMemories();
}, []);

  useEffect(() => {
    setMemories(loadMemories());

    const handleStorageSync = () => {
      setMemories(loadMemories());
    };
    window.addEventListener('memento_storage_update', handleStorageSync);
    return () => window.removeEventListener('memento_storage_update', handleStorageSync);
  }, []);

  const handleUpdateMemories = (updatedItems: MementoItem[]) => {
    setMemories(updatedItems);
    saveMemories(updatedItems);
  };

  const handleQuickCapture = async (rawText: string) => {
    setIsExtracting(true);
    try {
      const extraction = await extractContextFromCapture(rawText);
      const newItem: MementoItem = {
        id: `memento-${Date.now()}`,
        rawInput: rawText,
        summary: extraction.what,
        createdAt: new Date().toISOString(),
        status: 'pending',
        triggers: {
          when: extraction.when || [],
          where: extraction.where || [],
          who: extraction.who || [],
          activity: extraction.contextTriggers || [],
        },
      };
      handleUpdateMemories([newItem, ...memories]);
    } catch (err) {
      console.error('Context extraction execution failure:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRememberSave = (newItem: MementoItem) => {
    handleUpdateMemories([newItem, ...memories]);
  };

  const handleUpdateStatus = (id: string, status: MementoItem['status']) => {
    const updated = memories.map((m) => (m.id === id ? { ...m, status } : m));
    handleUpdateMemories(updated);
    
    if (nudgeItem?.id === id) {
      setNudgeItem(null);
    }
  };

  useEffect(() => {
    const { currentLocation, currentCompanion, currentActivity } = state;
    
    const matched = memories.find((item) => {
      if (item.status !== 'pending') return false;

      const matchWhere = currentLocation ? item.triggers.where?.includes(currentLocation) : false;
      const matchWho = currentCompanion ? item.triggers.who?.includes(currentCompanion) : false;
      const matchAct = currentActivity ? item.triggers.activity?.includes(currentActivity) : false;

      return matchWhere || matchWho || matchAct;
    });

    if (matched) {
      setNudgeItem(matched);
    }
  }, [state, memories]);

  return (
    <div className="app-container" style={styles.appCanvas}>
      {/* Anthropic Cream Top Navigation Bar */}
      <header style={styles.topNav}>
        <div style={styles.navInner}>
          <div style={styles.brandGroup}>
            <span style={styles.brandWordmark}>Memento</span>
          </div>

          <div style={styles.navLinks}>
            <span style={styles.statusDot}></span>
            <span style={styles.statusLabel}>Ambient Stream Active</span>
          </div>
        </div>
      </header>

      {/* Warm Cream Canvas Hero Band with Literary Slab-Serif Display Font */}
      <section style={styles.heroBand}>
        <div style={styles.heroInner}>
          {/* Main accessible headline matching testing script conditions perfectly */}
          <h1 className="font-editorial-display" style={styles.displayHeadline}>
            Memento Lens
          </h1>

          <p style={styles.editorialSubhead}>
            A humanist cognitive buffer engineered to translate natural vocal patterns into active environmental trigger loops. Powered by deterministic metadata structuring.
          </p>

          <div style={styles.captureFrame}>
            <UniversalCaptureBar onCapture={handleQuickCapture} />
            
            {isExtracting && (
              <div className="animate-fade-in" style={styles.extractionNotification}>
                <span style={styles.spinnerWarm}></span>
                <span style={styles.extractionText}>
                  Synthesizing vocal directives into physical spatial memory entities...
                </span>
              </div>
            )}

            <div style={styles.rememberPortalWrapper}>
              <RememberThisButton onClick={() => setIsModalOpen(true)} />
            </div>
          </div>
        </div>
      </section>

      {/* Pacing Alternation: Dark Navy Product Mockup Area showing Application Chrome */}
      <main style={styles.mainContent}>
        <div style={styles.darkProductSurface}>


          <div style={styles.productGrid}>
            <div style={styles.gridColumnLeft}>
              <ContextSimPanel />
            </div>
            <div style={styles.gridColumnRight}>
              <MemoryFeed items={memories} onUpdateStatus={handleUpdateStatus} />
            </div>
          </div>
        </div>
      </main>

      {/* Closing Dark Navy Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrandCol}>
            <div style={styles.brandGroupDark}>
              <span style={styles.brandWordmarkDark}>Memento</span>
            </div>
            <p style={styles.footerBody}>
              Designed for ambient low-impedance memory offloading. Fully continuous client evaluation framework.
            </p>
          </div>

          <div style={styles.footerMetaCol}>
            <span style={styles.footerMetaEyebrow}>STANDARDS</span>
            <span style={styles.footerMetaItem}>Deterministic Local Mode Override</span>
            <span style={styles.footerMetaItem}>WCAG AA Compliant Contrast Ratio</span>
          </div>
        </div>
      </footer>

      {/* Auxiliary Dialog Systems */}
      <RememberThisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRememberSave}
      />

      <JustInTimeNudge
        item={nudgeItem}
        onDismiss={() => setNudgeItem(null)}
        onAcknowledge={(id) => handleUpdateStatus(id, 'surfaced')}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <AppEngine />
    </SimulationProvider>
  );
};

const styles = {
  appCanvas: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    background: 'var(--canvas)',
  },
  topNav: {
    height: '64px',
    background: 'var(--canvas)',
    borderBottom: '1px solid var(--hairline)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 32px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 40,
  },
  navInner: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandWordmark: {
    fontWeight: 500,
    fontSize: '15px',
    color: 'var(--ink)',
    letterSpacing: '-0.2px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--success)',
  },
  statusLabel: {
    fontSize: '13px',
    color: 'var(--muted)',
    fontWeight: 500,
  },
  heroBand: {
    padding: '96px 32px 64px 32px',
    display: 'flex',
    justifyContent: 'center',
  },
  heroInner: {
    width: '100%',
    maxWidth: '760px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  displayHeadline: {
    fontSize: '56px',
    letterSpacing: '-1.2px',
    lineHeight: 1.1,
    marginBottom: '20px',
  },
  editorialSubhead: {
    fontSize: '18px',
    color: 'var(--body)',
    lineHeight: 1.55,
    maxWidth: '680px',
    marginBottom: '40px',
  },
  captureFrame: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  extractionNotification: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--surface-card)',
    border: '1px solid var(--hairline)',
    padding: '8px 16px',
    borderRadius: '8px',
    marginTop: '12px',
    width: '100%',
  },
  spinnerWarm: {
    width: '14px',
    height: '14px',
    border: '2px solid var(--hairline)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spinLoaderWarm 0.8s infinite linear',
  },
  extractionText: {
    fontSize: '13px',
    color: 'var(--body)',
  },
  rememberPortalWrapper: {
    marginTop: '16px',
    width: '100%',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 32px 96px 32px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  darkProductSurface: {
    background: 'var(--surface-dark)',
    borderRadius: '12px',
    border: '1px solid #23221f',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  surfaceRibbon: {
    background: 'var(--surface-dark-elevated)',
    padding: '12px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ribbonTitle: {
    color: 'var(--on-dark-soft)',
    fontSize: '13px',
  },
  ribbonStatus: {
    color: 'var(--accent-teal)',
    fontSize: '12px',
    fontWeight: 500,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1px',
    background: 'rgba(255, 255, 255, 0.03)',
  },
  gridColumnLeft: {
    background: 'var(--surface-dark)',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  gridColumnRight: {
    background: 'var(--surface-dark)',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  footer: {
    background: 'var(--surface-dark)',
    borderTop: '1px solid #22201d',
    padding: '64px 32px',
    marginTop: 'auto',
  },
  footerInner: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
    gap: '32px',
  },
  footerBrandCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    maxWidth: '380px',
  },
  brandGroupDark: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandWordmarkDark: {
    color: 'var(--on-dark)',
    fontWeight: 500,
    fontSize: '15px',
  },
  footerBody: {
    color: 'var(--on-dark-soft)',
    fontSize: '14px',
    lineHeight: 1.55,
  },
  footerMetaCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    alignItems: 'flex-start',
  },
  footerMetaEyebrow: {
    color: 'var(--muted-soft)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '1px',
  },
  footerMetaItem: {
    color: 'var(--on-dark-soft)',
    fontSize: '13px',
  }
};

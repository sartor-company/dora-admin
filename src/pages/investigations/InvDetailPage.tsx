import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InfoCell, InfoGrid } from '../../components/ui/InfoGrid';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { doraFeatures } from '../../data/mock';

const heroStats = [
  { label: 'DORA Score', value: '23', large: true },
  { label: 'Scan Date', value: 'Apr 15, 2026' },
  { label: 'Product', value: 'Carabiner Holder' },
  { label: 'Location', value: 'Shanghai, CN' },
];

export function InvDetailPage() {
  const { navigateLegacy } = useApp();
  const { openModal } = useModal();
  const { showToast } = useToast();

  return (
    <>
      <BackLink onClick={() => navigateLegacy('pg-inv-queue')}>
        ← Back to Investigation Queue
      </BackLink>

      <div className="hero">
        <div className="title-row" style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>INV-2024-087</div>
          <Badge variant="br">P1 PRIORITY</Badge>
          <Badge variant="br">OPEN</Badge>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
          BATCH MISMATCH — QR&apos;d batch ≠ PIN batch · Sartor Health Co. Ltd · DORA AI flagged
        </p>
        <div className="hero-stats">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <div className="stat-banner__label">{stat.label}</div>
              <div
                className={stat.large ? 'stat-banner__value' : undefined}
                style={
                  stat.large
                    ? undefined
                    : {
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#fff',
                        marginTop: 4,
                      }
                }
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="inv-action-bar">
        <Button variant="danger" onClick={() => openModal('flag-batch-inv')}>
          🚩 Flag Batch
        </Button>
        <Button variant="success" onClick={() => openModal('clear-fp')}>
          ✓ Clear False Positive
        </Button>
        <Button onClick={() => openModal('evidence-bundle')}>↗ Generate Evidence Bundle</Button>
        <select className="inp">
          <option>OPEN</option>
          <option>UNDER REVIEW</option>
          <option>CLEARED</option>
          <option>CONFIRMED COUNTERFEIT</option>
        </select>
        <Button onClick={() => showToast('Investigation status saved')}>Save Status</Button>
      </div>

      <div className="r2">
        <Card>
          <div className="ct" style={{ marginBottom: 11 }}>
            DORA AI Feature Scores{' '}
            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text3)' }}>
              (Internal — Admin Only)
            </span>
          </div>
          {doraFeatures.map((f) => (
            <div key={f.label} className="frow">
              <div style={{ flex: 1, color: 'var(--text2)' }}>{f.label}</div>
              <div className="fbar">
                <div className="ffill" style={{ width: `${f.score}%`, background: f.color }} />
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  minWidth: 24,
                  textAlign: 'right',
                  color: f.textColor,
                }}
              >
                {f.score}
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Overall DORA Score</span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                color: 'var(--rt)',
              }}
            >
              23 / 100
            </span>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
            Scored by{' '}
            <a href="https://verify.dorascan.ai" target="_blank" rel="noreferrer" style={{ color: 'var(--bt)' }}>
              DORA AI
            </a>{' '}
            at scan time. Scores below 50 indicate likely counterfeit.
          </div>
        </Card>

        <div>
          <Card style={{ marginBottom: 11 }}>
            <div className="ct" style={{ marginBottom: 10 }}>
              Batch & PIN Details
            </div>
            <InfoGrid cols={2}>
              <InfoCell label="Batch QR'd" value="BATCH-042" valueStyle={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: 'var(--rt)' }} />
              <InfoCell label="PIN Batch" value="BATCH-038" valueStyle={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: 'var(--rt)' }} />
              <InfoCell label="PIN Status" value="Used · Different User" valueStyle={{ fontWeight: 600, color: 'var(--at)' }} />
              <InfoCell label="Current User" value="user_821" valueStyle={{ fontFamily: "'DM Mono', monospace" }} />
            </InfoGrid>
          </Card>

          <Card style={{ marginBottom: 11 }}>
            <div className="ct" style={{ marginBottom: 10 }}>
              Device & Location Data
            </div>
            <div style={{ fontSize: 12, display: 'grid', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: 'var(--text3)' }}>Device fingerprint</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>a7#x1b4d…e41c</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: 'var(--text3)' }}>IP Address</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>182.70.245.138</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: 'var(--text3)' }}>GPS</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>31.2°N, 121.5°E</span>
              </div>
              <div
                style={{
                  marginTop: 5,
                  padding: 7,
                  background: 'var(--rb)',
                  borderRadius: 5,
                  color: 'var(--rt)',
                  fontWeight: 500,
                  fontSize: 11,
                }}
              >
                ⚠ Pattern: 4 failed scans from this device across 4 batches in 4 days
              </div>
            </div>
          </Card>

          <Card>
            <div className="ct" style={{ marginBottom: 8 }}>
              Investigation Notes
            </div>
            <textarea className="inp" rows={3} placeholder="Add notes..." style={{ resize: 'vertical' }} />
            <Button variant="secondary" size="sm" style={{ marginTop: 7 }} onClick={() => showToast('Notes saved')}>
              Save Notes
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}

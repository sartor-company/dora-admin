import { Badge } from '../../components/ui/Badge';
import { BackLink } from '../../components/ui/BackLink';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { InfoCell, InfoGrid } from '../../components/ui/InfoGrid';
import { IntegrationBanner } from '../../components/ui/IntegrationBanner';
import { StatBanner } from '../../components/ui/StatBanner';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';

export function BatchDetailPage() {
  const { navigateLegacy } = useApp();
  const { openModal } = useModal();

  return (
    <>
      <BackLink onClick={() => navigateLegacy('pg-batch-list')}>← Back to Batches</BackLink>

      <div className="int-banners">
        <IntegrationBanner
          variant="crm"
          label="Sartor CRM"
          description="Full delivery tracking, LPO management and rep confirmations live here"
          href="https://crm.sartor.ng"
          linkText="Open CRM ↗"
        />
        <IntegrationBanner
          variant="dora"
          label="DORA AI"
          description="Consumer-facing verification for this batch"
          href="https://verify.dorascan.ai"
          linkText="View ↗"
        />
      </div>

      <div className="pghead">
        <div className="title-row">
          <div className="pgtitle">BATCH-042</div>
          <Badge variant="bg">Active</Badge>
        </div>
        <div className="pghead-actions">
          <Button variant="secondary" size="sm" onClick={() => openModal('batch-pause')}>
            ▮▮ Pause
          </Button>
          <Button variant="danger" size="sm" onClick={() => openModal('batch-flag')}>
            🚩 Flag
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openModal('batch-download')}>
            ↓ Download Package
          </Button>
        </div>
      </div>

      <StatBanner
        stats={[
          { label: 'Quantity', value: '600' },
          { label: 'Authentications', value: '234' },
          { label: 'Total Scans', value: '567' },
          { label: 'Auth Rate', value: '41.3%', valueColor: 'var(--green)' },
        ]}
      />

      <div className="r2">
        <Card>
          <div className="ct" style={{ marginBottom: 12 }}>
            Batch Information
          </div>
          <InfoGrid cols={3}>
            <InfoCell label="Product" value="Sartor Hand Sanitiser 500ml" />
            <InfoCell label="Manufacture Date" value="Mar 15, 2026" />
            <InfoCell label="Expiry Date" value="Dec 31, 2028" />
            <InfoCell label="Serial Numbers" value="Auto-generated" />
            <InfoCell label="PIN Format" value="6-digit numeric" />
            <InfoCell label="Units Per Carton" value="24 units" />
          </InfoGrid>
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <CardHeader
            title="Carton Label & Delivery Tracking"
            action={
              <div className="pghead-actions" style={{ marginBottom: 0 }}>
                <Button variant="secondary" size="sm">
                  ↓ Download Carton Label
                </Button>
                <a href="https://crm.sartor.ng" target="_blank" rel="noreferrer" className="btn bpri bsm">
                  View in Sartor CRM ↗
                </a>
              </div>
            }
          />
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: -8, marginBottom: 12 }}>
            Batch QR label for outer cartons — scanned at each handoff: warehouse → driver → retailer
          </div>
          <div className="carton-layout">
            <div
              style={{
                width: 88,
                height: 88,
                background: 'var(--bg2)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border)',
                flexShrink: 0,
                margin: '0 auto',
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 2 }}>▭</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.4 }}>
                BATCH-042
                <br />
                CARTON QR
              </div>
            </div>
            <div>
              <div className="carton-stats">
                <div>
                  <div style={{ color: 'var(--text3)', marginBottom: 2 }}>Batch</div>
                  <div className="mono" style={{ fontWeight: 600, fontSize: 11 }}>
                    BATCH-042
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text3)', marginBottom: 2 }}>Units per carton</div>
                  <div style={{ fontWeight: 600 }}>24 units</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text3)', marginBottom: 2 }}>Total cartons</div>
                  <div style={{ fontWeight: 600 }}>25 cartons</div>
                </div>
              </div>
              <div className="carton-delivery">
                {[
                  { label: 'Despatched', value: '25', bg: 'var(--bg)', color: 'var(--text3)' },
                  { label: 'Delivered', value: '18', bg: 'var(--gb)', color: 'var(--gt)' },
                  { label: 'In Transit', value: '5', bg: 'var(--ab)', color: 'var(--at)' },
                  { label: 'Pending', value: '2', bg: 'var(--bg)', color: 'var(--text3)' },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{ padding: 8, background: s.bg, borderRadius: 6, textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 10, color: s.color, marginBottom: 3 }}>{s.label}</div>
                    <div className="mono" style={{ fontWeight: 700, color: s.color === 'var(--text3)' ? undefined : s.color }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                Retailers confirm delivery by scanning this QR code or entering the SMS delivery code.
                Full delivery tracking, LPO management and payments live in{' '}
                <a href="https://crm.sartor.ng" target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                  Sartor CRM ↗
                </a>
                .
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="DORA AI Training" action={<Badge variant="bg">Complete ✓</Badge>} />
          <div style={{ padding: 10, background: 'var(--gb)', borderRadius: 7, fontSize: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 600, color: 'var(--gt)', marginBottom: 6 }}>✓ Model trained — Apr 5, 2026</div>
            <InfoGrid cols={2}>
              <InfoCell label="Front label" value="1 reference image ✓" />
              <InfoCell label="Back label" value="1 reference image ✓" />
            </InfoGrid>
          </div>
          <div style={{ padding: '9px 11px', background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)', marginBottom: 8 }}>
            🎁 <strong>QR code:</strong> Static per product — one QR image shared across all batches.
            <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
              <button type="button" style={{ color: 'var(--bt)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', font: 'inherit' }}>
                ↓ Download SKU QR Image
              </button>
              <a href="https://verify.dorascan.ai" target="_blank" rel="noreferrer" style={{ color: 'var(--bt)', fontWeight: 600, fontSize: 11 }}>
                Preview consumer page ↗
              </a>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => openModal('dora')}>
            Retrain DORA Model
          </Button>
        </Card>
      </div>
    </>
  );
}

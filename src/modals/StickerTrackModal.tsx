import { Button } from '../components/ui/Button';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { StickerTrackPayload } from '../context/ModalContext';

interface Props {
  open: boolean;
  payload?: StickerTrackPayload;
  onClose: () => void;
}

export function StickerTrackModal({ open, payload, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Shipment tracking"
      subtitle={payload?.ref || 'Sticker order'}
      width={440}
    >
      <div style={{ display: 'grid', gap: 0, fontSize: 13, marginBottom: 14 }}>
        {[
          ['Order', payload?.ref || '—'],
          ['Product', payload?.product || '—'],
          ['Status', payload?.status || '—'],
          ['Ordered', payload?.ordered || '—'],
          ['Stickers', payload?.printed != null ? payload.printed.toLocaleString() : '—'],
          ['Tracking', payload?.tracking || 'Awaiting courier confirmation'],
        ].map(([k, v]) => (
          <div
            key={String(k)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              padding: '8px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ color: 'var(--text3)' }}>{k}</span>
            <span style={{ textAlign: 'right', fontWeight: k === 'Tracking' ? 600 : 500 }}>{v}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: 10,
          background: 'var(--bb)',
          borderRadius: 7,
          fontSize: 12,
          color: 'var(--bt)',
          lineHeight: 1.5,
          marginBottom: 8,
        }}
      >
        Tracking number and courier updates are set by Sartor Operations when the shipment leaves the
        print facility. Contact <strong>support@sartor.ng</strong> with your order ref if you need an update.
      </div>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

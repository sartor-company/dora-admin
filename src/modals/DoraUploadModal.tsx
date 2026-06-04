import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { ImgUploadZone } from '../components/ui/ImgUploadZone';
import { Modal, ModalFooter } from '../components/ui/Modal';

type LabelType = '2sided' | '1sided' | '6sided';

interface DoraUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function DoraUploadModal({ open, onClose, onSubmit }: DoraUploadModalProps) {
  const [labelType, setLabelType] = useState<LabelType>('2sided');

  const types: { id: LabelType; label: string; sub: string }[] = [
    { id: '2sided', label: '2-Sided', sub: 'Front + Back' },
    { id: '1sided', label: 'Round/Single', sub: '1 side' },
    { id: '6sided', label: '6-Sided Box', sub: 'Up to 6 sides' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="DORA Training — Upload Reference Images"
      subtitle="BATCH-041 · Carabiner Holder Pack · verify.dorascan.ai"
    >
      <div style={{ padding: '9px 11px', background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)', marginBottom: 13 }}>
        ℹ Provide <strong>1 clear, sharp, high-resolution reference image per side</strong>. DORA uses this
        reference to learn authentic packaging.
      </div>
      <div className="dora-type-picker">
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setLabelType(t.id)}
            style={{
              padding: 9,
              border: labelType === t.id ? '2px solid var(--navy)' : '1px solid var(--border)',
              background: labelType === t.id ? 'var(--bb)' : '#fff',
              borderRadius: 7,
              textAlign: 'center',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: labelType === t.id ? 'var(--bt)' : 'var(--text2)' }}>
              {t.label}
            </div>
            <small style={{ fontWeight: 400, color: 'var(--text3)' }}>{t.sub}</small>
          </button>
        ))}
      </div>
      {labelType === '1sided' && (
        <div className="fg">
          <label className="fi">Label Image (1 image)</label>
          <ImgUploadZone title="Click to upload label" hint="PNG, JPG, TIFF · Max 20MB" />
        </div>
      )}
      {labelType === '2sided' && (
        <>
          <div className="fg">
            <label className="fi">Front Label Image (1 image)</label>
            <ImgUploadZone title="Click to upload front label" hint="PNG, JPG, TIFF · Max 20MB" />
          </div>
          <div className="fg">
            <label className="fi">Back Label Image (1 image)</label>
            <ImgUploadZone title="Click to upload back label" hint="PNG, JPG, TIFF · Max 20MB" />
          </div>
        </>
      )}
      {labelType === '6sided' &&
        ['Top', 'Front', 'Right', 'Back', 'Left', 'Bottom'].map((side) => (
          <div className="fg" key={side}>
            <label className="fi">
              {side} label (1 image{side === 'Front' ? ' *' : ''})
            </label>
            <ImgUploadZone title={`Upload ${side.toLowerCase()} side`} hint="PNG, JPG · Max 20MB" />
          </div>
        ))}
      <div style={{ padding: 9, background: 'var(--ab)', borderRadius: 7, fontSize: 12, color: 'var(--at)', marginTop: 10 }}>
        ⚠ Sartor&apos;s AI team will review images and train the DORA model within 1–3 business days.
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>Submit for Training</Button>
      </ModalFooter>
    </Modal>
  );
}

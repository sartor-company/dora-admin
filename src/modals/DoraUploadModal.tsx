import { useRef, useState } from 'react';
import { labelsApi } from '../api/labels';
import { Button } from '../components/ui/Button';
import { Modal, ModalFooter } from '../components/ui/Modal';
import type { DoraUploadTarget } from '../context/TenantDataContext';

interface DoraUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  target: DoraUploadTarget | null;
}

export function DoraUploadModal({ open, onClose, onSubmit, target }: DoraUploadModalProps) {
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setFrontFile(null);
    setBackFile(null);
    setError('');
    if (frontRef.current) frontRef.current.value = '';
    if (backRef.current) backRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!target) {
      setError('No batch selected for upload.');
      return;
    }
    if (!frontFile || !backFile) {
      setError('Both front and back label images are required.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await labelsApi.upload(target.productId, target.batchId, frontFile, backFile);
      reset();
      onSubmit();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const subtitle = target
    ? `${target.batchNumber} · ${target.productName}`
    : 'Select a batch to upload training images';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="DORA Training — Upload Reference Images"
      subtitle={subtitle}
    >
      <div style={{ padding: '9px 11px', background: 'var(--bb)', borderRadius: 7, fontSize: 12, color: 'var(--bt)', marginBottom: 13 }}>
        ℹ Provide <strong>1 clear, sharp, high-resolution reference image per side</strong>. DORA uses this
        reference to learn authentic packaging.
      </div>
      {error && (
        <div style={{ padding: 9, background: 'var(--rb)', borderRadius: 7, fontSize: 12, color: 'var(--rt)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <div className="fg">
        <label className="fi">Front Label Image *</label>
        <input
          ref={frontRef}
          type="file"
          accept="image/*"
          className="inp"
          onChange={(e) => setFrontFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div className="fg">
        <label className="fi">Back Label Image *</label>
        <input
          ref={backRef}
          type="file"
          accept="image/*"
          className="inp"
          onChange={(e) => setBackFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div style={{ padding: 9, background: 'var(--ab)', borderRadius: 7, fontSize: 12, color: 'var(--at)', marginTop: 10 }}>
        ⚠ Sartor&apos;s AI team will review images and train the DORA model within 1–3 business days.
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={uploading || !target}>
          {uploading ? 'Uploading…' : 'Submit for Training'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

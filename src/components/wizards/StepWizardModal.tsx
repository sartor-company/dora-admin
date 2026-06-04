import { useState, type ReactNode } from 'react';
import { Button } from '../ui/Button';
import { StepIndicator } from '../ui/StepIndicator';

export interface StepDef {
  title: string;
  subtitle: string;
  content: ReactNode;
}

interface StepWizardModalProps {
  open: boolean;
  onClose: () => void;
  steps: StepDef[];
  finishLabel?: string;
  onFinish: () => void;
  width?: number;
  extraFooter?: ReactNode;
}

export function StepWizardModal({
  open,
  onClose,
  steps,
  finishLabel = 'Finish',
  onFinish,
  width = 520,
  extraFooter,
}: StepWizardModalProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      onFinish();
      setStep(0);
    } else {
      setStep((s) => s + 1);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-bg open"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="presentation"
    >
      <div className="modal" style={{ width }} role="dialog" aria-modal="true">
        <div className="mhd">
          <div>
            <div className="mtitle">{current?.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{current?.subtitle}</div>
          </div>
          <button type="button" className="mclose" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
        <StepIndicator total={steps.length} current={step} />
        <div>{current?.content}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            ← Back
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            {extraFooter}
            <Button onClick={handleNext}>{isLast ? finishLabel : 'Continue'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

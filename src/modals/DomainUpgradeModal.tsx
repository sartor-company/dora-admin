import { useState } from 'react';
import { authApi } from '../api/auth';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DomainUpgradeModal({ open, onClose }: Props) {
  const { showToast } = useToast();
  const [growthName, setGrowthName] = useState('');
  const [enterpriseDomain, setEnterpriseDomain] = useState('');
  const [submitting, setSubmitting] = useState<'growth' | 'enterprise' | null>(null);

  const submitUpgrade = async (tier: 'growth' | 'enterprise') => {
    const preferredDomain =
      tier === 'growth'
        ? growthName.trim()
          ? `verify-${growthName.trim()}.dorascan.ai`
          : ''
        : enterpriseDomain.trim();

    if (!preferredDomain) {
      showToast('Enter your preferred domain name.', 'warn');
      return;
    }

    setSubmitting(tier);
    try {
      await authApi.submitRequest({
        type: 'domain_upgrade',
        domainTier: tier,
        preferredDomain,
        notes: tier === 'growth' ? 'Growth subdomain upgrade request' : 'Enterprise CNAME upgrade request',
      });
      onClose();
      showToast(
        'Domain upgrade request submitted. Sartor will contact you within 1 business day with payment and DNS instructions.',
        'success',
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not submit request.', 'error');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verification Domain"
      width={500}
      subtitle="Domain upgrades apply to new batches only. Existing printed QR codes continue to work permanently."
    >
      <div
        style={{
          border: '2px solid var(--green)',
          borderRadius: 9,
          padding: 13,
          background: 'var(--gb)',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <strong style={{ color: 'var(--gt)' }}>Starter</strong>
          <Badge variant="bg">Active</Badge>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--gt)', marginBottom: 4 }}>
          verify.dorascan.ai/{'{client_code}'}/{'{order_token}'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--gt)' }}>
          Default for all accounts · No setup required · Included at no charge
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 13, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <strong>Growth Subdomain</strong>
          <Badge variant="bx">Not Active</Badge>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
          verify-{'{clientname}'}.dorascan.ai/{'{order_token}'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
          Your brand name in the hostname · Custom brand theme on verification page · Sartor manages DNS under
          *.dorascan.ai wildcard SSL
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 12 }}>
          <div>
            <span style={{ color: 'var(--text3)' }}>Setup: </span>
            <strong>₦100,000 one-time</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text3)' }}>Annual: </span>
            <strong>₦50,000/year</strong>
          </div>
        </div>
        <FormGroup label="Your preferred subdomain name">
          <input
            className="inp"
            placeholder="e.g. sartorhealth → verify-sartorhealth.dorascan.ai"
            value={growthName}
            onChange={(e) => setGrowthName(e.target.value)}
          />
        </FormGroup>
        <Button
          variant="accent"
          size="sm"
          disabled={submitting !== null}
          onClick={() => submitUpgrade('growth')}
        >
          {submitting === 'growth' ? 'Submitting…' : 'Request Growth Upgrade'}
        </Button>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 13, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <strong>Enterprise CNAME</strong>
          <Badge variant="bx">Not Active</Badge>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
          verify.{'{clientdomain}'}.com/{'{order_token}'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>
          Fully client-owned domain · Individual SSL per client · Requires CNAME at your DNS provider
        </div>
        <div
          style={{
            padding: '8px 10px',
            background: 'var(--ab)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--at)',
            marginBottom: 8,
          }}
        >
          ⚠ You must add a CNAME record pointing your domain to Sartor&apos;s infrastructure before activation.
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 12, flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: 'var(--text3)' }}>Setup: </span>
            <strong>₦150,000 one-time</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text3)' }}>Annual: </span>
            <strong>₦200,000/year</strong>
          </div>
        </div>
        <FormGroup label="Your verification domain">
          <input
            className="inp"
            placeholder="e.g. verify.yourbrand.com"
            value={enterpriseDomain}
            onChange={(e) => setEnterpriseDomain(e.target.value)}
          />
        </FormGroup>
        <Button size="sm" disabled={submitting !== null} onClick={() => submitUpgrade('enterprise')}>
          {submitting === 'enterprise' ? 'Submitting…' : 'Request Enterprise Upgrade'}
        </Button>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

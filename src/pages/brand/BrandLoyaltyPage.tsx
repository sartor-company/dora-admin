import { Card, CardHeader } from '../../components/ui/Card';
import { KCard, KCardGrid } from '../../components/ui/KCard';
import { PageHeader } from '../../components/ui/PageHeader';

export function BrandLoyaltyPage() {
  return (
    <>
      <PageHeader title="Consumer Loyalty" subtitle="Points, redemptions and gift distribution" />

      <KCardGrid>
        <KCard label="Active Consumers" value="4,218" trend="↑ 18.7%" trendType="up" />
        <KCard label="New Registrations" value="634" trend="↑ 23.4%" trendType="up" />
        <KCard label="Points Issued (30d)" value="21.3K" trend="↑ 15.2%" trendType="up" />
        <KCard label="Redemption Rate" value="42.8%" trend="↑ 9.8%" trendType="up" />
      </KCardGrid>

      <Card>
        <CardHeader title="Gift distribution performance" />
        <div style={{ display: 'grid', gap: 7, fontSize: 12 }}>
          {[
            { name: '₦500 Store Credit', detail: '134 distributed · 113 redeemed', rate: '84.3%' },
            { name: 'Free Delivery Voucher', detail: '287 distributed · 214 redeemed', rate: '74.6%' },
            { name: 'Product Bundle Reward', detail: '67 distributed · 59 redeemed', rate: '88.1%' },
          ].map((item) => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 11px',
                background: 'var(--bg)',
                borderRadius: 6,
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <div style={{ color: 'var(--text3)' }}>{item.detail}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gt)' }}>{item.rate}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

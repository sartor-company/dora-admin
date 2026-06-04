import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { notifications, type NotificationType } from '../data/mock';

type FilterType = 'all' | NotificationType;

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'alert', label: '🚨 Alerts' },
  { id: 'training', label: '🤖 DORA' },
  { id: 'gift', label: '🎁 Gift Engine' },
  { id: 'billing', label: '💰 Billing' },
];

export function NotificationsPage() {
  const { navigateLegacy } = useApp();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<FilterType>('all');

  const visible =
    filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Platform alerts and activity"
        actions={
          <Button variant="secondary" size="sm" onClick={() => showToast('All notifications marked as read')}>
            Mark all as read
          </Button>
        }
      />

      <Card>
        <div className="notif-filters">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {visible.map((n) => (
            <div
              key={n.id}
              data-type={n.type}
              style={{
                display: 'flex',
                gap: 12,
                padding: 12,
                background: n.bg,
                borderRadius: 8,
                borderLeft: n.borderColor !== 'var(--border)' ? `3px solid ${n.borderColor}` : undefined,
                border: n.borderColor === 'var(--border)' ? '1px solid var(--border)' : undefined,
              }}
            >
              <div style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: n.titleColor,
                    marginBottom: 2,
                  }}
                >
                  {n.title}
                </div>
                <div style={{ fontSize: 12, color: n.bodyColor }}>{n.body}</div>
                <div style={{ fontSize: 11, color: n.timeColor, marginTop: 4 }}>
                  {n.time}
                  {n.action && (
                    <>
                      {' · '}
                      <Button
                        variant="secondary"
                        size="sm"
                        style={{ fontSize: 11, padding: '2px 7px' }}
                        onClick={() => {
                          if (n.action!.pageId === 'replenish') {
                            openModal('replenish');
                          } else {
                            navigateLegacy(n.action!.pageId);
                          }
                        }}
                      >
                        {n.action.label}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

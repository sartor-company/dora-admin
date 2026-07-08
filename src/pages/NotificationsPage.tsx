import { useState } from 'react';
import { notificationsApi } from '../api/notifications';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { useApp } from '../context/AppContext';
import { useTenantData } from '../context/TenantDataContext';
import { useToast } from '../context/ToastContext';
import type { ApiNotification } from '../types/api';
import { formatApiDate } from '../utils/mappers';

function inferTarget(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes('invoice') || t.includes('payment') || t.includes('credit')) return '/invoices';
  if (t.includes('sticker') || t.includes('dispatch') || t.includes('delivery')) return '/sticker-orders';
  if (t.includes('investigation') || t.includes('fraud') || t.includes('p1') || t.includes('p2')) {
    return '/investigations/queue';
  }
  if (t.includes('batch') || t.includes('dora')) return '/batches';
  if (t.includes('gift') || t.includes('campaign') || t.includes('redeem')) return '/gifts';
  if (t.includes('product') || t.includes('sku')) return '/products';
  return null;
}

export function NotificationsPage() {
  const { notifications, refreshNotifications } = useTenantData();
  const { navigateTo } = useApp();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const visible =
    filter === 'unread' ? notifications.filter((n: ApiNotification) => !n.status) : notifications;

  const markAllRead = async () => {
    const unread = notifications.filter((n: ApiNotification) => !n.status);
    if (unread.length === 0) {
      showToast('No unread notifications.', 'warn');
      return;
    }
    try {
      await notificationsApi.markAllRead();
      await refreshNotifications();
      showToast('All notifications marked as read.', 'success');
    } catch {
      showToast('Could not update notifications.', 'error');
    }
  };

  const openNotification = async (n: ApiNotification) => {
    if (!n.status) {
      try {
        await notificationsApi.markRead(n._id);
        await refreshNotifications();
      } catch {
        /* still allow navigation */
      }
    }
    const target = inferTarget(n.notification || '');
    if (target) navigateTo(target);
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Platform alerts and activity"
        actions={
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        }
      />

      <Card>
        <div className="notif-filters" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>
            All ({notifications.length})
          </Button>
          <Button variant={filter === 'unread' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('unread')}>
            Unread ({notifications.filter((n) => !n.status).length})
          </Button>
        </div>

        {visible.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No notifications.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {visible.map((n) => {
              const target = inferTarget(n.notification || '');
              return (
                <div
                  key={n._id}
                  role={target ? 'button' : undefined}
                  tabIndex={target ? 0 : undefined}
                  onClick={() => openNotification(n)}
                  onKeyDown={(e) => {
                    if (target && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      openNotification(n);
                    }
                  }}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    background: n.status ? 'var(--bg)' : 'var(--bb)',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    borderLeft: !n.status ? '3px solid var(--accent)' : undefined,
                    cursor: target ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{n.status ? '✓' : '🔔'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                      {n.notification || 'Notification'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span>{formatApiDate(n.creationDateTime)}</span>
                      {target && (
                        <span style={{ color: 'var(--bt)', fontWeight: 600 }}>Open related →</span>
                      )}
                      {!n.status && (
                        <Button
                          variant="secondary"
                          size="sm"
                          style={{ fontSize: 11, padding: '2px 7px' }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await notificationsApi.markRead(n._id);
                              await refreshNotifications();
                            } catch {
                              showToast('Could not mark as read.', 'error');
                            }
                          }}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

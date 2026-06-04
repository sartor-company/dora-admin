import { useState } from 'react';
import { CURRENCIES } from '../../constants/currency';
import { ROLES } from '../../constants/roles';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';

export function TopToolbar() {
  const { role, openSidebar, navigateTo, currency } = useApp();
  const { openModal } = useModal();
  const config = ROLES[role];
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    const q = search.toLowerCase().trim();
    if (!q) return;
    if (q.includes('batch') || /batch-\d+/i.test(q)) {
      navigateTo('/batches');
    } else if (q.includes('inv') || q.includes('investigation')) {
      navigateTo('/investigations/queue');
    } else {
      navigateTo('/products');
    }
  };

  return (
    <div className="tbar">
      <button type="button" className="ham" onClick={openSidebar} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
      <div>
        <div className="ttitle">{config.toolbarTitle}</div>
        <div className="tsub">{config.toolbarSub}</div>
      </div>
      <div className="tright">
        <input
          className="srch"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <a href="https://crm.sartor.ng" target="_blank" rel="noreferrer" className="cbtn crm-link">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 1h5v5M6 10L15 1M3 4H1v11h11v-2" />
          </svg>
          <span>Sartor CRM</span>
        </a>
        <button type="button" className="cbtn" onClick={() => openModal('currency')}>
          <span>{CURRENCIES[currency].label}</span>
        </button>
        <button
          type="button"
          className="nbell"
          onClick={() => navigateTo('/notifications')}
          aria-label="Notifications"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1a5 5 0 015 5v3l1 2H2l1-2V6a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0"
              stroke="#4A5580"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <div className="ndot" />
        </button>
      </div>
    </div>
  );
}

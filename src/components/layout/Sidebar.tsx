import { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { ROLES } from '../../constants/roles';
import { useApp } from '../../context/AppContext';
import { useTenantData } from '../../context/TenantDataContext';
import { companyInitials } from '../../constants/dorascan';
import { useAuthStore } from '../../store/authStore';
import { NavIcon } from '../icons/NavIcon';
import type { NavItem } from '../../types';

export function Sidebar() {
  const { role, sidebarOpen, closeSidebar, companyName, crmEnabled } = useApp();
  const { navBadges } = useTenantData();
  const user = useAuthStore((s) => s.user);
  const config = ROLES[role];

  const loggedInName = useMemo(() => {
    if (!user) return config.user;
    return user.displayName || user.contactName || user.fullName || config.user;
  }, [user, config.user]);

  const loggedInSub = useMemo(() => {
    if (!user) return companyName;
    if (user.email) return user.email;
    return companyName;
  }, [user, companyName]);

  const userInitials = useMemo(
    () => companyInitials(loggedInName),
    [loggedInName],
  );

  const badgeFor = (badgeKey?: NavItem['badgeKey']): number | undefined => {
    if (!badgeKey) return undefined;
    return navBadges[badgeKey];
  };

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <>
      <div
        className={`mob-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        role="presentation"
      />
      <nav id="sidebar" className={sidebarOpen ? 'mob-open' : ''}>
        <div className="slogo">
          <div className="smark initials-mark" aria-hidden>
            {companyInitials(companyName)}
          </div>
          <div>
            <div className="sname">{companyName}</div>
            <div className="srole">{config.label}</div>
          </div>
        </div>
        <div id="nav-links">
          {config.nav.map((section) => (
            <div className="nsec" key={section.title}>
              <div className="nlbl">{section.title}</div>
              {section.items.map((item) => {
                const count = badgeFor(item.badgeKey);
                return (
                <NavLink
                  key={`${item.path}-${item.label}`}
                  to={item.path}
                  className={({ isActive }) => `ni ${isActive ? 'on' : ''}`}
                  onClick={closeSidebar}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                  {count != null && count > 0 && (
                    <span className="nbadge">{count}</span>
                  )}
                </NavLink>
              );
              })}
            </div>
          ))}
        </div>
        <div className="sfooter">
          <div style={{ padding: '7px 9px', marginBottom: 4, display: 'flex', gap: 6 }}>
            {crmEnabled && (
              <a
                href="https://crm.sartor.ng"
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '5px 8px',
                  background: 'rgba(255,255,255,.08)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,.7)',
                  textDecoration: 'none',
                }}
              >
                CRM
              </a>
            )}
            <a
              href="https://verify.dorascan.ai"
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '5px 8px',
                background: 'rgba(29,184,122,.15)',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(29,184,122,.9)',
                textDecoration: 'none',
              }}
            >
              DORA
            </a>
          </div>
          <div className="suser">
            <div className="sav" style={{ background: config.avatarBg }}>
              {userInitials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sun">{loggedInName}</div>
              <div className="srt">{loggedInSub}</div>
            </div>
            <span className={`spill ${config.pillClass}`}>{config.pill}</span>
          </div>
        </div>
      </nav>
    </>
  );
}

import { ROLES } from '../../constants/roles';
import { useApp } from '../../context/AppContext';
import type { RoleId } from '../../types';

export function DemoTopBar() {
  const { role, setRole, clientType, setClientType, clientName } = useApp();

  return (
    <div id="rbar">
      <span className="rbar-label">Client:</span>
      <button
        type="button"
        className={`rbtn ${clientType === 'full' ? 'on' : ''}`}
        style={
          clientType === 'full'
            ? { background: 'rgba(29,184,122,.25)', color: '#1DB87A' }
            : undefined
        }
        onClick={() => setClientType('full')}
      >
        FULL DEPLOYMENT
      </button>
      <button
        type="button"
        className={`rbtn ${clientType === 'pilot' ? 'on' : ''}`}
        style={
          clientType === 'pilot'
            ? { background: 'rgba(255,92,53,.25)', color: '#FF8C6E' }
            : undefined
        }
        onClick={() => setClientType('pilot')}
      >
        PILOT
      </button>
      <span className="rbar-sep" style={{ color: 'rgba(255,255,255,.2)', margin: '0 4px' }}>
        |
      </span>
      <span className="rbar-label">Role:</span>
      {(Object.keys(ROLES) as RoleId[]).map((r) => (
        <button
          key={r}
          type="button"
          className={`rbtn ${role === r ? 'on' : ''}`}
          onClick={() => setRole(r)}
        >
          {ROLES[r].label.toUpperCase()}
        </button>
      ))}
      <span className="ctag">{clientName}</span>
    </div>
  );
}

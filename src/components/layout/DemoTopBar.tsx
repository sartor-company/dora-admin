import { useApp } from '../../context/AppContext';

export function DemoTopBar() {
  const { clientType, clientName, scBand } = useApp();

  if (!import.meta.env.DEV) return null;

  return (
    <div id="rbar">
      <span className="rbar-label">Engagement:</span>
      <span
        className="rbtn on"
        style={
          clientType === 'pilot'
            ? { background: 'rgba(255,92,53,.25)', color: '#FF8C6E' }
            : { background: 'rgba(29,184,122,.25)', color: '#1DB87A' }
        }
      >
        {clientType === 'pilot' ? 'PILOT' : 'FULL DEPLOYMENT'}
      </span>
      <span className="rbar-sep" style={{ color: 'rgba(255,255,255,.2)', margin: '0 4px' }}>
        |
      </span>
      <span className="rbar-label">Band:</span>
      <span className="rbtn on">{scBand.toUpperCase()}</span>
      <span className="ctag">{clientName}</span>
    </div>
  );
}

import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';

export interface WizardPoolGift {
  id: string;
  name: string;
  qty: string;
  weight: string;
}

export interface WizardPool {
  id: string;
  name: string;
  trigger: string;
  nthValue: string;
  leaderboardPeriod: string;
  winnerCount: string;
  gifts: WizardPoolGift[];
}

interface CampaignPoolBuilderProps {
  pools: WizardPool[];
  onChange: (pools: WizardPool[]) => void;
}

export function CampaignPoolBuilder({ pools, onChange }: CampaignPoolBuilderProps) {
  const addPool = () => {
    onChange([
      ...pools,
      {
        id: `pool-${Date.now()}`,
        name: `Pool ${pools.length + 1}`,
        trigger: '',
        nthValue: '',
        leaderboardPeriod: 'CALENDAR_MONTH',
        winnerCount: '10',
        gifts: [],
      },
    ]);
  };

  const updatePool = (poolId: string, patch: Partial<WizardPool>) => {
    onChange(pools.map((pool) => (pool.id === poolId ? { ...pool, ...patch } : pool)));
  };

  const removePool = (id: string) => {
    if (pools.length <= 1) return;
    onChange(pools.filter((x) => x.id !== id));
  };

  const addGift = (poolId: string) => {
    onChange(
      pools.map((pool) =>
        pool.id === poolId
          ? {
              ...pool,
              gifts: [
                ...pool.gifts,
                { id: `g-${Date.now()}`, name: '', qty: '', weight: '1.0' },
              ],
            }
          : pool,
      ),
    );
  };

  const updateGift = (poolId: string, giftId: string, patch: Partial<WizardPoolGift>) => {
    onChange(
      pools.map((pool) =>
        pool.id === poolId
          ? {
              ...pool,
              gifts: pool.gifts.map((g) => (g.id === giftId ? { ...g, ...patch } : g)),
            }
          : pool,
      ),
    );
  };

  const removeGift = (poolId: string, giftId: string) => {
    onChange(
      pools.map((pool) =>
        pool.id === poolId
          ? { ...pool, gifts: pool.gifts.filter((g) => g.id !== giftId) }
          : pool,
      ),
    );
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
        Add one or more trigger pools. Each pool fires independently. Multiple gifts in one pool =
        weighted random selection.
      </div>
      {pools.map((pool, idx) => (
        <div
          key={pool.id}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 13,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 11,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>Pool {idx + 1}</div>
            <Button variant="secondary" size="sm" onClick={() => removePool(pool.id)}>
              Remove
            </Button>
          </div>
          <FormGroup label="Pool Name *">
            <input
              className="inp"
              value={pool.name}
              onChange={(e) => updatePool(pool.id, { name: e.target.value })}
            />
          </FormGroup>
          <FormGroup label="Trigger Type *">
            <select
              className="inp"
              value={pool.trigger}
              onChange={(e) => updatePool(pool.id, { trigger: e.target.value })}
            >
              <option value="">Select trigger type...</option>
              <option value="FIRST_AUTH">FIRST_AUTH — Consumer&apos;s 1st authentication</option>
              <option value="NTH_AUTH">NTH_AUTH — Consumer&apos;s Nth authentication</option>
              <option value="TOP_SCANNER">TOP_SCANNER — Top N consumers per period</option>
            </select>
          </FormGroup>
          {pool.trigger === 'NTH_AUTH' && (
            <FormGroup label="Trigger Value (Nth scan) *">
              <input
                type="number"
                className="inp"
                value={pool.nthValue}
                onChange={(e) => updatePool(pool.id, { nthValue: e.target.value })}
                placeholder="e.g. 10 for 10th authentication"
              />
            </FormGroup>
          )}
          {pool.trigger === 'TOP_SCANNER' && (
            <div className="fr2">
              <FormGroup label="Leaderboard Period *">
                <select
                  className="inp"
                  value={pool.leaderboardPeriod}
                  onChange={(e) => updatePool(pool.id, { leaderboardPeriod: e.target.value })}
                >
                  <option value="CALENDAR_MONTH">CALENDAR_MONTH</option>
                  <option value="CAMPAIGN_PERIOD">CAMPAIGN_PERIOD</option>
                </select>
              </FormGroup>
              <FormGroup label="Winner Count *">
                <input
                  type="number"
                  className="inp"
                  value={pool.winnerCount}
                  onChange={(e) => updatePool(pool.id, { winnerCount: e.target.value })}
                />
              </FormGroup>
            </div>
          )}
          {pool.trigger && (
            <div style={{ marginTop: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text2)',
                  marginBottom: 7,
                }}
              >
                Gift Items
              </div>
              {pool.gifts.map((gift) => (
                <div
                  key={gift.id}
                  style={{
                    background: 'var(--bg)',
                    borderRadius: 7,
                    padding: 11,
                    marginBottom: 8,
                  }}
                >
                  <div className="fr2" style={{ marginBottom: 8 }}>
                    <FormGroup label="Gift Name *">
                      <input
                        className="inp"
                        value={gift.name}
                        onChange={(e) => updateGift(pool.id, gift.id, { name: e.target.value })}
                        placeholder="e.g. ₦500 Store Credit"
                      />
                    </FormGroup>
                    <FormGroup label="Total Quantity *">
                      <input
                        type="number"
                        className="inp"
                        value={gift.qty}
                        onChange={(e) => updateGift(pool.id, gift.id, { qty: e.target.value })}
                        placeholder="Units available"
                      />
                    </FormGroup>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeGift(pool.id, gift.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => addGift(pool.id)}>
                + Add Gift Item
              </Button>
            </div>
          )}
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={addPool}>
        + Add Trigger Pool
      </Button>
      <div
        style={{
          padding: 9,
          background: 'var(--bb)',
          borderRadius: 7,
          fontSize: 12,
          color: 'var(--bt)',
          marginTop: 12,
        }}
      >
        ℹ FIRST_AUTH pools are always exempt from stacking rules — they fire regardless of the
        stacking setting.
      </div>
    </div>
  );
}

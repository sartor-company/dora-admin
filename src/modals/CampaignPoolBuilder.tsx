import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';

interface PoolGift {
  id: string;
  name: string;
  qty: string;
  weight: string;
}

interface Pool {
  id: string;
  trigger: string;
  gifts: PoolGift[];
}

export function CampaignPoolBuilder() {
  const [pools, setPools] = useState<Pool[]>([
    { id: 'pool-1', trigger: '', gifts: [] },
  ]);

  const addPool = () => {
    setPools((p) => [...p, { id: `pool-${Date.now()}`, trigger: '', gifts: [] }]);
  };

  const removePool = (id: string) => {
    setPools((p) => (p.length > 1 ? p.filter((x) => x.id !== id) : p));
  };

  const setTrigger = (poolId: string, trigger: string) => {
    setPools((p) => p.map((pool) => (pool.id === poolId ? { ...pool, trigger } : pool)));
  };

  const addGift = (poolId: string) => {
    setPools((p) =>
      p.map((pool) =>
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

  const removeGift = (poolId: string, giftId: string) => {
    setPools((p) =>
      p.map((pool) =>
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
          <FormGroup label="Trigger Type *">
            <select
              className="inp"
              value={pool.trigger}
              onChange={(e) => setTrigger(pool.id, e.target.value)}
            >
              <option value="">Select trigger type...</option>
              <option value="FIRST_AUTH">FIRST_AUTH — Consumer&apos;s 1st authentication</option>
              <option value="NTH_AUTH">NTH_AUTH — Consumer&apos;s Nth authentication</option>
              <option value="TOP_SCANNER">TOP_SCANNER — Top N consumers per period</option>
            </select>
          </FormGroup>
          {pool.trigger === 'NTH_AUTH' && (
            <FormGroup label="Trigger Value (Nth scan) *">
              <input type="number" className="inp" placeholder="e.g. 10 for 10th authentication" />
            </FormGroup>
          )}
          {pool.trigger === 'TOP_SCANNER' && (
            <div className="fr2">
              <FormGroup label="Leaderboard Period *">
                <select className="inp">
                  <option>CALENDAR_MONTH</option>
                  <option>CAMPAIGN_PERIOD</option>
                </select>
              </FormGroup>
              <FormGroup label="Winner Count *">
                <input type="number" className="inp" defaultValue={10} />
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
                      <input className="inp" placeholder="e.g. ₦500 Store Credit" />
                    </FormGroup>
                    <FormGroup label="Total Quantity *">
                      <input type="number" className="inp" placeholder="Units available" />
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

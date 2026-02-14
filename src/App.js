import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const BUILDINGS = [
  { name: 'Cursor', baseCost: 15, baseCps: 0.1, icon: '👆', desc: 'Autoclicks once every 10 seconds.' },
  { name: 'Grandma', baseCost: 100, baseCps: 1, icon: '👵', desc: 'A nice grandma to bake more cookies.' },
  { name: 'Farm', baseCost: 1100, baseCps: 8, icon: '🌾', desc: 'Grows cookie plants from cookie seeds.' },
  { name: 'Mine', baseCost: 12000, baseCps: 47, icon: '⛏️', desc: 'Mines out cookie dough and chocolate chips.' },
  { name: 'Factory', baseCost: 130000, baseCps: 260, icon: '🏭', desc: 'Produces large quantities of cookies.' },
  { name: 'Bank', baseCost: 1400000, baseCps: 1400, icon: '🏦', desc: 'Generates cookies from interest.' },
  { name: 'Temple', baseCost: 20000000, baseCps: 7800, icon: '⛪', desc: 'Full of cookie-worshipping monks.' },
  { name: 'Wizard Tower', baseCost: 330000000, baseCps: 44000, icon: '🧙', desc: 'Summons cookies with magic spells.' },
];

const UPGRADES = [
  { name: 'Reinforced Index Finger', cost: 100, desc: 'Click +1', type: 'click', value: 1, req: { building: 'Cursor', count: 1 } },
  { name: 'Carpal Tunnel Prevention', cost: 500, desc: 'Click +1', type: 'click', value: 1, req: { building: 'Cursor', count: 1 } },
  { name: 'Forwards from Grandma', cost: 1000, desc: 'Grandmas 2x', type: 'multiply', building: 'Grandma', value: 2, req: { building: 'Grandma', count: 1 } },
  { name: 'Steel-plated Rolling Pins', cost: 5000, desc: 'Grandmas 2x', type: 'multiply', building: 'Grandma', value: 2, req: { building: 'Grandma', count: 5 } },
  { name: 'Cheap Hoes', cost: 11000, desc: 'Farms 2x', type: 'multiply', building: 'Farm', value: 2, req: { building: 'Farm', count: 1 } },
  { name: 'Fertilizer', cost: 55000, desc: 'Farms 2x', type: 'multiply', building: 'Farm', value: 2, req: { building: 'Farm', count: 5 } },
  { name: 'Sugar Gas', cost: 120000, desc: 'Mines 2x', type: 'multiply', building: 'Mine', value: 2, req: { building: 'Mine', count: 1 } },
  { name: 'Sturdier Conveyor Belts', cost: 1300000, desc: 'Factories 2x', type: 'multiply', building: 'Factory', value: 2, req: { building: 'Factory', count: 1 } },
  { name: 'Taller Tellers', cost: 14000000, desc: 'Banks 2x', type: 'multiply', building: 'Bank', value: 2, req: { building: 'Bank', count: 1 } },
];

function formatNumber(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + ' trillion';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' billion';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' million';
  if (n >= 1000) return n.toLocaleString();
  if (n % 1 !== 0) return n.toFixed(1);
  return n.toString();
}

function getBuildingCost(base, owned) {
  return Math.ceil(base * Math.pow(1.15, owned));
}

function App() {
  const [cookies, setCookies] = useState(0);
  const [totalCookies, setTotalCookies] = useState(0);
  const [buildings, setBuildings] = useState(BUILDINGS.map(() => 0));
  const [purchasedUpgrades, setPurchasedUpgrades] = useState([]);
  const [floaters, setFloaters] = useState([]);
  const [particles, setParticles] = useState([]);
  const [scale, setScale] = useState(1);
  const [goldenCookie, setGoldenCookie] = useState(null);
  const [goldenEffect, setGoldenEffect] = useState(null);
  const [tab, setTab] = useState('buildings');
  const [totalClicks, setTotalClicks] = useState(0);
  const cookieRef = useRef(null);
  const saveTimer = useRef(null);

  // Load save
  useEffect(() => {
    try {
      const save = JSON.parse(localStorage.getItem('cookieClickerSave'));
      if (save) {
        setCookies(save.cookies || 0);
        setTotalCookies(save.totalCookies || 0);
        setBuildings(save.buildings || BUILDINGS.map(() => 0));
        setPurchasedUpgrades(save.purchasedUpgrades || []);
        setTotalClicks(save.totalClicks || 0);
      }
    } catch (e) {}
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      saveGame();
    }, 30000);
    return () => clearInterval(saveTimer.current);
  });

  const saveGame = useCallback(() => {
    localStorage.setItem('cookieClickerSave', JSON.stringify({
      cookies, totalCookies, buildings, purchasedUpgrades, totalClicks
    }));
  }, [cookies, totalCookies, buildings, purchasedUpgrades, totalClicks]);

  // Calculate CPS
  const getCps = useCallback(() => {
    let cps = 0;
    BUILDINGS.forEach((b, i) => {
      let buildingCps = b.baseCps * buildings[i];
      purchasedUpgrades.forEach(ui => {
        const upgrade = UPGRADES[ui];
        if (upgrade.type === 'multiply' && upgrade.building === b.name) {
          buildingCps *= upgrade.value;
        }
      });
      cps += buildingCps;
    });
    return cps;
  }, [buildings, purchasedUpgrades]);

  const getClickValue = useCallback(() => {
    let cv = 1;
    purchasedUpgrades.forEach(ui => {
      const upgrade = UPGRADES[ui];
      if (upgrade.type === 'click') cv += upgrade.value;
    });
    return cv;
  }, [purchasedUpgrades]);

  // Cookie production tick
  useEffect(() => {
    const cps = getCps();
    if (cps <= 0 && !goldenEffect) return;
    const interval = setInterval(() => {
      const multiplier = goldenEffect === 'frenzy' ? 7 : 1;
      const gain = (cps / 20) * multiplier;
      setCookies(c => c + gain);
      setTotalCookies(t => t + gain);
    }, 50);
    return () => clearInterval(interval);
  }, [getCps, goldenEffect]);

  // Golden cookie spawner
  useEffect(() => {
    const spawnGolden = () => {
      const delay = 60000 + Math.random() * 120000; // 1-3 min
      setTimeout(() => {
        if (!goldenCookie) {
          setGoldenCookie({
            x: 10 + Math.random() * 60,
            y: 10 + Math.random() * 60,
            id: Date.now()
          });
          setTimeout(() => setGoldenCookie(null), 12000);
        }
        spawnGolden();
      }, delay);
    };
    spawnGolden();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoldenClick = () => {
    const effects = ['frenzy', 'lucky', 'clickFrenzy'];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    setGoldenCookie(null);

    if (effect === 'lucky') {
      const bonus = Math.max(getCps() * 60 * 15, 13);
      setCookies(c => c + bonus);
      setTotalCookies(t => t + bonus);
      setGoldenEffect('lucky');
      setTimeout(() => setGoldenEffect(null), 3000);
    } else if (effect === 'frenzy') {
      setGoldenEffect('frenzy');
      setTimeout(() => setGoldenEffect(null), 77000);
    } else {
      setGoldenEffect('clickFrenzy');
      setTimeout(() => setGoldenEffect(null), 13000);
    }
  };

  const handleCookieClick = useCallback((e) => {
    const clickVal = getClickValue() * (goldenEffect === 'clickFrenzy' ? 777 : 1);
    setCookies(c => c + clickVal);
    setTotalCookies(t => t + clickVal);
    setTotalClicks(c => c + 1);

    setScale(0.95);
    setTimeout(() => setScale(1), 80);

    const id = Date.now() + Math.random();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFloaters(f => [...f, { id, x, y, val: clickVal }]);
    setTimeout(() => setFloaters(f => f.filter(fl => fl.id !== id)), 700);

    // Particles
    for (let i = 0; i < 4; i++) {
      const pid = id + i;
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      setParticles(p => [...p, { id: pid, x, y, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist }]);
      setTimeout(() => setParticles(p => p.filter(pp => pp.id !== pid)), 500);
    }
  }, [getClickValue, goldenEffect]);

  const buyBuilding = (index) => {
    const cost = getBuildingCost(BUILDINGS[index].baseCost, buildings[index]);
    if (cookies >= cost) {
      setCookies(c => c - cost);
      setBuildings(b => { const nb = [...b]; nb[index]++; return nb; });
    }
  };

  const buyUpgrade = (index) => {
    const upgrade = UPGRADES[index];
    if (cookies >= upgrade.cost && !purchasedUpgrades.includes(index)) {
      setCookies(c => c - upgrade.cost);
      setPurchasedUpgrades(p => [...p, index]);
    }
  };

  const availableUpgrades = UPGRADES.map((u, i) => ({ ...u, index: i }))
    .filter(u => !purchasedUpgrades.includes(u.index))
    .filter(u => {
      const bi = BUILDINGS.findIndex(b => b.name === u.req.building);
      return buildings[bi] >= u.req.count;
    });

  const cps = getCps();

  return (
    <div className="game">
      {goldenEffect && (
        <div className="golden-banner">
          {goldenEffect === 'frenzy' ? 'Frenzy! x7 production!' :
           goldenEffect === 'lucky' ? 'Lucky! Cookie bonus!' :
           'Click Frenzy! x777 clicking!'}
        </div>
      )}

      <div className="left-panel">
        <h1 className="title">Cookie Clicker</h1>
        <p className="cookie-count">{formatNumber(Math.floor(cookies))}</p>
        <p className="cookie-label">cookie{Math.floor(cookies) !== 1 ? 's' : ''}</p>
        <p className="cps">per second: {formatNumber(cps * (goldenEffect === 'frenzy' ? 7 : 1))}</p>

        <div className="cookie-container" onClick={handleCookieClick} ref={cookieRef}>
          <div className="cookie-shadow" />
          <div className={`big-cookie ${goldenEffect === 'clickFrenzy' ? 'rainbow' : ''}`} style={{ transform: `scale(${scale})` }}>
            🍪
          </div>
          {floaters.map(f => (
            <span key={f.id} className="floater" style={{ left: f.x, top: f.y }}>
              +{formatNumber(f.val)}
            </span>
          ))}
          {particles.map(p => (
            <span key={p.id} className="particle" style={{
              left: p.x, top: p.y,
              '--dx': p.dx + 'px', '--dy': p.dy + 'px'
            }}>🍪</span>
          ))}
        </div>

        <div className="stats">
          <p>Total cookies: {formatNumber(Math.floor(totalCookies))}</p>
          <p>Total clicks: {totalClicks.toLocaleString()}</p>
          <p>Click value: {formatNumber(getClickValue())}</p>
        </div>

        <div className="save-btns">
          <button className="save-btn" onClick={saveGame}>Save</button>
          <button className="save-btn" onClick={() => {
            if (window.confirm('Reset all progress?')) {
              localStorage.removeItem('cookieClickerSave');
              window.location.reload();
            }
          }}>Reset</button>
        </div>
      </div>

      <div className="right-panel">
        <div className="shop-tabs">
          <button className={`shop-tab ${tab === 'buildings' ? 'active' : ''}`} onClick={() => setTab('buildings')}>Buildings</button>
          <button className={`shop-tab ${tab === 'upgrades' ? 'active' : ''}`} onClick={() => setTab('upgrades')}>
            Upgrades {availableUpgrades.length > 0 && <span className="badge">{availableUpgrades.length}</span>}
          </button>
        </div>

        <div className="shop-header">Store</div>

        {tab === 'buildings' && (
          <div className="shop-list">
            {BUILDINGS.map((b, i) => {
              const cost = getBuildingCost(b.baseCost, buildings[i]);
              const canAfford = cookies >= cost;
              return (
                <div key={b.name} className={`shop-item ${canAfford ? 'affordable' : 'locked'}`} onClick={() => buyBuilding(i)}>
                  <div className="shop-icon">{b.icon}</div>
                  <div className="shop-info">
                    <div className="shop-name">{b.name}</div>
                    <div className="shop-cost">🍪 {formatNumber(cost)}</div>
                    <div className="shop-desc">{b.desc}</div>
                  </div>
                  <div className="shop-count">{buildings[i]}</div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'upgrades' && (
          <div className="shop-list">
            {availableUpgrades.length === 0 && (
              <p className="no-upgrades">Buy more buildings to unlock upgrades!</p>
            )}
            {availableUpgrades.map(u => {
              const canAfford = cookies >= u.cost;
              return (
                <div key={u.name} className={`shop-item ${canAfford ? 'affordable' : 'locked'}`} onClick={() => buyUpgrade(u.index)}>
                  <div className="shop-icon">⬆️</div>
                  <div className="shop-info">
                    <div className="shop-name">{u.name}</div>
                    <div className="shop-cost">🍪 {formatNumber(u.cost)}</div>
                    <div className="shop-desc">{u.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {goldenCookie && (
        <div className="golden-cookie" style={{ left: goldenCookie.x + '%', top: goldenCookie.y + '%' }}
          onClick={handleGoldenClick}>
          🌟
        </div>
      )}
    </div>
  );
}

export default App;

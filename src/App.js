import { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(new Date());
  const [cookies, setCookies] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = useCallback((e) => {
    setCookies(c => c + 1);
    setScale(0.9);
    setTimeout(() => setScale(1), 100);

    const id = Date.now() + Math.random();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFloaters(f => [...f, { id, x, y }]);
    setTimeout(() => setFloaters(f => f.filter(fl => fl.id !== id)), 800);
  }, []);

  const getMilestone = () => {
    if (cookies >= 1000) return 'Cookie God!';
    if (cookies >= 500) return 'Cookie Master!';
    if (cookies >= 100) return 'Cookie Monster!';
    if (cookies >= 50) return 'Baker extraordinaire!';
    if (cookies >= 25) return 'Getting warmer...';
    if (cookies >= 10) return 'Nice batch!';
    if (cookies >= 1) return 'Fresh from the oven!';
    return '';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">Cookie Clicker</h1>
        <p className="cookie-count">{cookies.toLocaleString()} cookie{cookies !== 1 ? 's' : ''}</p>

        <div className="cookie-area" onClick={handleClick}>
          <div className="cookie" style={{ transform: `scale(${scale})` }}>
            🍪
          </div>
          {floaters.map(f => (
            <span key={f.id} className="floater" style={{ left: f.x, top: f.y }}>+1</span>
          ))}
        </div>

        {cookies > 0 && <p className="milestone">{getMilestone()}</p>}

        <div className="card">
          <div className="clock">{time.toLocaleTimeString()}</div>
          <p className="date">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <p className="footer">Built with React &bull; Deployed via GitHub Pages</p>
      </header>
    </div>
  );
}

export default App;

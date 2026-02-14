import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(new Date());
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">React Showcase</h1>
        <p className="subtitle">A simple React app hosted on GitHub Pages</p>

        <div className="card">
          <div className="clock">{time.toLocaleTimeString()}</div>
          <p className="date">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="card interactive" onClick={() => setClicks(c => c + 1)}>
          <button className="click-btn">
            Clicked {clicks} time{clicks !== 1 ? 's' : ''}
          </button>
          {clicks > 0 && <p className="encouragement">{clicks >= 10 ? 'You are unstoppable!' : clicks >= 5 ? 'Keep going!' : 'Nice!'}</p>}
        </div>

        <p className="footer">Built with React &bull; Deployed via GitHub Pages</p>
      </header>
    </div>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState(['Awaiting uplink coordinates...']);
  const [alert, setAlert] = useState(null);
  
  // Autopilot State
  const [autoX, setAutoX] = useState(0);
  const [autoY, setAutoY] = useState(0);
  
  // 🛰️ NEW: Live Telemetry & Fuel State
  const [telemetry, setTelemetry] = useState({ x: 0, y: 0, z: 0, roe: 'DISCONNECT', fuel: 100.0 });
  
  const ws = useRef(null);

  const addLog = (msg) => {
    setLogs((prev) => [...prev.slice(-9), msg]); 
  };

  const toggleConnection = () => {
    if (connected) {
      ws.current.close();
      return;
    }
    
    if (!url.startsWith('wss://')) {
      alert("URL must start with wss://");
      return;
    }

    addLog(`🔍 CONNECTING TO: ${url}...`);
    ws.current = new WebSocket(url, 'foxglove.websocket.v1');

    ws.current.onopen = () => {
      setConnected(true);
      addLog('✅ UPLINK SECURED.');
      
      // 📡 NEW: Subscribe to Channel 1 (Swarm Telemetry) to get Live Fuel & XYZ Data
      ws.current.send(JSON.stringify({
        op: "subscribe",
        subscriptions: [{ id: 1, channelId: 1 }]
      }));
    };

    ws.current.onmessage = async (event) => {
      // 📡 ALL DATA (Including Alerts) IS NOW DECODED FROM THE BINARY STREAM
      if (event.data instanceof Blob) {
        const buffer = await event.data.arrayBuffer();
        const view = new DataView(buffer);
        const op = view.getUint8(0);
        
        if (op === 1) { // 1 = Message Data
          const subId = view.getUint32(1, true);
          if (subId === 1) { // Match our Telemetry Subscription
            const jsonString = new TextDecoder().decode(buffer.slice(13)); 
            try {
              const data = JSON.parse(jsonString);
              if (data.fuel !== undefined) {
                setTelemetry({
                  x: data.x,
                  y: data.y,
                  z: data.z,
                  roe: data.roe,
                  fuel: data.fuel
                });
                
                // 🚨 NEW: PROCESS ALERTS DIRECTLY FROM THE JSON PAYLOAD
                if (data.alert) {
                  if (data.alert.includes('RADAR_ALERT')) {
                    const coords = data.alert.split(':')[1].trim();
                    const newAlert = `🚨 RADAR: TARGET ACQUIRED AT [${coords}] 🚨`;
                    setAlert(prev => {
                      if (prev !== newAlert) addLog(`📡 RADAR LOCK: [${coords}]`);
                      return newAlert;
                    });
                  } else if (data.alert.includes('LIDAR_WARNING')) {
                    const newAlert = '⚠️ LIDAR: OBSTACLE DETECTED! BRAKING! ⚠️';
                    setAlert(prev => {
                      if (prev !== newAlert) addLog('🛡️ LIDAR ENGAGED.');
                      return newAlert;
                    });
                  } else if (data.alert.includes('HOSTILE_FIRE')) {
                    const newAlert = '💥 INCOMING FIRE: EVADE! 💥';
                    setAlert(prev => {
                      if (prev !== newAlert) addLog('🔥 ENEMY IS SHOOTING!');
                      return newAlert;
                    });
                  } else if (data.alert.includes('TARGET_NEUTRALIZED')) {
                    const newAlert = '✅ TARGET NEUTRALIZED. THREAT ELIMINATED. ✅';
                    setAlert(prev => {
                      if (prev !== newAlert) addLog('💥 SPLASH ONE. ENEMY DESTROYED.');
                      return newAlert;
                    });
                  }
                }
              }
            } catch (e) {
              console.error("Telemetry decode error", e);
            }
          }
        }
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
      setTelemetry(prev => ({ ...prev, roe: 'DISCONNECT' }));
      addLog('⚠️ LINK LOST OR DISCONNECTED.');
      setAlert(null);
    };
  };

  const sendCommand = (cmd, label) => {
    if (ws.current && connected) {
      ws.current.send(cmd);
      addLog(`> ${label}`);
      setAlert(null); 
    } else {
      addLog('❌ ERROR: NOT CONNECTED');
    }
  };

  const engageAutopilot = () => {
    if (ws.current && connected) {
      const cmd = `AUTOPILOT_${autoX}_${autoY}`;
      ws.current.send(cmd);
      addLog(`> AUTOPILOT ENGAGED: [${autoX}, ${autoY}]`);
      setAlert(null);
    } else {
      addLog('❌ ERROR: NOT CONNECTED');
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🦅 NEUTRALIZE ALPHA: TACTICAL COMMAND</h1>
        <div className="connection-bar">
          <input 
            type="text" 
            placeholder="wss://your-cloudflare-url.trycloudflare.com" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
            disabled={connected}
          />
          <button 
            className={connected ? "btn-disconnect" : "btn-connect"} 
            onClick={toggleConnection}
          >
            {connected ? "DISCONNECT" : "INITIALIZE UPLINK"}
          </button>
        </div>
      </header>

      {alert && <div className="alert-banner">{alert}</div>}

      <div className="control-grid">
        
        {/* 📊 NEW: LIVE TELEMETRY & FUEL PANEL */}
        <div className="panel telemetry-control">
          <h2>SWARM STATUS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div><strong>STATUS:</strong> <span style={{color: '#00ffcc'}}>{telemetry.roe}</span></div>
            <div><strong>ALT (Z):</strong> {telemetry.z.toFixed(1)}m</div>
            <div><strong>LAT (X):</strong> {telemetry.x.toFixed(1)}</div>
            <div><strong>LON (Y):</strong> {telemetry.y.toFixed(1)}</div>
          </div>
          
          <div style={{ padding: '0.5rem', border: '1px solid #333', backgroundColor: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>⚡ ALPHA BATTERY</span>
              <span>{Math.round(telemetry.fuel)}%</span>
            </div>
            <div style={{ width: '100%', height: '12px', backgroundColor: '#222', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${telemetry.fuel}%`, 
                backgroundColor: telemetry.fuel > 30 ? '#00ffcc' : '#ff003c',
                transition: 'width 0.2s, background-color 0.5s'
              }} />
            </div>
          </div>
        </div>

        <div className="panel mission-control">
          <h2>MISSION CONTROL</h2>
          <button onClick={() => sendCommand('FORMATION', 'FORMATION V')} className="btn-primary">📐 FORMATION V</button>
          <button onClick={() => sendCommand('EVASIVE', 'EVASIVE')} className="btn-warning">🌪️ EVASIVE</button>
          <button onClick={() => sendCommand('STRIKE', 'STRIKE TARGET')} className="btn-danger">🎯 STRIKE TARGET</button>
          <button onClick={() => sendCommand('ABORT', 'ABORT (RTB)')} className="btn-secondary">🛑 ABORT / RTB</button>
        </div>

        <div className="panel flight-control">
          <h2>MANUAL OVERRIDE</h2>
          <div className="d-pad">
            <div className="d-row">
              <button onClick={() => sendCommand('MOVE_W', 'MOVE FORWARD')} className="btn-nav">W (FWD)</button>
            </div>
            <div className="d-row">
              <button onClick={() => sendCommand('MOVE_A', 'MOVE LEFT')} className="btn-nav">A (LEFT)</button>
              <button onClick={() => sendCommand('MOVE_S', 'MOVE BACK')} className="btn-nav">S (BACK)</button>
              <button onClick={() => sendCommand('MOVE_D', 'MOVE RIGHT')} className="btn-nav">D (RIGHT)</button>
            </div>
            <div className="d-row alt-controls">
              <button onClick={() => sendCommand('MOVE_R', 'ASCEND')} className="btn-nav">R (RISE)</button>
              <button onClick={() => sendCommand('MOVE_C', 'DESCEND')} className="btn-nav">C (CROUCH)</button>
            </div>
          </div>
        </div>

        <div className="panel autopilot-control">
          <h2>AUTOPILOT (A* STAR)</h2>
          <div className="coord-inputs">
            <div className="coord-group">
              <label>TARGET X:</label>
              <input type="number" value={autoX} onChange={e => setAutoX(e.target.value)} />
            </div>
            <div className="coord-group">
              <label>TARGET Y:</label>
              <input type="number" value={autoY} onChange={e => setAutoY(e.target.value)} />
            </div>
          </div>
          <button onClick={engageAutopilot} className="btn-success">🚀 ENGAGE AUTOPILOT</button>
        </div>

        <div className="panel terminal">
          <h2>SYSTEM LOGS</h2>
          <div className="log-window">
            {logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
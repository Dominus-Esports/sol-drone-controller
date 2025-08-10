(function(){
  const e = React.createElement;
  function Panel() {
    const [mode, setMode] = React.useState('HOVER');
    const [hud, setHud] = React.useState(window.SOL_Config?.hud?.show !== false);
    const [speedCap, setSpeedCap] = React.useState(window.SOL_Config?.speedCap || 30);
    const [yaw, setYaw] = React.useState(window.SOL_Config?.controls?.yawSensitivity || 1.5);
    React.useEffect(() => {
      const id = setInterval(() => {
        if (window.SOL_HUD && window.SOL_LastHUD) {
          setMode(window.SOL_LastHUD.mode || 'HOVER');
        }
      }, 250);
      return () => clearInterval(id);
    }, []);
    function apply() {
      if (!window.SOL_Config) return;
      window.SOL_Config.hud = { show: hud };
      window.SOL_Config.speedCap = Number(speedCap) || 30;
      window.SOL_Config.controls = { yawSensitivity: Number(yaw) || 1.5 };
      const hudDiv = document.getElementById('hud');
      if (hudDiv) hudDiv.style.display = hud ? 'block' : 'none';
    }
    // React HUD readout
    const hudBox = e('div', { style: { marginTop: 8, fontSize: 12, background:'rgba(10,10,20,0.35)', padding: 8, borderRadius: 6 } },
      window.SOL_LastHUD ? [
        e('div', { key:'m' }, `Mode: ${window.SOL_LastHUD.mode}${window.SOL_LastHUD.ultra ? ' (ULTRA)' : ''}`),
        e('div', { key:'p' }, `Pos: (${window.SOL_LastHUD.position.x.toFixed(2)}, ${window.SOL_LastHUD.position.y.toFixed(2)}, ${window.SOL_LastHUD.position.z.toFixed(2)})`),
        e('div', { key:'v' }, `Vel: ${window.SOL_LastHUD.velocity.length().toFixed(2)}`),
        e('div', { key:'t' }, `Thrust: ${window.SOL_LastHUD.thrustPct.toFixed(0)}%  Energy: ${window.SOL_LastHUD.energy.toFixed(0)}%`),
        e('div', { key:'a' }, `Alt: ${window.SOL_LastHUD.altitude.toFixed(2)}`),
        e('div', { key:'s' }, `Teleports: ${window.SOL_LastHUD.stats.teleports}  Blasts: ${window.SOL_LastHUD.stats.blasts}`)
      ] : e('div', null, 'HUD: no data yet')
    );

    return e('div', { style: { position:'absolute', top: 12, right: 12, background:'rgba(10,10,20,0.4)', padding: '10px 12px', borderRadius: 8, color:'#dfe6ff', pointerEvents:'auto', width: 260 } },
      e('div', { style:{ marginBottom: 6 } }, 'Mode: ', e('strong', null, mode)),
      e('label', { style:{ display:'block', fontSize:12 } },
        e('input', { type:'checkbox', checked: hud, onChange: e=>setHud(e.target.checked) }), ' Show HUD'
      ),
      e('label', { style:{ display:'block', marginTop:6, fontSize:12 } }, 'Speed Cap'),
      e('input', { type:'number', min:10, max:200, step:5, value: speedCap, onChange: e=>setSpeedCap(e.target.value), style:{ width:'100%' } }),
      e('label', { style:{ display:'block', marginTop:6, fontSize:12 } }, 'Yaw Sensitivity'),
      e('input', { type:'number', min:0.5, max:4, step:0.1, value: yaw, onChange: e=>setYaw(e.target.value), style:{ width:'100%' } }),
      e('button', { onClick: apply, style:{ marginTop:8, width:'100%' } }, 'Apply'),
      e('div', { style:{ display:'flex', gap:8, marginTop:8 } },
        e('button', { onClick: ()=>window.SOL_MetricsDB && window.SOL_MetricsDB.exportNDJSON(), style:{ flex:1 } }, 'Export Metrics'),
        e('button', { onClick: async()=>{ if(window.SOL_MetricsDB){ await window.SOL_MetricsDB.clearMetrics(); alert('Cleared'); } }, style:{ flex:1 } }, 'Clear')
      ),
      hudBox
    );
  }
  function initUI(){
    const root = document.getElementById('ui-root');
    if (!root) return;
    const r = ReactDOM.createRoot(root);
    r.render(e(Panel));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
})();



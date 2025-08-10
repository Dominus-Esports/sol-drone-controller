(function(){
  const e = React.createElement;
  function Panel() {
    const [mode, setMode] = React.useState('HOVER');
    React.useEffect(() => {
      const id = setInterval(() => {
        if (window.SOL_HUD && window.SOL_LastHUD) {
          setMode(window.SOL_LastHUD.mode || 'HOVER');
        }
      }, 250);
      return () => clearInterval(id);
    }, []);
    return e('div', { style: { position:'absolute', top: 12, right: 12, background:'rgba(10,10,20,0.4)', padding: '8px 10px', borderRadius: 8, color:'#dfe6ff', pointerEvents:'auto' } },
      e('div', null, 'Mode: ', e('strong', null, mode)),
      e('div', { style: { fontSize: 12, opacity: 0.8 } }, 'React HUD overlay')
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



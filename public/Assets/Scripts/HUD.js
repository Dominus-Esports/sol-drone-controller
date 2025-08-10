(function() {
  // DOM HUD removed; provide data only for React HUD via SOL_LastHUD
  let hud = null;
  function formatVector3(v) {
    return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
  }
  window.SOL_HUD = {
    Update(data) {
      window.SOL_LastHUD = data;
    }
  };
})();

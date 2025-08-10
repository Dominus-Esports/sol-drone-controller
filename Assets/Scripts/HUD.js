(function() {
  const hud = document.getElementById('hud');
  function formatVector3(v) {
    return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
  }
  window.SOL_HUD = {
    Update(data) {
      window.SOL_LastHUD = data;
      const speed = data.velocity.length().toFixed(2);
      hud.innerHTML = `
        <div>Flight Mode: <span class="mode">${data.mode}</span> <span class="${data.ultra ? 'ultra' : ''}">${data.ultra ? 'ULTRA' : ''}</span></div>
        <div>Position: ${formatVector3(data.position)}</div>
        <div>Velocity: ${formatVector3(data.velocity)} (|v|=${speed})</div>
        <div>Thrust: ${data.thrustPct.toFixed(0)}%</div>
        <div>Energy: ${data.energy.toFixed(0)}%</div>
        <div>Altitude: ${data.altitude.toFixed(2)}</div>
        <div>Stats: teleports=${data.stats.teleports}, blasts=${data.stats.blasts}</div>
      `;
    }
  };
})();

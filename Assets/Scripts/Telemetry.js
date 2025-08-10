(function(){
  const cfg = window.SOL_Config?.telemetry;
  if (!cfg || !cfg.wsEnabled) return;
  let ws = null;
  let timer = null;

  function connect() {
    try {
      ws = new WebSocket(window.SOL_Config.telemetry.wsUrl);
      ws.onopen = () => {
        if (timer) clearInterval(timer);
        timer = setInterval(send, window.SOL_Config.telemetry.sendIntervalMs || 200);
      };
      ws.onclose = () => {
        if (timer) clearInterval(timer);
        setTimeout(connect, 2000);
      };
      ws.onerror = () => {
        try { ws.close(); } catch(_){}
      };
      ws.onmessage = (evt) => {
        // Future: handle remote telemetry
      };
    } catch (e) {
      setTimeout(connect, 2000);
    }
  }

  function send() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!window.SOL_TelemetrySource) return;
    const t = window.SOL_TelemetrySource();
    ws.send(JSON.stringify(t));
  }

  // Allow controller to register a source function
  window.SOL_RegisterTelemetrySource = (fn) => {
    window.SOL_TelemetrySource = fn;
  };

  connect();
})();



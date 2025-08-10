// Web Vitals + FPS sampler to /api/metrics
(function(){
  const endpoint = '/api/metrics'; // dev writes to file via Express; on Vercel logs to console handler
  function post(data){
    try { navigator.sendBeacon(endpoint, JSON.stringify(data)); }
    catch { fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }); }
  }

  // FPS sampling
  (function(){
    let frames = 0; let last = performance.now();
    function loop(){
      frames++;
      const now = performance.now();
      const dt = now - last;
      if (dt >= 1000){
        const fps = Math.round((frames * 1000) / dt);
        post({ id: 'fps', name: 'FPS', value: fps, t: Date.now() });
        frames = 0; last = now;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();

  // Core Web Vitals
  (function(){
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/web-vitals@4/dist/web-vitals.iife.js';
    s.onload = () => {
      const { onTTFB, onFID, onLCP, onCLS, onINP } = webVitals;
      const send = m => post({ id: m.id, name: m.name, value: m.value, rating: m.rating, delta: m.delta, navigationType: m.navigationType, t: Date.now() });
      onTTFB(send); onFID(send); onLCP(send); onCLS(send); onINP(send);
    };
    document.head.appendChild(s);
  })();
})();



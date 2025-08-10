const fs = require('fs');

function parseNDJSON(path){
  if (!fs.existsSync(path)) return [];
  const raw = fs.readFileSync(path, 'utf8').trim();
  if (!raw) return [];
  return raw.split(/\n+/).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function percentile(arr, p){
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a,b)=>a-b);
  const idx = Math.floor((p/100) * (sorted.length-1));
  return sorted[idx];
}

function main(){
  const file = process.env.METRICS_FILE || './.data/metrics.ndjson';
  const rows = parseNDJSON(file);
  const lcpValues = rows.filter(r => r.name === 'LCP').map(r => Number(r.value) || 0);
  const fpsValues = rows.filter(r => r.id === 'fps').map(r => Number(r.value) || 0);
  const p95Lcp = percentile(lcpValues, 95);
  const p50Fps = percentile(fpsValues, 50);
  const lcpMax = Number(process.env.LCP_MS || 2500);
  const fpsMin = Number(process.env.FPS_IDLE || 50);
  console.log(JSON.stringify({ p95Lcp, p50Fps, lcpMax, fpsMin }, null, 2));
  let ok = true;
  if (p95Lcp > lcpMax) { console.error(`LCP p95 too high: ${p95Lcp}ms > ${lcpMax}ms`); ok = false; }
  if (p50Fps < fpsMin) { console.error(`FPS p50 too low: ${p50Fps} < ${fpsMin}`); ok = false; }
  process.exit(ok ? 0 : 1);
}

main();



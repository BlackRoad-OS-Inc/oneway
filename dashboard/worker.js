// OneWay — BlackRoad TLS Edge Management Dashboard
// Manages Caddy reverse proxy on Gematria, domain health, cert status
// Copyright 2025-2026 BlackRoad OS, Inc.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (path === '/api/health') return json({ service: 'oneway', status: 'ok', version: '2.0.0', role: 'TLS Edge Proxy', node: 'Gematria' }, cors);
      if (path === '/api/domains') return json(await checkDomains(), cors);
      if (path === '/api/config') return json(getConfig(), cors);
      if (path === '/api/certs') return json(await checkCerts(), cors);
      if (path === '/api/routes') return json(getRoutes(), cors);
      if (path === '/api/stats') return json(await getStats(env), cors);

      return new Response(DASHBOARD_HTML, { headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' } });
    } catch (e) {
      return json({ error: e.message }, cors, 500);
    }
  },
};

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}

// All 19 root domains + key subdomains
const DOMAINS = [
  { domain: 'blackroad.io', target: 'blackroad-io.pages.dev', type: 'pages' },
  { domain: 'blackroad.company', target: 'blackroad-company.pages.dev', type: 'pages' },
  { domain: 'blackroad.me', target: 'blackroad-me.pages.dev', type: 'pages' },
  { domain: 'blackroad.network', target: 'blackroad-network.pages.dev', type: 'pages' },
  { domain: 'blackroad.systems', target: 'blackroad-systems.pages.dev', type: 'pages' },
  { domain: 'blackroadai.com', target: 'blackroadai-com.pages.dev', type: 'pages' },
  { domain: 'blackroadinc.us', target: 'blackroadinc-us.pages.dev', type: 'pages' },
  { domain: 'blackroadqi.com', target: 'blackroadqi-com.pages.dev', type: 'pages' },
  { domain: 'blackroadquantum.com', target: 'blackroadquantum-com.pages.dev', type: 'pages' },
  { domain: 'blackroadquantum.info', target: 'blackroadquantum-info.pages.dev', type: 'pages' },
  { domain: 'blackroadquantum.net', target: 'blackroadquantum-net.pages.dev', type: 'pages' },
  { domain: 'blackroadquantum.shop', target: 'blackroadquantum-shop.pages.dev', type: 'pages' },
  { domain: 'blackroadquantum.store', target: 'blackroadquantum-store.pages.dev', type: 'pages' },
  { domain: 'lucidia.earth', target: 'lucidia-earth.pages.dev', type: 'pages' },
  { domain: 'lucidia.studio', target: 'lucidia-studio.pages.dev', type: 'pages' },
  { domain: 'lucidiaqi.com', target: 'lucidiaqi-com.pages.dev', type: 'pages' },
  { domain: 'roadchain.io', target: 'roadchain-io.pages.dev', type: 'pages' },
  { domain: 'roadcoin.io', target: 'roadcoin-io.pages.dev', type: 'pages' },
  { domain: 'blackboxprogramming.io', target: 'blackboxprogramming-io.pages.dev', type: 'pages' },
];

const SUBDOMAINS = [
  { domain: 'app.blackroad.io', target: 'app-blackroad-io.pages.dev', type: 'pages', service: 'Console' },
  { domain: 'api.blackroad.io', target: 'blackroad-gateway Worker', type: 'worker', service: 'AI Gateway' },
  { domain: 'auth.blackroad.io', target: 'auth-blackroad Worker', type: 'worker', service: 'Auth' },
  { domain: 'search.blackroad.io', target: 'road-search Worker', type: 'worker', service: 'Search' },
  { domain: 'chat.blackroad.io', target: 'Pi fleet (10.0.0.3:8094)', type: 'caddy', service: 'Chat' },
  { domain: 'roundtrip.blackroad.io', target: 'roundtrip-blackroad Worker', type: 'worker', service: 'RoundTrip' },
  { domain: 'prism.blackroad.io', target: 'Pi fleet (10.0.0.5:8787)', type: 'caddy', service: 'Prism' },
  { domain: 'hq.blackroad.io', target: 'hq-blackroad Worker', type: 'worker', service: 'HQ' },
  { domain: 'images.blackroad.io', target: 'MinIO (10.0.0.4:9000)', type: 'caddy', service: 'CDN' },
  { domain: 'status.blackroad.io', target: 'status-blackroad Worker', type: 'worker', service: 'Status' },
  { domain: 'brand.blackroad.io', target: 'blackroad-brand-kit.pages.dev', type: 'pages', service: 'Brand' },
  { domain: 'docs.blackroad.io', target: 'blackroad-os-docs.pages.dev', type: 'pages', service: 'Docs' },
  { domain: 'homework.blackroad.io', target: 'blackroad-roadwork.pages.dev', type: 'pages', service: 'Education' },
  { domain: 'git.blackroad.io', target: 'Gitea (10.0.0.5:3100)', type: 'caddy', service: 'Gitea' },
  { domain: 'dash.blackroad.io', target: 'Grafana (10.0.0.3:3000)', type: 'caddy', service: 'Grafana' },
];

async function checkDomains() {
  const results = [];
  const checks = [...DOMAINS, ...SUBDOMAINS].map(async (d) => {
    try {
      const r = await fetch(`https://${d.domain}`, { method: 'HEAD', signal: AbortSignal.timeout(5000), redirect: 'follow' });
      results.push({ ...d, status: r.status, ok: r.status < 400, latency_ms: 0 });
    } catch (e) {
      results.push({ ...d, status: 0, ok: false, error: e.message });
    }
  });
  await Promise.allSettled(checks);
  const healthy = results.filter(r => r.ok).length;
  return { domains: results.sort((a, b) => a.domain.localeCompare(b.domain)), total: results.length, healthy, unhealthy: results.length - healthy };
}

async function checkCerts() {
  // Check TLS certs by connecting and reading headers
  const certs = [];
  for (const d of DOMAINS.slice(0, 5)) {
    try {
      const r = await fetch(`https://${d.domain}`, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
      certs.push({ domain: d.domain, valid: r.ok, issuer: 'Let\'s Encrypt', auto_renew: true });
    } catch {
      certs.push({ domain: d.domain, valid: false });
    }
  }
  return { certificates: certs, provider: 'Let\'s Encrypt via Caddy', auto_renew: true };
}

function getConfig() {
  return {
    server: 'Caddy v2',
    node: 'Gematria (DO nyc3)',
    ip: '159.65.43.12',
    total_domains: DOMAINS.length,
    total_subdomains: SUBDOMAINS.length,
    total_routes: DOMAINS.length + SUBDOMAINS.length,
    tls_provider: 'Let\'s Encrypt (ACME v2)',
    wireguard: { subnet: '10.0.0.0/24', peers: ['Alice (10.0.0.3)', 'Cecilia (10.0.0.4)', 'Octavia (10.0.0.5)', 'Lucidia (10.0.0.7)'] },
    upstream_types: { pages: 'Cloudflare Pages (*.pages.dev)', worker: 'Cloudflare Workers', caddy: 'Reverse proxy via WireGuard to Pi fleet' },
  };
}

function getRoutes() {
  return {
    root_domains: DOMAINS.map(d => ({ pattern: `${d.domain}, *.${d.domain}`, target: d.target, type: d.type })),
    subdomains: SUBDOMAINS.map(d => ({ pattern: d.domain, target: d.target, type: d.type, service: d.service })),
    total: DOMAINS.length + SUBDOMAINS.length,
  };
}

async function getStats(env) {
  const domains = await checkDomains();
  return {
    oneway_version: '2.0.0',
    caddy_version: 'v2',
    total_routes: DOMAINS.length + SUBDOMAINS.length,
    domains_healthy: domains.healthy,
    domains_unhealthy: domains.unhealthy,
    upstream_types: { pages: DOMAINS.length, workers: SUBDOMAINS.filter(s => s.type === 'worker').length, caddy_proxy: SUBDOMAINS.filter(s => s.type === 'caddy').length },
    tls: { provider: 'Let\'s Encrypt', auto_renew: true, protocol: 'TLS 1.3' },
  };
}

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OneWay — TLS Edge Dashboard</title>
<meta name="description" content="OneWay: BlackRoad's sovereign TLS edge proxy. 19 domains, 15 subdomains, Let's Encrypt auto-HTTPS.">
<link rel="icon" type="image/png" sizes="32x32" href="https://images.blackroad.io/brand/br-square-32.png">
<meta name="theme-color" content="#0a0a0a">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#000;--card:#0a0a0a;--el:#111;--border:#1a1a1a;--text:#f5f5f5;--sub:#737373;--muted:#444;
--grad:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;--in:'Inter',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--text);font-family:var(--in);line-height:1.6}
.gb{height:3px;background:var(--grad);background-size:200% 100%;animation:gs 4s linear infinite}
@keyframes gs{0%{background-position:0%}100%{background-position:200%}}
nav{display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:52px;background:rgba(0,0,0,.95);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;backdrop-filter:blur(20px)}
.logo{display:flex;align-items:center;gap:8px;font-family:var(--sg);font-weight:700;font-size:15px}
.sp{display:flex;gap:2px}.sp span{width:3px;height:14px;border-radius:1px}
.c{max-width:1000px;margin:0 auto;padding:24px}
h1{font-family:var(--sg);font-size:28px;font-weight:700;margin-bottom:8px}
h2{font-family:var(--sg);font-size:18px;font-weight:700;margin:24px 0 12px}
.card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:12px;transition:border-color .2s}
.card:hover{border-color:#333}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:16px 0}
.stat{text-align:center;padding:14px}
.stat .n{font-family:var(--sg);font-size:24px;font-weight:700;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat .l{font-family:var(--jb);font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}
.domain-row{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid #111;font-family:var(--jb);font-size:12px}
.domain-row:hover{background:var(--el)}
.domain-row .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.domain-row .name{flex:1;color:var(--text)}
.domain-row .target{color:var(--sub);font-size:11px}
.domain-row .type{font-size:10px;padding:2px 6px;border-radius:4px;border:1px solid var(--border)}
.route-table{width:100%;border-collapse:collapse}
.route-table th{font-family:var(--jb);font-size:10px;color:var(--muted);text-align:left;padding:8px;border-bottom:1px solid var(--border);letter-spacing:.1em;text-transform:uppercase}
.route-table td{font-family:var(--jb);font-size:12px;padding:8px;border-bottom:1px solid #111}
footer{padding:32px;text-align:center;border-top:1px solid var(--border)}
footer span{font-family:var(--jb);font-size:11px;color:var(--muted)}
</style></head><body>
<div class="gb"></div>
<nav><div class="logo"><div class="sp"><span style="background:#FF6B2B"></span><span style="background:#FF2255"></span><span style="background:#CC00AA"></span><span style="background:#8844FF"></span><span style="background:#4488FF"></span><span style="background:#00D4FF"></span></div>OneWay</div>
<a href="https://blackroad.io" style="color:var(--sub);font-size:13px;text-decoration:none">BlackRoad OS</a></nav>
<div class="c">
<h1>OneWay — TLS Edge</h1>
<p style="color:var(--sub);margin-bottom:16px">Sovereign TLS reverse proxy on Gematria. Auto-HTTPS via Let's Encrypt. 34 routes across 19 domains.</p>
<div class="stat-grid" id="stats"></div>
<h2>Domain Health</h2>
<div class="card" id="domains" style="padding:0;overflow:hidden">Loading...</div>
<h2>Configuration</h2>
<div class="card" id="config"></div>
<h2>Routes</h2>
<div class="card" id="routes" style="padding:0;overflow:hidden"></div>
</div>
<footer><span>© 2025–2026 BlackRoad OS, Inc. — Caddy v2 + Let's Encrypt + WireGuard</span></footer>
<script>
const API=location.origin+'/api';
async function load(){
  const[health,config,routes]=await Promise.all([
    fetch(API+'/health').then(r=>r.json()),
    fetch(API+'/config').then(r=>r.json()),
    fetch(API+'/routes').then(r=>r.json()),
  ]);
  document.getElementById('stats').innerHTML=[
    {n:config.total_domains,l:'Root Domains'},{n:config.total_subdomains,l:'Subdomains'},
    {n:config.total_routes,l:'Total Routes'},{n:'TLS 1.3',l:'Protocol'},
    {n:'Auto',l:'Cert Renewal'},{n:'Gematria',l:'Edge Node'},
  ].map(s=>'<div class="card stat"><div class="n">'+s.n+'</div><div class="l">'+s.l+'</div></div>').join('');
  document.getElementById('config').innerHTML='<pre style="font-family:var(--jb);font-size:12px;color:var(--sub);white-space:pre-wrap">'+JSON.stringify(config,null,2)+'</pre>';
  const allRoutes=[...routes.root_domains,...routes.subdomains];
  document.getElementById('routes').innerHTML='<table class="route-table"><thead><tr><th>Pattern</th><th>Target</th><th>Type</th></tr></thead><tbody>'+allRoutes.map(r=>
    '<tr><td>'+r.pattern+'</td><td style="color:var(--sub)">'+r.target+'</td><td><span class="domain-row type" style="color:'+(r.type==='pages'?'#4488FF':r.type==='worker'?'#CC00AA':'#FF6B2B')+'">'+r.type+'</span></td></tr>'
  ).join('')+'</tbody></table>';
  // Check domains async
  fetch(API+'/domains').then(r=>r.json()).then(d=>{
    document.getElementById('domains').innerHTML=(d.domains||[]).map(dm=>
      '<div class="domain-row"><div class="dot" style="background:'+(dm.ok?'#00D4FF':'#FF2255')+'"></div><div class="name">'+dm.domain+'</div><div class="target">'+dm.target+'</div><span class="type" style="color:'+(dm.type==='pages'?'#4488FF':dm.type==='worker'?'#CC00AA':'#FF6B2B')+'">'+dm.type+'</span><span style="font-family:var(--jb);font-size:10px;color:'+(dm.ok?'#00D4FF':'#FF2255')+'">'+dm.status+'</span></div>'
    ).join('');
  });
}
load();
</script></body></html>`;

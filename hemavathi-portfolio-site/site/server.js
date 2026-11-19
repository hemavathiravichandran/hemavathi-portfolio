// Zero-dependency Node.js backend: static site + JSON API
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
const PUB = path.join(__dirname, 'public');
const MSGS = path.join(__dirname, 'messages.json');
const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf', '.css': 'text/css', '.js': 'text/javascript', '.glb': 'model/gltf-binary' };
const readMsgs = () => { try { return JSON.parse(fs.readFileSync(MSGS, 'utf8')); } catch { return []; } };
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'GET' && url.pathname === '/api/content')
    return send(res, 200, JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')));

  if (req.method === 'POST' && url.pathname === '/api/contact') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 5000) req.destroy(); });
    return req.on('end', () => {
      let d; try { d = JSON.parse(body); } catch { return send(res, 400, { error: 'Invalid data.' }); }
      const name = String(d.name || '').trim(), email = String(d.email || '').trim(), message = String(d.message || '').trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) return send(res, 400, { error: 'Please fill in your name, a valid email and a message.' });
      const all = readMsgs(); all.push({ name, email, message, at: new Date().toISOString() });
      fs.writeFileSync(MSGS, JSON.stringify(all, null, 2));
      send(res, 201, { ok: true });
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/messages')
    return url.searchParams.get('key') === ADMIN_KEY ? send(res, 200, readMsgs()) : send(res, 401, { error: 'Unauthorized' });

  const base = (req.headers['x-forwarded-proto'] || 'http') + '://' + req.headers.host;
  if (req.method === 'GET' && url.pathname === '/robots.txt') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('User-agent: *\nAllow: /\nSitemap: ' + base + '/sitemap.xml\n'); }
  if (req.method === 'GET' && url.pathname === '/sitemap.xml') { res.writeHead(200, { 'Content-Type': 'application/xml' }); return res.end('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + base + '/</loc></url></urlset>'); }

  const file = path.join(PUB, path.normalize(url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(PUB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('Portfolio running at http://localhost:' + PORT));

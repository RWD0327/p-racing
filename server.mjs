import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const routes = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/scroll-snap.css': ['scroll-snap.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'] };
createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }
  const route = Object.hasOwn(routes, pathname) ? routes[pathname] : undefined;
  if (!route) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const data = await readFile(new URL(`./dist/${route[0]}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': `${route[1]}; charset=utf-8` });
    res.end(data);
  } catch { res.writeHead(500); res.end('Unable to load page'); }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));

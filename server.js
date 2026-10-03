import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const files = { '/': ['index.html', 'text/html; charset=utf-8'], '/index.html': ['index.html', 'text/html; charset=utf-8'], '/phrase.js': ['phrase.js', 'text/javascript; charset=utf-8'], '/candidates.js': ['candidates.js', 'text/javascript; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8'] };
const port = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try { const body = await readFile(fileURLToPath(new URL(file[0], import.meta.url))); res.writeHead(200, {'Content-Type':file[1]}); res.end(body); }
  catch { res.writeHead(500); res.end('Unable to load application'); }
}).listen(port, '0.0.0.0', () => console.log(`言葉磨き started on port ${port}`));

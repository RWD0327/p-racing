const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
// Run the real server source with an ephemeral loopback port, isolated from previews.
const source = fs.readFileSync(path.join(root, 'server.mjs'), 'utf8')
  .replace('.listen(4173,', '.listen(0,')
  .replace("() => console.log('Local: http://127.0.0.1:4173')", "function () { console.log(this.address().port); }");
const child = spawn(process.execPath, ['--input-type=module', '-e', source], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let errors = '';
child.stderr.on('data', data => { errors += data; });
const timeout = setTimeout(() => { child.kill(); process.exitCode = 1; }, 10000);
const request = (port, target) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path: target }, response => {
    let body = '';
    response.on('data', data => { body += data; });
    response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body }));
  }).on('error', reject);
});
child.stdout.once('data', async data => {
  try {
    const port = Number(String(data).trim());
    for (const target of ['//[/', '//', '///', '//example:bad/', 'http://[/']) {
      assert.equal((await request(port, target)).status, 400, target);
      assert.equal((await request(port, '/')).status, 200, 'server must survive invalid requests');
    }
    for (const target of ['/styles.css', '/scroll-snap.css?v=6', '/app.js?v=5', '/index.html?x=1']) {
      assert.equal((await request(port, target)).status, 200, target);
    }
    for (const target of ['/missing', '/%zz', '/../../server.mjs', '/.git/config', '/constructor']) {
      assert.equal((await request(port, target)).status, 404, target);
    }
    const page = await request(port, '/');
    assert.equal(page.headers['x-content-type-options'], 'nosniff');
    assert.equal(page.headers['referrer-policy'], 'no-referrer');
    assert.match(page.body, /script-src 'self'/);
    assert.match(page.body, /form-action 'none'/);
    assert.ok(!page.body.includes("'unsafe-inline'"));
    assert.match(page.body, /https:\/\/forms\.gle\/u3tfTipc82PUKxjr7/);
    for (const link of page.body.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert.match(link[0], /rel="noopener noreferrer"/);
    }
    console.log('PASS: malformed requests rejected, server survives, valid assets work, private paths blocked, security policies and application link preserved');
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { clearTimeout(timeout); child.kill(); }
});
child.once('error', error => { clearTimeout(timeout); console.error(error); process.exitCode = 1; });
child.once('exit', code => { if (code) { console.error(errors); process.exitCode = 1; } });

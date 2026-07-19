const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HTTPS_PORT = 3000;
const HTTP_TARGET = '127.0.0.1';
const HTTP_PORT = 3001;
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

function generateCert() {
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);
    if (cert.length > 50 && key.length > 50) {
      return { cert, key };
    }
  }

  const opensslPath = '"C:\\Program Files\\Git\\usr\\bin\\openssl.exe"';
  execSync(
    opensslPath + ' req -x509 -newkey rsa:2048 -keyout "' + keyPath +
    '" -out "' + certPath + '" -days 365 -nodes -subj "/CN=SolarPV Engineer" 2>&1',
    { encoding: 'utf8', timeout: 15000, stdio: 'pipe' }
  );

  return { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) };
}

let creds;
try {
  creds = generateCert();
  console.log('SSL certificate loaded successfully');
} catch (e) {
  console.error('Failed to load/generate SSL cert:', e.message);
  process.exit(1);
}

const server = https.createServer(creds, (req, res) => {
  const options = {
    hostname: HTTP_TARGET,
    port: HTTP_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: HTTP_TARGET + ':' + HTTP_PORT },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.writeHead(502);
    }
    res.end('Backend unavailable');
  });

  req.pipe(proxyReq);
});

server.on('upgrade', (req, socket, head) => {
  const options = {
    hostname: HTTP_TARGET,
    port: HTTP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options);

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: ' + (proxyRes.headers.upgrade || ''),
      'Connection: Upgrade',
    ];
    if (proxyRes.headers['sec-websocket-protocol']) {
      headers.push('Sec-WebSocket-Protocol: ' + proxyRes.headers['sec-websocket-protocol']);
    }
    socket.write(headers.join('\r\n') + '\r\n\r\n');

    if (proxyHead.length > 0) {
      socket.write(proxyHead);
    }

    proxySocket.pipe(socket);
    socket.pipe(proxySocket);

    proxySocket.on('error', () => socket.destroy());
    socket.on('error', () => proxySocket.destroy());
  });

  proxyReq.on('error', (err) => {
    console.error('WebSocket proxy error:', err.message);
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(HTTPS_PORT, '0.0.0.0', () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  console.log('='.repeat(50));
  console.log('HTTPS proxy running on port ' + HTTPS_PORT);
  console.log('Local:   https://localhost:' + HTTPS_PORT);
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log('Network: https://' + net.address + ':' + HTTPS_PORT);
      }
    }
  }
  console.log('='.repeat(50));
});

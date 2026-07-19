const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function test() {
  // Test home page
  const home = await fetch('https://localhost:3000/');
  console.log('=== HOME PAGE ===');
  console.log('Status:', home.status, 'Size:', home.body.length);
  
  // Test calculator page  
  const calc = await fetch('https://localhost:3000/calculator');
  console.log('\n=== CALCULATOR PAGE ===');
  console.log('Status:', calc.status, 'Size:', calc.body.length);
  
  // Check for JS bundle chunks
  const scripts = calc.body.match(/src="([^"]+)"/g) || [];
  console.log('Script tags:', scripts.length);
  
  // Try loading a JS chunk through HTTPS
  const jsMatch = calc.body.match(/src="(\/_next\/[^"]+\.js)"/);
  if (jsMatch) {
    const jsUrl = 'https://localhost:3000' + jsMatch[1];
    const jsRes = await fetch(jsUrl);
    console.log('\nJS Chunk test:', jsMatch[1]);
    console.log('Status:', jsRes.status, 'Size:', jsRes.body.length);
    if (jsRes.body.length < 100) {
      console.log('Content:', jsRes.body);
    }
  }
  
  // Test static assets
  const icon = await fetch('https://localhost:3000/icons/icon-192.png');
  console.log('\nIcon:', icon.status, icon.body.length, 'bytes');
  
  // Test manifest
  const manifest = await fetch('https://localhost:3000/manifest.json');
  console.log('Manifest:', manifest.status, manifest.body.length, 'bytes');
}

test().catch(e => console.error('Test failed:', e.message));

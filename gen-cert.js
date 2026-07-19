const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const opensslPath = 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe';

try {
  execSync('"' + opensslPath + '" req -x509 -newkey rsa:2048 -keyout "' + path.join(dir, 'key.pem') + '" -out "' + path.join(dir, 'cert.pem') + '" -days 365 -nodes -subj "/CN=SolarPV Engineer"', { encoding: 'utf8', timeout: 15000, cwd: dir });
  console.log('Cert generated successfully');
  console.log('cert size:', fs.statSync(path.join(dir, 'cert.pem')).size);
  console.log('key size:', fs.statSync(path.join(dir, 'key.pem')).size);
} catch(e) {
  console.error('openssl failed:', e.message);
}

#!/usr/bin/env node
// Runs idreesia-mobile on a physical phone during development.
//
//   node scripts/run-mobile-device.mjs ios|android
//
// On the phone, "localhost" is the phone itself, so the app has to reach the
// Mac by its Wi-Fi address. This writes idreesia-mobile/settings.device.json
// (gitignored) with public.backendUrl pointing at the idreesia-web backend on
// this Mac, and starts the mobile app's own Meteor server on port 3100 as the
// --mobile-server (it serves hot code push for the mobile bundle). The phone
// must be on the same Wi-Fi network as the Mac.

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MOBILE_PORT = 3100;
const BACKEND_PORT = 3000;

const platform = process.argv[2];
if (!['ios', 'android'].includes(platform)) {
  console.error('Usage: node scripts/run-mobile-device.mjs ios|android');
  process.exit(1);
}

const lanAddress = () => {
  if (process.env.MOBILE_DEV_HOST) return process.env.MOBILE_DEV_HOST;
  const candidates = Object.entries(networkInterfaces())
    .flatMap(([name, addresses]) => (addresses ?? []).map(address => ({ name, ...address })))
    .filter(address => address.family === 'IPv4' && !address.internal);
  // Prefer the Mac's Wi-Fi / Ethernet interfaces over VPNs and Docker bridges.
  const preferred = candidates.find(address => /^en\d+$/.test(address.name)) ?? candidates[0];
  return preferred?.address;
};

const host = lanAddress();
if (!host) {
  console.error('Could not find a LAN IP address. Set MOBILE_DEV_HOST=<ip> and retry.');
  process.exit(1);
}

const mobileDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../idreesia-mobile');
const settings = JSON.parse(readFileSync(path.join(mobileDir, 'settings.sample.json'), 'utf8'));
settings.public = { ...settings.public, backendUrl: `http://${host}:${BACKEND_PORT}` };
writeFileSync(path.join(mobileDir, 'settings.device.json'), `${JSON.stringify(settings, null, 2)}\n`);

console.log(`Backend (idreesia-web):  http://${host}:${BACKEND_PORT}`);
console.log(`Mobile server:           http://${host}:${MOBILE_PORT}`);

const meteor = spawn(
  'meteor',
  [
    'run',
    `${platform}-device`,
    '--port',
    String(MOBILE_PORT),
    '--mobile-server',
    `http://${host}:${MOBILE_PORT}`,
    '--settings',
    './settings.device.json',
  ],
  { cwd: mobileDir, stdio: 'inherit', env: { ...process.env, METEOR_PACKAGE_DIRS: '../' } }
);
meteor.on('exit', code => process.exit(code ?? 0));

/**
 * Meteor's npm resolver does not honor package.json "exports" subpaths.
 * antd@6 imports paths like:
 *   @rc-component/pagination/locale/en_US
 *   @rc-component/picker/locale/en_US
 *   @rc-component/picker/generate/dayjs
 * which only resolve via exports → es/locale|generate. This script adds
 * directory symlinks so Meteor can resolve those paths on disk.
 *
 * Keep this outside idreesia-web/ — Meteor would otherwise bundle it for the browser.
 */
const fs = require('fs');
const path = require('path');

const shims = [
  ['pagination', 'locale', 'es/locale'],
  ['picker', 'locale', 'es/locale'],
  ['picker', 'generate', 'es/generate'],
];

const repoRoot = path.join(__dirname, '..');
const rcRoots = [
  path.join(repoRoot, 'idreesia-web', 'node_modules', '@rc-component'),
  path.join(repoRoot, 'node_modules', '@rc-component'),
];

function ensureShim(rcRoot, pkg, linkName, target) {
  const pkgDir = path.join(rcRoot, pkg);
  const linkPath = path.join(pkgDir, linkName);
  const targetPath = path.join(pkgDir, target);

  if (!fs.existsSync(pkgDir) || !fs.existsSync(targetPath)) {
    return;
  }

  try {
    const existing = fs.lstatSync(linkPath);
    if (existing.isSymbolicLink()) {
      fs.unlinkSync(linkPath);
    } else {
      // Real file/dir already present — leave it alone.
      return;
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  fs.symlinkSync(target, linkPath, 'dir');
  // eslint-disable-next-line no-console
  console.log(
    `[meteor-fix-rc-component-exports] ${path.relative(repoRoot, linkPath)} -> ${target}`
  );
}

for (const rcRoot of rcRoots) {
  if (!fs.existsSync(rcRoot)) {
    continue;
  }
  for (const [pkg, linkName, target] of shims) {
    ensureShim(rcRoot, pkg, linkName, target);
  }
}

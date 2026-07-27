#!/usr/bin/env node

import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const INITIAL_VERSION = '1.0.0';
const PACKAGE_FILES = ['package.json', 'idreesia-web/package.json'];
const VALID_BRANCHES = new Set(['develop', 'master']);
const VALID_BUMPS = ['major', 'minor', 'patch'];

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--write') {
      args.write = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[index + 1];

      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for --${key}`);
      }

      args[key] = value;
      index += 1;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  return args;
}

function parseLabels(input = '') {
  if (!input.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(input);

    if (Array.isArray(parsed)) {
      return parsed
        .map((label) => (typeof label === 'string' ? label : label?.name))
        .filter(Boolean);
    }
  } catch {
    // Fall through to comma/newline parsing for local dry runs.
  }

  return input
    .split(/[,\n]/)
    .map((label) => label.trim())
    .filter(Boolean);
}

function resolveBump(labels) {
  const normalized = new Set(labels.map((label) => label.toLowerCase()));

  return VALID_BUMPS.find((bump) => normalized.has(bump)) ?? 'patch';
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-rc\.(\d+))?$/.exec(version);

  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    rc: match[4] ? Number(match[4]) : null,
  };
}

function formatBase(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function bumpBase(version, bump) {
  if (bump === 'major') {
    return { major: version.major + 1, minor: 0, patch: 0, rc: null };
  }

  if (bump === 'minor') {
    return { major: version.major, minor: version.minor + 1, patch: 0, rc: null };
  }

  return { major: version.major, minor: version.minor, patch: version.patch + 1, rc: null };
}

function readPackageVersions() {
  const versions = PACKAGE_FILES.map((file) => {
    const packageJson = JSON.parse(readFileSync(resolve(file), 'utf8'));

    return { file, version: packageJson.version ?? INITIAL_VERSION };
  });

  const uniqueVersions = new Set(versions.map(({ version }) => version));

  if (uniqueVersions.size > 1) {
    throw new Error(`Package versions are out of sync: ${versions.map(({ file, version }) => `${file}=${version}`).join(', ')}`);
  }

  return versions[0].version;
}

function writePackageVersions(version) {
  for (const file of PACKAGE_FILES) {
    const filePath = resolve(file);
    const packageJson = JSON.parse(readFileSync(filePath, 'utf8'));

    packageJson.version = version;
    writeFileSync(filePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  }
}

function resolveDevelopVersion({ currentVersion, bump }) {
  const current = parseVersion(currentVersion);

  if (current.rc !== null) {
    return formatBase(current);
  }

  return formatBase(bumpBase(current, bump));
}

function resolveMasterVersion({ currentVersion }) {
  const current = parseVersion(currentVersion);

  if (current.rc !== null) {
    throw new Error(`Master releases require a stable package version, received ${currentVersion}`);
  }

  return formatBase(current);
}

function dockerTagsFor(version, branch) {
  if (branch === 'develop') {
    return [];
  }

  const parsed = parseVersion(version);

  if (parsed.rc !== null) {
    throw new Error(`Stable Docker tags require a stable version, received ${version}`);
  }

  return [version, `${parsed.major}.${parsed.minor}`, `${parsed.major}`, 'latest'];
}

function writeGithubOutput(outputs) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  const content = Object.entries(outputs)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  appendFileSync(process.env.GITHUB_OUTPUT, `${content}\n`);
}

const args = parseArgs(process.argv.slice(2));
const branch = args.branch;

if (!VALID_BRANCHES.has(branch)) {
  throw new Error(`--branch must be one of: ${[...VALID_BRANCHES].join(', ')}`);
}

if (args['resolved-version']) {
  const version = args['resolved-version'];
  const channel = branch === 'develop' ? 'develop' : 'stable';
  const dockerTags = dockerTagsFor(version, branch);
  const outputs = {
    version,
    bump: 'none',
    channel,
    is_stable: branch === 'master',
    docker_tags: dockerTags.join(','),
  };

  writeGithubOutput(outputs);
  console.log(JSON.stringify(outputs, null, 2));
  process.exit(0);
}

const labels = parseLabels(args.labels);
const bump = resolveBump(labels);
const currentVersion = args['current-version'] ?? readPackageVersions();
const version = branch === 'develop'
  ? resolveDevelopVersion({ currentVersion, bump })
  : resolveMasterVersion({ currentVersion });
const channel = branch === 'develop' ? 'develop' : 'stable';
const dockerTags = dockerTagsFor(version, branch);

if (args.write) {
  writePackageVersions(version);
}

const outputs = {
  version,
  bump,
  channel,
  is_stable: branch === 'master',
  docker_tags: dockerTags.join(','),
};

writeGithubOutput(outputs);

console.log(JSON.stringify({
  ...outputs,
  labels,
  current_version: currentVersion,
}, null, 2));

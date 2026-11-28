/*
 * What the sample data scripts share: reading the settings, the guard
 * against non-local databases, ids, seeded random choices and dates.
 */
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';

// ---------------------------------------------------------------------------
// Arguments and settings
// ---------------------------------------------------------------------------

export const args = process.argv.slice(2);

/** The value after a `--name value` argument, if given. */
export function argValue(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', 'mongo'];

function isLocal(url) {
  if (url.startsWith('mongodb+srv://')) return false;
  const hosts = url.replace(/^mongodb:\/\//, '').replace(/^[^@]*@/, '').split(/[/?]/)[0];
  return hosts.split(',').every((host) => LOCAL_HOSTS.includes(host.replace(/:\d+$/, '')));
}

/**
 * MONGO_URL, read from the environment or the `--env-file` (a variable
 * already set in the environment wins). Exits unless it is a local database
 * or `--allow-remote` is passed.
 */
export function mongoUrlFromSettings() {
  if (args.includes('--env-file')) {
    const envFile = argValue('--env-file');
    if (!envFile || !existsSync(envFile)) {
      console.error(`--env-file: file not found: ${envFile}`);
      process.exit(1);
    }
    dotenv.config({ path: envFile, quiet: true });
  }

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('Missing environment variable: MONGO_URL');
    process.exit(1);
  }
  if (!isLocal(mongoUrl) && !args.includes('--allow-remote')) {
    console.error('MONGO_URL is not a local database. Pass --allow-remote if you really mean to add sample data to it.');
    process.exit(1);
  }
  return mongoUrl;
}

// ---------------------------------------------------------------------------
// Ids, numbers and random choices
// ---------------------------------------------------------------------------

const ID_CHARS = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';

/** A document id, like Meteor's Random.id(). */
export const docId = () =>
  [...randomBytes(17)].map((b) => ID_CHARS[b % ID_CHARS.length]).join('');

export const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
export const roundQuantity = (value) => Math.round((value + Number.EPSILON) * 1000) / 1000;

// Deterministic choices, so each run makes the same shape of data.
let seed = 20261128;
export const random = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const between = (min, max) => min + Math.floor(random() * (max - min + 1));
export const pickOne = (list) => list[between(0, list.length - 1)];

/** `count` different entries of the list. */
export function pickSome(list, count) {
  const chosen = new Set();
  while (chosen.size < Math.min(count, list.length)) chosen.add(pickOne(list));
  return [...chosen];
}

export const withoutUndefined = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export const now = new Date();

/** A time `days` ago at the given hour; never later than now. */
export function daysAgo(days, hour = 10, minute = 0) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date > now ? new Date(now) : date;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

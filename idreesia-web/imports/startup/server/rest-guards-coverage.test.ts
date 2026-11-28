import { describe, expect, it, vi } from 'vitest';
import type { Express, Router } from 'express';

// The app is built outside Meteor's web server; these are the Meteor-only
// pieces it imports.
vi.mock('meteor/webapp', () => ({ WebApp: { connectHandlers: { use: vi.fn() } } }));
// Only the route table is under test. The business logic behind the handlers
// needs packages that exist only inside Meteor (OpenCV, ExcelJS, ...), so it
// is replaced by stubs that are never called.
const { stub } = vi.hoisted(() => ({
  stub: () =>
    new Proxy(
      {},
      {
        has: () => true,
        get: (_target: object, key: string) => {
          if (key === 'then') return undefined;
          // Constants (MAX_FILE_SIZE, ...) are read when a module loads.
          return /^[A-Z0-9_]+$/.test(key) ? 1 : () => {};
        },
      }
    ),
}));
vi.mock('meteor/idreesia-common/server/business-logic/common/compute-image-vector-data', stub);
vi.mock('meteor/idreesia-common/server/business-logic/common/stored-attachments', stub);
vi.mock('meteor/idreesia-common/server/business-logic/admin', stub);
vi.mock('meteor/idreesia-common/server/business-logic/hr-karkuns/karkuns-exporter', stub);
vi.mock('meteor/idreesia-common/server/business-logic/security/visitors-exporter', stub);
vi.mock('meteor/idreesia-common/server/business-logic/purchasing/exporters', stub);
vi.mock('meteor/idreesia-common/server/business-logic/inventory', stub);
vi.mock('meteor/idreesia-common/server/business-logic/rocket-chat', stub);
vi.mock('meteor/idreesia-common/server/graphql-api/common/attachment/access', stub);
vi.mock('meteor/idreesia-common/server/rest-api/report-access', stub);
vi.mock('meteor/idreesia-common/server/rest-api/attachment-upload-access', stub);
vi.mock('meteor/idreesia-common/server/rest-api/password-login', stub);
vi.mock('meteor/idreesia-common/server/chat', stub);
vi.mock('./get-user', () => ({ getUser: vi.fn() }));
vi.mock('./newrelic', () => ({
  noticeError: vi.fn(),
  getBrowserMonitoringConfig: vi.fn(),
}));

import { createRestApp } from './setup-rest-endpoints';
import { isRestGuard } from './rest-guards';

/**
 * REST counterpart of graphql-api/unprotected-fields.test.ts: every route
 * must have a guard from rest-guards.ts before its handler (or sit behind a
 * router-level `router.use(guard)`). It checks that protection is declared,
 * not that it is right. The only way to exempt a route is the ALLOWED list
 * below, with the reason.
 */
const ALLOWED: Record<string, string> = {
  'POST /login': 'Exchanges credentials for a token, so it cannot need one.',
  'GET /api/monitoring-config':
    'New Relic public browser-agent identifiers, shipped in every page.',
  'POST /api/attendance/match':
    'Public attendance kiosk; returns only the matched karkun\'s name and photo, limited by its own router.',
  'POST /api/attendance/check-in':
    'Public attendance kiosk; takes the signed token from a match, limited by its own router.',
  'POST /api/attendance/check-out':
    'Public attendance kiosk; takes the signed token from a match, limited by its own router.',
  'GET /api/diagnostics/request':
    'Echo for checking the proxy chain, limited by its own router.',
};

interface Layer {
  route?: {
    path: string | string[];
    methods: Record<string, boolean>;
    stack: Array<{ handle: unknown }>;
  };
  handle: unknown & { stack?: Layer[] };
  regexp?: RegExp;
}

// '/^\/api\/workspaces\/?(?=\/|$)/i' -> '/api/workspaces'
const mountPath = (layer: Layer) => {
  const source = layer.regexp?.source ?? '';
  if (source === '^\\/?(?=\\/|$)') return '';
  return source
    .replace('^', '')
    .replace('\\/?(?=\\/|$)', '')
    .replace(/\\\//g, '/');
};

const collect = (
  stack: Layer[],
  prefix: string,
  inheritedGuard: boolean,
  found: Map<string, boolean>
) => {
  let guarded = inheritedGuard;
  stack.forEach(layer => {
    if (layer.route) {
      const paths = ([] as string[]).concat(layer.route.path);
      const routeGuarded =
        guarded || layer.route.stack.some(l => isRestGuard(l.handle));
      Object.keys(layer.route.methods).forEach(method => {
        paths.forEach(path => {
          const key = `${method.toUpperCase()} ${prefix}${path}`;
          // app.get(path, limiter) and app.get(path, guard, handler) are
          // separate routes for one path: it is guarded if any of them is.
          found.set(key, (found.get(key) ?? false) || routeGuarded);
        });
      });
    } else if (isRestGuard(layer.handle)) {
      guarded = true;
    } else if (layer.handle.stack) {
      collect(layer.handle.stack, prefix + mountPath(layer), guarded, found);
    }
  });
};

describe('REST routes', () => {
  const app = createRestApp() as Express & { _router: Router & { stack: Layer[] } };
  const found = new Map<string, boolean>();
  collect(app._router.stack, '', false, found);

  it('finds the routes', () => {
    expect(found.size).toBeGreaterThan(10);
    expect(found.get('GET /generate-report')).toBe(true);
  });

  it('has a guard on every route that is not allowed to be open', () => {
    const unguarded = [...found]
      .filter(([key, guarded]) => !guarded && !(key in ALLOWED))
      .map(([key]) => key);
    expect(unguarded).toEqual([]);
  });

  it('lists only open routes that exist and are really unguarded', () => {
    Object.keys(ALLOWED).forEach(key => {
      expect(found.has(key), `${key} no longer exists`).toBe(true);
      expect(found.get(key), `${key} is guarded; remove it from ALLOWED`).toBe(
        false
      );
    });
  });
});

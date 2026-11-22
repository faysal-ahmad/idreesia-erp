// New Relic browser error monitoring for the mobile app. The config comes from
// the ERP (/api/monitoring-config on the backend); it answers 204 when
// monitoring is disabled for that environment, in which case everything here
// is a no-op. Mirrors idreesia-web/imports/ui/monitoring.ts.
import { Meteor } from 'meteor/meteor';

import { backendUrl } from './backend';

type Attributes = Record<string, string | number | boolean>;

interface BrowserMonitoringConfig {
  environment: string;
  accountID: string;
  trustKey: string;
  agentID: string;
  licenseKey: string;
  applicationID: string;
}

interface BrowserAgentApi {
  noticeError(error: Error, customAttributes?: Attributes): void;
  setCustomAttribute(name: string, value: string | number | boolean): void;
  setUserId(value: string | null): void;
}

let agent: BrowserAgentApi | null = null;
// Errors raised before the agent finishes loading (it is fetched async so it
// never delays first render).
const pending: Array<[Error, Attributes]> = [];
let pendingUserId: string | null = null;

export const reportError = (error: unknown, attributes: Attributes = {}): void => {
  const err = error instanceof Error ? error : new Error(String(error));
  if (agent) {
    agent.noticeError(err, attributes);
  } else if (pending.length < 20) {
    pending.push([err, attributes]);
  }
};

/** Tags later errors with the signed-in user (null on logout). */
export const setMonitoringUser = (userId: string | null): void => {
  if (agent) agent.setUserId(userId);
  else pendingUserId = userId;
};

export const initMonitoring = async (): Promise<void> => {
  if (!backendUrl) return;
  try {
    const response = await fetch(`${backendUrl}/api/monitoring-config`);
    if (response.status !== 200) {
      pending.length = 0;
      return;
    }
    const config = (await response.json()) as BrowserMonitoringConfig;

    // Meteor's resolver doesn't honor package.json "exports" subpaths, so
    // import the loader by its on-disk path.
    const { BrowserAgent } = await import(
      // @ts-ignore - no types for the deep path
      '@newrelic/browser-agent/dist/esm/loaders/browser-agent'
    );

    const { accountID, trustKey, agentID, licenseKey, applicationID } = config;
    const instance: BrowserAgentApi = new BrowserAgent({
      init: {
        distributed_tracing: { enabled: true },
        // Cordova pages have no cookie-capable origin worth tracking.
        privacy: { cookies_enabled: false },
        ajax: { deny_list: ['bam.nr-data.net'] },
      },
      info: {
        beacon: 'bam.nr-data.net',
        errorBeacon: 'bam.nr-data.net',
        licenseKey,
        applicationID,
        sa: 1,
      },
      loader_config: { accountID, trustKey, agentID, licenseKey, applicationID },
    });
    instance.setCustomAttribute('environment', config.environment);
    instance.setCustomAttribute('client', 'idreesia-mobile');
    instance.setCustomAttribute('platform', Meteor.isCordova ? 'cordova' : 'browser');
    if (pendingUserId) instance.setUserId(pendingUserId);

    agent = instance;
    pending.splice(0).forEach(([err, attrs]) => instance.noticeError(err, attrs));
  } catch (e) {
    // Monitoring must never break the app (and is expected to fail offline).
    // eslint-disable-next-line no-console
    console.warn('[newrelic] mobile monitoring failed to start', e);
  }
};

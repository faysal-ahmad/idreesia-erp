// New Relic browser error monitoring. The browser can't read process.env, so
// the config comes from the server (/api/monitoring-config); it answers 204
// when monitoring is disabled for this environment, in which case everything
// here is a no-op.

interface BrowserMonitoringConfig {
  environment: string;
  accountID: string;
  trustKey: string;
  agentID: string;
  licenseKey: string;
  applicationID: string;
}

interface BrowserAgentApi {
  noticeError(
    error: Error,
    customAttributes?: Record<string, string | number | boolean>
  ): void;
  setCustomAttribute(name: string, value: string | number | boolean): void;
}

let agent: BrowserAgentApi | null = null;
// Errors raised before the agent finishes loading (it is fetched async so it
// never delays first render).
const pending: Array<[Error, Record<string, string | number | boolean>]> = [];

export const reportError = (
  error: unknown,
  attributes: Record<string, string | number | boolean> = {}
): void => {
  const err = error instanceof Error ? error : new Error(String(error));
  if (agent) {
    agent.noticeError(err, attributes);
  } else if (pending.length < 20) {
    pending.push([err, attributes]);
  }
};

export const initMonitoring = async (): Promise<void> => {
  try {
    const response = await fetch('/api/monitoring-config');
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
        privacy: { cookies_enabled: true },
        ajax: { deny_list: ['bam.nr-data.net'] },
      },
      info: {
        beacon: 'bam.nr-data.net',
        errorBeacon: 'bam.nr-data.net',
        licenseKey,
        applicationID,
        sa: 1,
      },
      loader_config: {
        accountID,
        trustKey,
        agentID,
        licenseKey,
        applicationID,
      },
    });
    instance.setCustomAttribute('environment', config.environment);

    agent = instance;
    pending.splice(0).forEach(([err, attrs]) => instance.noticeError(err, attrs));
  } catch (e) {
    // Monitoring must never break the app.
    // eslint-disable-next-line no-console
    console.warn('[newrelic] browser monitoring failed to start', e);
  }
};

// New Relic error monitoring for the server. Everything here is driven by env
// vars (see .env.example):
//   ENVIRONMENT        - 'local' | 'production'. Appended in parentheses to the
//                        New Relic app name so each environment reports to its
//                        own app and their data never mixes.
//   NEW_RELIC_ENABLED  - 'true' to start the agent.
//   NEW_RELIC_LICENSE_KEY
//
// If ENVIRONMENT is missing/invalid the agent is NOT started, so a
// misconfigured box can never report under the wrong app name.

export type AppEnvironment = 'local' | 'production';

interface NewRelicApi {
  noticeError(
    error: Error,
    customAttributes?: Record<string, string | number | boolean>
  ): void;
}

const ENVIRONMENTS: AppEnvironment[] = ['local', 'production'];

// GraphQL error codes that represent expected user-facing failures rather than
// bugs - reporting them would just add noise to the Errors inbox.
const IGNORED_ERROR_CODES = new Set([
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'BAD_USER_INPUT',
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
  'PERSISTED_QUERY_NOT_FOUND',
  'OPERATION_RESOLUTION_FAILURE',
  'BAD_REQUEST',
]);

let agent: NewRelicApi | null = null;
let environment: AppEnvironment | null = null;

export const getEnvironment = (): AppEnvironment | null => {
  const value = process.env.ENVIRONMENT;
  return ENVIRONMENTS.includes(value as AppEnvironment)
    ? (value as AppEnvironment)
    : null;
};

// Must run after dotenv has loaded .env and before anything else you want
// instrumented is imported.
export const initNewRelic = (): void => {
  if (process.env.NEW_RELIC_ENABLED !== 'true') {
    return;
  }

  const env = getEnvironment();
  if (!env) {
    // eslint-disable-next-line no-console
    console.warn(
      "[newrelic] ENVIRONMENT must be 'local' or 'production'; New Relic is disabled."
    );
    return;
  }

  if (!process.env.NEW_RELIC_LICENSE_KEY) {
    // eslint-disable-next-line no-console
    console.warn('[newrelic] NEW_RELIC_LICENSE_KEY is not set; New Relic is disabled.');
    return;
  }

  // The web and jobs pm2 processes run the same bundle, so they get separate
  // apps; the jobs process is the one with the web server turned off.
  const baseName =
    process.env.WEB_SERVER_ENABLED === 'false'
      ? 'Idreesia ERP Jobs'
      : 'Idreesia ERP';
  process.env.NEW_RELIC_APP_NAME = `${baseName} (${env})`;
  process.env.NEW_RELIC_NO_CONFIG_FILE = 'true';

  try {
     
    agent = require('newrelic') as NewRelicApi;
    environment = env;
    // eslint-disable-next-line no-console
    console.log(`[newrelic] reporting as "${process.env.NEW_RELIC_APP_NAME}"`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[newrelic] failed to start agent', e);
  }
};

export const noticeError = (
  error: unknown,
  attributes: Record<string, string | number | boolean> = {}
): void => {
  if (!agent) return;

  const err = error instanceof Error ? error : new Error(String(error));
  agent.noticeError(err, { ...attributes, environment: environment ?? '' });
};

export const isIgnoredErrorCode = (code?: unknown): boolean =>
  typeof code === 'string' && IGNORED_ERROR_CODES.has(code);

// Config handed to the browser agent by /api/monitoring-config. Returns null
// when monitoring is off so the client skips initialization entirely.
export interface BrowserMonitoringConfig {
  environment: AppEnvironment;
  accountID: string;
  trustKey: string;
  agentID: string;
  licenseKey: string;
  applicationID: string;
}

export const getBrowserMonitoringConfig =
  (): BrowserMonitoringConfig | null => {
    const env = getEnvironment();
    if (process.env.NEW_RELIC_ENABLED !== 'true' || !env) return null;

    const {
      NEW_RELIC_BROWSER_ACCOUNT_ID: accountID,
      NEW_RELIC_BROWSER_TRUST_KEY: trustKey,
      NEW_RELIC_BROWSER_AGENT_ID: agentID,
      NEW_RELIC_BROWSER_LICENSE_KEY: licenseKey,
      NEW_RELIC_BROWSER_APPLICATION_ID: applicationID,
    } = process.env;
    if (!accountID || !trustKey || !agentID || !licenseKey || !applicationID) {
      return null;
    }

    return {
      environment: env,
      accountID,
      trustKey,
      agentID,
      licenseKey,
      applicationID,
    };
  };

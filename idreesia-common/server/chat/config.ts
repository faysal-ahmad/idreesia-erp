export interface ChatConfig {
  url: string;
  userId: string;
  authToken: string;
}

const REQUIRED_VARS = [
  'ROCKETCHAT_URL',
  'ROCKETCHAT_USER_ID',
  'ROCKETCHAT_AUTH_TOKEN',
] as const;

// Read lazily rather than at import time: the server loads .env via dotenv
// during startup, which can run after this module is first imported.
export function getChatConfig(): ChatConfig {
  const missing = REQUIRED_VARS.filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Chat is not configured. Missing env vars: ${missing.join(', ')}`
    );
  }

  return {
    url: (process.env.ROCKETCHAT_URL as string).replace(/\/+$/, ''),
    userId: process.env.ROCKETCHAT_USER_ID as string,
    authToken: process.env.ROCKETCHAT_AUTH_TOKEN as string,
  };
}

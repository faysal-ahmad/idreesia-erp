export interface VideoConfig {
  url: string;
  roomSecret: string;
  /**
   * Jitsi's room census (prosody's /room-census), which lists the rooms and
   * their participant counts. Optional: without it the ERP cannot tell a
   * call that is starting from one that is running, so it never announces.
   */
  censusUrl?: string;
}

const REQUIRED_VARS = ['JITSI_URL', 'JITSI_ROOM_SECRET'] as const;

// Read lazily rather than at import time: the server loads .env via dotenv
// during startup, which can run after this module is first imported.
export function getVideoConfig(): VideoConfig {
  const missing = REQUIRED_VARS.filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Video calls are not configured. Missing env vars: ${missing.join(', ')}`
    );
  }

  return {
    url: (process.env.JITSI_URL as string).replace(/\/+$/, ''),
    roomSecret: process.env.JITSI_ROOM_SECRET as string,
    censusUrl: process.env.JITSI_ROOM_CENSUS_URL || undefined,
  };
}

import type { Job } from 'agenda';

export type ProgressReporter = (fraction: number) => Promise<void>;

const DEFAULT_MIN_INTERVAL_MS = 2000;

// Wraps job.touch(progress) with a time-based throttle so a tight loop over
// thousands of records doesn't turn into thousands of Mongo writes - the
// terminal call (fraction === 1) always goes through so 100% is never
// dropped by the throttle window. touch() can throw if the job was canceled
// mid-run; that's swallowed here since progress reporting is observability,
// not correctness - a failed touch() must not abort the caller's loop.
export function createProgressReporter(
  job: Job,
  opts?: { minIntervalMs?: number }
): ProgressReporter {
  const minIntervalMs = opts?.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
  let lastReportedAt = 0;

  return async (fraction: number) => {
    const isFinal = fraction >= 1;
    const now = Date.now();
    if (!isFinal && now - lastReportedAt < minIntervalMs) {
      return;
    }
    lastReportedAt = now;

    const progress = Math.round(Math.min(Math.max(fraction, 0), 1) * 100);
    try {
      await job.touch(progress);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `[jobs] failed to report progress for "${job.attrs.name}":`,
        error
      );
    }
  };
}

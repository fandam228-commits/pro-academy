export interface LoginAttemptLimiterOptions {
  maxAttempts?: number;
  lockoutMs?: number;
  attemptWindowMs?: number;
  maxTrackedKeys?: number;
  now?: () => number;
}

export interface LoginAttemptLimiter {
  checkLoginLock(identifier: string): number;
  recordFailedLogin(identifier: string): boolean;
  clearFailedLogins(identifier: string): void;
  getTrackedKeyCount(): number;
}

export function createLoginAttemptLimiter(options?: LoginAttemptLimiterOptions): LoginAttemptLimiter;

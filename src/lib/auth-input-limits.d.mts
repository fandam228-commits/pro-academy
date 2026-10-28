export const AUTH_INPUT_LIMITS: Readonly<{
  loginId: number;
  name: number;
  email: number;
  password: number;
}>;

export function isWithinLoginInputLimits(loginId: unknown, password: unknown): boolean;
export function isWithinRegistrationInputLimits(input?: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}): boolean;

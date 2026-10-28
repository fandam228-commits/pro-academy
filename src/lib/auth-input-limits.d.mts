export const AUTH_INPUT_LIMITS: Readonly<{
  loginId: number;
  name: number;
  email: number;
  password: number;
  stage: number;
  grade: number;
  phone: number;
  parentPhone: number;
  referralCode: number;
}>;

export function isWithinLoginInputLimits(loginId: unknown, password: unknown): boolean;
export function isWithinRegistrationInputLimits(input?: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  stage?: unknown;
  grade?: unknown;
  phone?: unknown;
  parentPhone?: unknown;
  referralCode?: unknown;
} | null): boolean;

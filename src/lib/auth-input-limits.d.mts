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
}): boolean;

export const MAX_AUTH_BODY_BYTES: number;
export function readBoundedJsonBody(
  request: Request,
  maxBytes?: number
): Promise<
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; status: 400 | 413; error: string }
>;

/**
 * Bounds authentication input before database lookups or expensive password work.
 * Optional profile fields are bounded too, because they are persisted on registration.
 */
export const AUTH_INPUT_LIMITS = Object.freeze({
  loginId: 254,
  name: 120,
  email: 254,
  password: 1024,
  stage: 64,
  grade: 100,
  phone: 32,
  parentPhone: 32,
  referralCode: 128,
});

function isOptionalStringWithinLimit(value, maxLength) {
  return value == null || (typeof value === "string" && value.length <= maxLength);
}

export function isWithinLoginInputLimits(loginId, password) {
  return (
    typeof loginId === "string" &&
    loginId.trim().length > 0 &&
    loginId.length <= AUTH_INPUT_LIMITS.loginId &&
    typeof password === "string" &&
    password.length > 0 &&
    password.length <= AUTH_INPUT_LIMITS.password
  );
}

export function isWithinRegistrationInputLimits(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;

  const { name, email, password, stage, grade, phone, parentPhone, referralCode } = input;
  return (
    typeof name === "string" &&
    name.trim().length > 0 &&
    name.length <= AUTH_INPUT_LIMITS.name &&
    typeof email === "string" &&
    email.trim().length > 0 &&
    email.length <= AUTH_INPUT_LIMITS.email &&
    typeof password === "string" &&
    password.length > 0 &&
    password.length <= AUTH_INPUT_LIMITS.password &&
    isOptionalStringWithinLimit(stage, AUTH_INPUT_LIMITS.stage) &&
    isOptionalStringWithinLimit(grade, AUTH_INPUT_LIMITS.grade) &&
    isOptionalStringWithinLimit(phone, AUTH_INPUT_LIMITS.phone) &&
    isOptionalStringWithinLimit(parentPhone, AUTH_INPUT_LIMITS.parentPhone) &&
    isOptionalStringWithinLimit(referralCode, AUTH_INPUT_LIMITS.referralCode)
  );
}

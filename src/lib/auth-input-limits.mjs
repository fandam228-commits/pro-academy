/**
 * Bounds credential input before database lookups or synchronous scrypt work.
 * These are intentionally generous limits for normal password-manager use.
 */
export const AUTH_INPUT_LIMITS = Object.freeze({
  loginId: 254,
  name: 120,
  email: 254,
  password: 1024,
});

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

export function isWithinRegistrationInputLimits({ name, email, password } = {}) {
  return (
    typeof name === "string" &&
    name.trim().length > 0 &&
    name.length <= AUTH_INPUT_LIMITS.name &&
    typeof email === "string" &&
    email.trim().length > 0 &&
    email.length <= AUTH_INPUT_LIMITS.email &&
    typeof password === "string" &&
    password.length <= AUTH_INPUT_LIMITS.password
  );
}

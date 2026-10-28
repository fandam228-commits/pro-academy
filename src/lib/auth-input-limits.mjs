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


export const MAX_AUTH_BODY_BYTES = 16 * 1024;

/**
 * Read and parse a JSON object with a strict byte limit.
 * Content-Length is an early rejection hint only; streamed bytes are also counted
 * so missing or dishonest headers cannot bypass the limit.
 */
export async function readBoundedJsonBody(request, maxBytes = MAX_AUTH_BODY_BYTES) {
  if (!request || !Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    return { ok: false, status: 400, error: "Invalid request body limit." };
  }

  const contentLength = request.headers?.get?.("content-length");
  if (contentLength !== null && contentLength !== undefined) {
    if (!/^\d+$/.test(contentLength)) {
      return { ok: false, status: 400, error: "Invalid Content-Length header." };
    }
    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength)) {
      return { ok: false, status: 400, error: "Invalid Content-Length header." };
    }
    if (declaredLength > maxBytes) {
      return { ok: false, status: 413, error: "Request body is too large." };
    }
  }

  const reader = request.body?.getReader?.();
  if (!reader) {
    return { ok: false, status: 400, error: "Request body is required." };
  }

  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 400, error: "Invalid request body stream." };
      }
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413, error: "Request body is too large." };
      }
      chunks.push(value);
    }
  } catch {
    await reader.cancel().catch(() => {});
    return { ok: false, status: 400, error: "Unable to read request body." };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return { ok: false, status: 400, error: "Malformed JSON request body." };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, status: 400, error: "Request body must be a JSON object." };
  }
  return { ok: true, value: parsed };
}

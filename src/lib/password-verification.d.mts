export function isScryptPasswordHash(stored: unknown): boolean;
export function verifyStoredPassword(password: unknown, stored: unknown): boolean;
export function isLegacyPlaintextPassword(stored: unknown): boolean;

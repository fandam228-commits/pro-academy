export function isScryptPasswordHash(stored: unknown): stored is string;
export function legacyPasswordMatches(password: string, stored: string): boolean;

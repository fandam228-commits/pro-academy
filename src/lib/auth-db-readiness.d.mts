export function prepareAuthDatabase(
  ensureDbSetup: () => Promise<unknown>
): Promise<{ ready: boolean }>;

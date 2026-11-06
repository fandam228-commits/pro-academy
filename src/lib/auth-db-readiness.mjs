/**
 * Keep authentication endpoints available to return a controlled 503 response
 * when schema setup or the database connection is unavailable.
 * Never return raw database errors to clients.
 */
export async function prepareAuthDatabase(ensureDbSetup) {
  try {
    await ensureDbSetup();
    return { ready: true };
  } catch {
    return { ready: false };
  }
}

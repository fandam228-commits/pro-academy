import { isPrivateHomeworkBlobPath } from "./homework-storage.mjs";

/**
 * Return an old private object for cleanup only after the replacement row is
 * committed to a different valid private object. Never pass legacy public URLs
 * or malformed references to the private Blob delete API.
 */
export function getSupersededPrivateHomeworkPath({
  previousStoragePath,
  nextStoragePath,
  updateSucceeded,
}) {
  if (updateSucceeded !== true) return null;
  if (!isPrivateHomeworkBlobPath(previousStoragePath)) return null;
  if (!isPrivateHomeworkBlobPath(nextStoragePath)) return null;
  if (previousStoragePath === nextStoragePath) return null;
  return previousStoragePath;
}

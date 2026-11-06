export function getSupersededPrivateHomeworkPath(input: {
  previousStoragePath: string | null | undefined;
  nextStoragePath: string | null | undefined;
  updateSucceeded: boolean;
}): string | null;

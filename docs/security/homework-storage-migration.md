# Homework submission storage migration runbook

## Purpose and safety boundary

Use this runbook to plan the migration of legacy homework submission files that may still be reachable through old public URLs. The read-only audit command only counts stored-reference categories; it does **not** establish whether an absolute URL is public and does not migrate, delete, or revoke any object.

Do not run a migration against production until the data owner approves the scope, a storage administrator confirms the provider's revocation behavior, and a tested rollback plan is available. Never put student names, IDs, file URLs, signed tokens, or per-file mappings in logs, issue comments, or committed artifacts.

## Phase 1 — Read-only inventory

1. Use a disposable/local PostgreSQL fixture first and run `npm run audit:homework-storage`.
2. Confirm the command exits successfully and reports only aggregate counts.
3. For a remote audit, obtain explicit owner approval first. Use a read-only database credential with the minimum permission needed to select `homework_submissions.storage_path`; only then set `ALLOW_REMOTE_HOMEWORK_STORAGE_AUDIT=true`. This flag is an opt-in guard, not a substitute for approval or read-only database permissions.
4. Treat `absoluteUrlNeedsReview` as a review queue, **not** as proof that the URL is public. Determine access mode and object ownership in the storage provider's console using an authorized operator. Keep any URL-to-record mapping in a restricted, short-lived location outside the repository.

## Phase 2 — Prepare a migration

Before touching stored objects:

- Confirm the destination is a **private** Blob store and that the private read/write token is scoped to that store.
- Test upload, authorized download, and denied download behavior with synthetic files in a non-production environment.
- Define a stable, unique mapping from each legacy object to a private pathname under `homework/`. Reject path traversal, unexpected schemes, and duplicate destination paths.
- Preserve a protected rollback mapping outside source control. Do not log raw source URLs or private tokens.
- Decide how to handle missing, corrupt, duplicate, or unowned objects before starting.

## Phase 3 — Controlled migration (not implemented by the audit command)

Use a separately reviewed migration utility or an operator-approved provider workflow. The migration must:

1. Read the exact submission row and legacy reference under least-privilege access.
2. Fetch the source object only through an authorized provider operation.
3. Copy the bytes and required content metadata to private storage.
4. Verify the destination object by size and cryptographic digest before changing the database reference.
5. Update only the matching `homework_submissions.storage_path` row, with an expected-old-value check so concurrent changes are not overwritten.
6. Record a non-sensitive success/failure count. Keep per-object diagnostics in the restricted migration record, not application logs.
7. Be restartable and idempotent; failed copies must leave the existing database reference unchanged.

Do not bulk-update all rows based only on URL shape. Do not delete source objects before every corresponding private copy and database reference has been verified.

## Phase 4 — Revoke and verify legacy access

After the private copy and reference update are verified:

1. Revoke or delete the old public object using the storage provider's supported operation and an authorized operator account.
2. Verify the old URL is no longer anonymously accessible from a clean session. If the provider uses caches or immutable public URLs, confirm the provider-specific invalidation procedure and its completion.
3. Verify the new private file route allows only the submission's student and the authorized teacher/administrator according to application policy; verify unrelated students, unrelated teachers, and unlinked parents are denied.
4. Verify responses use private/no-store caching and that the route never redirects to a legacy public URL.
5. Re-run the read-only audit and review the aggregate counts. Any remaining absolute URLs or unknown references require explicit investigation; do not assume they are public or safe.

## Rollback and stop conditions

- Stop if source ownership is unclear, digest verification fails, the database row changed unexpectedly, or old-object revocation cannot be confirmed.
- Roll back a database reference only after confirming the original source is still available and the rollback will not restore public access unintentionally.
- If a legacy object cannot be made private or revoked, keep the secure application route returning a non-redirecting error and escalate to the storage owner; do not restore a public redirect for convenience.
- Keep an auditable, access-controlled summary of counts, operator approvals, migration version, and verification results. Do not include student identifiers, raw URLs, file contents, or tokens.

## Current status

This document is a runbook only. The repository's audit command is read-only and does not perform any migration or revoke legacy public URLs. Production migration remains blocked until the required approvals, provider access, and a tested migration implementation are available.

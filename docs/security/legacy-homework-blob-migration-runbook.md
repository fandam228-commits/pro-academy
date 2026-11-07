# Legacy Homework Blob Migration and Revocation Runbook

## Purpose

This runbook describes the controlled process for moving legacy homework attachments from public Blob URLs to the private homework Blob store, then revoking the old public objects at the storage provider.

**A \`410 Gone\` response from \`/api/homework/file/[id]\` is not revocation.** It only prevents the application from redirecting an authorized caller to a legacy URL. Anyone who already has a public Blob URL may still be able to request that URL directly until the provider-side object is deleted or made private.

This document is an operational checklist, not authorization to access or modify production data or storage.

## Security invariants

- Never paste a legacy Blob URL, student name, submission ID, or database connection string into chat, an issue, a pull-request comment, CI logs, or a shared document. A public Blob URL may be a bearer credential.
- Use a dedicated private Blob store and \`HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN\`. Do not reuse the public media store token.
- The application must store only a private Blob pathname (for example, a validated \`homework/...\` path), never a public URL, for migrated submissions.
- Do not restore an old public URL as a rollback strategy. If migration fails, keep the application fail-closed and recover from an approved secure source.
- Do not delete a legacy object until its private replacement has been copied, verified, referenced by the database, and tested through the authenticated application route.
- Provider-side deletion or privacy changes require explicit owner approval and a separately authorized operator.

## Phase 0 — Approval and preparation

Before touching any production resource:

1. Obtain written approval for the exact production database, Blob store, migration window, operator, and permitted actions.
2. Confirm a tested database backup and a recoverable source copy of each attachment.
3. Confirm that the private Blob store exists and that its token is scoped to that store. Never place the token in source control or a PR.
4. Review the current private-file implementation and tests:
   - \`src/app/api/homework/route.ts\`
   - \`src/app/api/homework/file/[id]/route.ts\`
   - \`src/lib/homework-storage.mjs\`
   - \`src/lib/homework-replacement.mjs\`
5. Confirm that the deployed application returns no \`storagePath\` values to clients and that legacy URLs are not redirected by the application.

Stop if the private store, backup, ownership approval, or recovery source is unavailable.

## Phase 1 — Read-only inventory

The audit utility is deliberately aggregate-only. It does not print stored paths, submission IDs, student IDs, or database connection details.

1. Review \`scripts/audit-homework-storage.mjs\` and \`src/lib/homework-storage-audit.mjs\` at the exact commit intended for the audit.
2. Run the audit first against a disposable local database fixture.
3. For a production read-only inventory, obtain separate approval and use a dedicated read-only database role. Remote execution is rejected by default and requires both:
   - \`ALLOW_REMOTE_HOMEWORK_STORAGE_AUDIT=true\`
   - exactly one \`sslmode=verify-full\` parameter in \`DATABASE_URL\`
4. Capture only the aggregate summary in the approved change record.

Interpretation:

- \`vercelPublicBlobUrlNeedsReview\` identifies references on known Vercel public Blob hostnames. It does not prove that an object still exists or is accessible.
- \`absoluteUrlNeedsReview\` identifies other absolute URLs that need provider review.
- \`privatePath\` counts paths matching the current private \`homework/\` path policy.
- \`unknownOrMalformed\` and \`empty\` require investigation; do not silently classify them as migrated.

**The aggregate audit is not a migration manifest.** Counts alone cannot identify which object belongs to which submission. Do not infer or reconstruct row-level references from counts.

## Phase 2 — Build a restricted migration manifest

A separate, owner-approved migration utility must produce a row-level manifest in a controlled environment. This is intentionally outside the aggregate audit command.

The manifest may contain bearer URLs and student-related identifiers. Therefore:

- Restrict access to the named migration operator.
- Encrypt it at rest using an approved key-management process.
- Keep it outside the repository, CI artifacts, shared logs, and ordinary backups that are broadly accessible.
- Include only the minimum mapping required: submission identifier, legacy object reference, expected size/type, and a private destination path.
- Do not print row values. Log only counts and opaque batch numbers.
- Verify that every source reference belongs to the expected Vercel Blob store before any provider operation.

If the manifest cannot be protected and access-audited, stop. Do not export raw URLs to a normal CSV or spreadsheet.

## Phase 3 — Copy and verify into private storage

For each approved manifest row:

1. Read the source object using the authorized provider process.
2. Upload it to the dedicated private store under a unique validated \`homework/\` pathname.
3. Verify the private object exists and compare its byte length and SHA-256 digest with the source bytes.
4. Confirm that the private object is not anonymously accessible.
5. Record only the opaque batch identifier and aggregate success/failure counts.

Do not update the database pointer for a failed or unverified copy. Do not reuse a destination pathname across submissions.

## Phase 4 — Switch the database reference safely

Use a reviewed migration utility with a transaction and compare-and-swap condition:

- Update only the intended submission row.
- Match both the submission ID and the exact previously observed \`storage_path\`.
- Set \`storage_path\` to the verified private pathname, not a URL.
- Require exactly one updated row; treat zero or multiple rows as a conflict and stop that item.
- Keep the migration idempotent so rerunning a completed batch does not overwrite newer submissions.

The existing application route should continue to fail closed for legacy absolute URLs. Do not temporarily re-enable redirects to make migration easier.

## Phase 5 — Verify application authorization

For each migrated test cohort, verify through the application route using non-production test accounts or an approved controlled test:

- The submitting student can download only their own attachment.
- A different student receives the same not-found response as a missing submission.
- The current owning teacher can access submissions for their own homework/course only.
- A teacher who does not own the homework or its currently linked course is denied.
- An admin can access according to the application's admin policy.
- A parent or unsupported role cannot use this endpoint.
- Responses do not expose \`storagePath\` and use private/no-store cache headers.

Also test the old source URL directly at the storage provider after revocation; testing only the application endpoint is insufficient.

## Phase 6 — Revoke legacy public objects

Only after every reference in the approved batch has a verified private replacement and the application checks pass:

1. Obtain explicit approval for provider-side deletion or privacy conversion of the exact approved batch.
2. Use the provider's supported management operation against the validated source objects only.
3. Record aggregate deleted/changed/failed counts; never log the URLs.
4. Verify directly with an unauthenticated request to each source object using the restricted migration utility. The old public URL must no longer return the original object.
5. If any object remains public or provider deletion is uncertain, mark the batch incomplete and escalate. Do not claim revocation based on the application's \`410\` response.

The cleanup helper for superseded private homework files intentionally preserves legacy public URLs and malformed paths. It is not a substitute for this provider-side revocation phase.

## Phase 7 — Reconcile and close

1. Re-run the read-only aggregate audit against the approved target.
2. Reconcile the before/after counts with the approved manifest totals.
3. Require zero remaining known Vercel public Blob references for the completed scope. Investigate unknown and other absolute URLs separately.
4. Verify a sample of private files and all failed/conflict rows.
5. Retain the encrypted manifest only for the approved retention period, then securely destroy it and its temporary copies.
6. Record the commit, operator, approval, batch totals, verification evidence, and unresolved exceptions without recording raw URLs or student identifiers.

## Stop conditions

Stop the affected batch immediately if any of the following occurs:

- The database is not read-only during inventory.
- Remote TLS verification is missing or ambiguous.
- The source hostname/store does not match the approved provider.
- A private copy fails size or digest verification.
- A compare-and-swap update affects anything other than exactly one row.
- An unauthorized account can retrieve the private attachment.
- An old public source URL remains accessible after the revocation operation.
- Logs or artifacts expose a raw URL, student identifier, submission identifier, or secret.

## Scope and safety boundary

This runbook does not authorize a production database connection, production data read/write, Blob upload/copy/delete, secret rotation, environment-setting changes, or deployment. Each of those requires separate explicit approval and an operator-controlled execution window.

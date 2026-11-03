# Legacy Homework Blob Migration and Revocation Runbook

## Purpose and safety boundary

Use this runbook to plan remediation of homework submission files that were uploaded to a public Blob store. The application rejecting a legacy URL does **not** revoke the original object URL.

This document is a procedure, not authorization to operate on production. Do not inspect or mutate production storage, production database records, secrets, or environment settings unless the repository owner separately authorizes that specific operation. This runbook has not been executed against production.

## Phase 0 — prerequisites and stop conditions

- [ ] Obtain written owner approval naming the environment, storage account, scope, operator, and permitted actions.
- [ ] Confirm the private Blob store exists and is configured for private access.
- [ ] Confirm the dedicated `HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN` is scoped only to the intended private store. Never place the token in source control, issue comments, logs, or reports.
- [ ] Confirm the reviewed application version stores private Blob pathnames and serves files only through the authenticated authorization route.
- [ ] Use a maintenance/change window and define an operator, reviewer, rollback owner, and incident contact.
- [ ] Stop if the token, store identity, source-object inventory, database mapping, or rollback plan cannot be verified.

## Phase 1 — read-only inventory (metadata only)

Run a provider-supported listing operation with read-only permissions where available. Do not download student files during inventory.

For each object, collect only the minimum metadata needed to classify and plan remediation:
- stable provider object identifier or pathname;
- access classification (public/private/unknown);
- creation time, byte size, and content type;
- whether a matching homework-submission record exists;
- a generated inventory row ID for audit correlation.

Do **not** include public URLs, signed URLs, tokens, student names, answer text, or file contents in standard output, issue comments, or the summary report. If a temporary mapping is necessary, keep it encrypted, access-controlled, time-limited, and outside the repository. Restrict access to the smallest authorized group.

Produce a sanitized summary containing counts only: total objects, public objects, private objects, unknown-access objects, matched submission records, unmatched objects, duplicate mappings, and records requiring manual review. Preserve a checksum of the sanitized report and record the inventory time and operator.

Stop and request review if any object cannot be mapped unambiguously to a submission or if the provider cannot reliably report its access mode.

## Phase 2 — dry-run migration plan

For each confirmed public object:
1. Resolve its submission record using the private, access-controlled mapping; do not infer ownership from a user-supplied URL.
2. Determine a deterministic destination pathname under the approved private namespace, such as `homework/<opaque-submission-id>_<safe-file-name>`. Do not embed student names or other personal information.
3. Record expected source size, content type, destination pathname, and a cryptographic content hash where it can be calculated by an authorized migration worker.
4. Confirm the destination is private and the dedicated token cannot write to unrelated stores.
5. Generate a dry-run report with planned actions and counts only. No object, database row, or environment setting should change during dry-run.

Require a second-person review of the dry-run report before execution.

## Phase 3 — authorized migration

Only after separate owner approval:
1. Copy each approved object through an authorized migration worker into the private store; do not expose object bytes or URLs in logs.
2. Verify destination size, content type, and SHA-256 (or an equivalent strong content digest) against the source.
3. Update the corresponding submission record to store the private pathname, not a public URL. Use a transaction or a recoverable per-object journal so partial failures can be identified and retried safely.
4. Verify the application can read the private object through the authenticated route for an authorized user.
5. Keep the source object until the destination and database mapping have been verified and the rollback checkpoint has been approved.

Do not change production database rows or storage objects as part of ordinary CI, preview deployment, or this documentation PR.

## Phase 4 — revoke legacy public access

After migration verification and explicit owner approval:
- Revoke public access or delete the old public object using the provider's supported control for that object.
- Do not assume changing the database path or returning HTTP 410 from the application revokes the original URL.
- Check the provider's documented cache/CDN behavior and follow its invalidation procedure if applicable.
- Verify the old object is no longer anonymously retrievable without printing or recording the raw URL in shared logs.
- Keep a restricted audit record keyed by opaque object IDs, action time, result, and operator; publish only aggregate counts.

If revocation fails, treat the object as still exposed, retain the incident record, and escalate to the storage owner/provider. Do not report completion based only on an application-level 401/403/410 response.

## Phase 5 — application and privacy verification

Use test accounts and non-production fixtures to verify:
- unauthenticated file requests are denied;
- students can access only their own submission files;
- teachers can access only submissions for homework they own;
- administrators follow the documented privileged-access policy;
- unauthorized responses never redirect to a public Blob URL;
- successful responses stream content through the authorized route and include `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`;
- API payloads do not expose internal storage pathnames;
- missing private-store configuration fails closed for file uploads and reads;
- legacy absolute public URLs are rejected by the application;
- old provider objects are independently verified as revoked after the authorized operation.

Run automated unit, PostgreSQL integration, typecheck, lint, and production-build checks on the feature branch. A successful CI run verifies code and test fixtures only; it does not prove production objects have been migrated or revoked.

## Rollback and completion criteria

- Keep a restricted per-object journal of source identity, destination pathname, hashes, database-update result, and revocation result. Never put raw public URLs or credentials in the journal.
- If a copy or verification fails, do not update the database pointer for that object. If a database update fails, retain the verified private copy and retry from the journal after review.
- Do not restore anonymous public access as a rollback mechanism. Prefer restoring a previously verified private pathname or pausing affected downloads until the object is repaired.
- Declare completion only when every in-scope public object is accounted for as migrated-and-verified, explicitly excluded with an approved reason, or escalated as unresolved; every corresponding old public object has a recorded revocation result; and the final sanitized counts reconcile with the initial inventory.

## Required final report

Report the environment and approved scope, timestamps, operator/reviewer, aggregate inventory counts, migrated/verified/revoked/unresolved counts, verification evidence, exceptions, and rollback readiness. Do not include credentials, student identifiers, file contents, or public/signed URLs.

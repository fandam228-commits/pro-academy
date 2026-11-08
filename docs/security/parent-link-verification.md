# Parent-link verification for student reports

Parent links are not authorization evidence until an administrator explicitly verifies them.

## Data model

- `parent_links.verified_at` records when an administrator verified the relationship.
- `parent_links.verified_by` records the administrator account that performed the verification.
- Existing rows are migrated with both fields set to `NULL` and therefore fail closed for parent-facing Analytics until reviewed.
- The columns are added with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so existing databases can upgrade without dropping rows.

## Admin workflow

1. Independently confirm the parent/student relationship using the academy's approved process and evidence. Do not treat a row in `parent_links` alone as proof.
2. As an authenticated administrator, send `POST /api/parent-links/{id}/verify` for the exact link ID.
3. The endpoint checks that the linked accounts currently have roles `parent` and `student`, then records the verifier and timestamp.
4. To revoke the authorization later, send `DELETE /api/parent-links/{id}/verify`. This clears the verification fields without deleting the relationship row.
5. Verify that parent Analytics only resolves students whose links have both verification fields and whose student account still exists with role `student`.

## Safety and limitations

- These endpoints are administrator-only. A successful request records an administrator's attestation; it does not independently establish legal guardianship or perform identity proofing.
- Existing links are intentionally not auto-verified. This may temporarily deny parent report access until links are reviewed.
- Do not bulk-mark legacy links verified without independent evidence.
- This change modifies application schema code only. It does not run migrations against production, change secrets, or alter production data.

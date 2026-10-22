# Professional Academy — Platform Audit & Execution Roadmap

> Working document based on a limited source-code inspection on 2026-10-22. This is not a claim that every listed feature is working in production. Confirm each item through code review and end-to-end testing before release.

## Verified in source code inspected
- PostgreSQL schema includes user accounts with roles, and course/quiz/question-related data structures.
- `src/app/api/auth/route.ts` implements the authentication route and references password hashing, session handling, login lockout, and legacy-password upgrade helpers.
- `src/app/api/quizzes/route.ts` provides authenticated quiz API handling and imports quiz, question, submission, and user tables.
- `src/app/api/question-bank/route.ts` provides question-bank API handling and imports for bulk question import and exam-attempt data.
- `src/components/QuizPlayer.tsx` contains the client-side quiz player.
- Draft PR #3 concerns large PDF upload and course linking. It is not merged and documents a storage security concern: a public Blob URL could bypass course permissions if obtained. Do not treat it as production-ready.

## Priority order

### P0 — Protect and verify access
- Run a full login/register/logout test for admin, teacher, and student accounts.
- Verify password hashing, session creation/expiry, logout invalidation, login lockout, and role checks on every protected API.
- Confirm no API response exposes password hashes, session tokens, answer keys to students, or private course files.
- Review any default/demo credentials and remove unsafe production defaults without breaking the owner's access.
- Confirm production environment variables and database connectivity without exposing secrets.

### P1 — Student authentication and enrolment
- Reproduce the previously reported student registration failure and `Authentication failed` symptom.
- Capture the exact failing API response and server log; fix the root cause rather than bypassing authentication.
- Test new student creation, duplicate email/username, sign-in, sign-out, refresh, and correct post-login destination.
- Verify students can access only courses they are enrolled in.

### P2 — Course and lesson journey
- Audit course → unit → lesson → resource relationships.
- Test lesson listing, video playback, PDF access, progress tracking, and return-to-course navigation.
- Verify admin/teacher CRUD actions and student read-only boundaries.
- Ensure course-specific resources cannot be opened by a non-enrolled student through a guessed URL.

### P3 — Quizzes and question bank
- Test question import, validation, duplicate handling, unit/grade filters, and exam generation.
- Test quiz start, timer, answer submission, automatic marking, score persistence, and result review.
- Confirm correct answers and explanations are withheld until the permitted stage.
- Add source-file questions only after extracting the actual uploaded file; never invent answer keys.

### P4 — Centre administration
- Audit student roster, class/group assignment, attendance, fees/payments, activation codes, notifications, reports, and parent access.
- Mark each feature as implemented, partial, missing, or failing based on actual code and test results.
- Implement only after verifying existing routes/components to avoid duplicate systems.

### P5 — Release readiness
- Run lint, typecheck, production build, and targeted end-to-end tests.
- Test on desktop and mobile, Arabic RTL layout, and student/teacher/admin roles.
- Use a preview deployment first; do not publish until tests pass and protected-file storage is secured.

## Acceptance checklist
- [ ] Admin login/logout verified
- [ ] Student registration/login/logout verified
- [ ] Teacher permissions verified
- [ ] Course enrolment restrictions verified
- [ ] Course → unit → lesson navigation verified
- [ ] PDF/video access restrictions verified
- [ ] Quiz submission and scoring verified
- [ ] Question bank import verified
- [ ] Attendance and fee workflows verified
- [ ] Lint/typecheck/build pass
- [ ] Preview regression tests pass
- [ ] Protected PDF storage confirmed private or equivalently access-controlled

## Immediate next engineering task
Start with P0/P1: inspect the full auth route, security helpers, database migrations, and UI login/register flows; reproduce the known authentication failure; add a regression test or documented reproducible test before changing production behavior.

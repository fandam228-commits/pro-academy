You are implementing AI Video Studio inside the EXISTING Professional Academy repository. Work only on branch feature/ai-video-studio; do not use main or another feature branch as the target. Repository: https://github.com/fandam228-commits/pro-academy

Read docs/AI_VIDEO_STUDIO_IMPLEMENTATION.md first. Inspect the repository locally before modifying code: package.json, .env.example, src/app/page.tsx, navigation/tab routing, auth/session/RBAC, database schema/migrations, Vercel Blob utilities, existing upload routes, and GitHub Actions. Do not assume paths or APIs without reading them. Existing stack is Next.js 16 App Router, React 19, TypeScript, Tailwind 4, PostgreSQL/Drizzle and Vercel Blob.

NON-NEGOTIABLE SAFETY:
- Stay on feature/ai-video-studio; do not merge, deploy, change production Vercel settings, or touch unrelated branches/PRs.
- Preserve the existing platform UI and authentication. Integrate a workspace using existing design conventions; do not replace the main page or redesign the whole site.
- Every API endpoint must use the repository's real server-side auth/session and role checks. Verify project ownership on every read/write/job request.
- Secrets are server-only environment variables; never use NEXT_PUBLIC_ for keys and never commit real values. Add placeholders only to .env.example.
- Never claim a feature is implemented if it is only a mock. Provider-not-configured and worker-unavailable states must be explicit and user-friendly.
- Do not run FFmpeg or Remotion as long-running work inside Vercel request handlers. Use a dedicated worker/job service with authenticated server-to-server requests; if unavailable, implement a clean adapter interface and clear setup/status UI rather than fake processing.
- Never modify or overwrite the original uploaded video. All cuts are proposals until the teacher approves them.
- Use safe upload validation, file size/duration limits, path/URL validation, idempotent jobs, bounded retries, and safe logging.

FEATURES:
1) Silence removal: use FFmpeg silencedetect in the worker to propose ranges, with adjustable thresholds/padding. Reviewable timeline; no automatic destructive cuts.
2) Repetition detection: use transcript timestamps to flag probable repeated phrases for manual review. Do not aggressively delete legitimate repeated teaching examples.
3) Arabic captions: server-side Whisper-compatible transcription adapter, editable RTL transcript, validated timestamps, SRT/VTT export, mixed Arabic/English handling.
4) Smart B-roll: transcript-based shot suggestions and optional provider adapter. Provider choice must be configurable; user explicitly approves generation and placement. Manual media upload fallback.
5) Educational pop-ups: editable timeline overlays (English term, Arabic meaning, example, start/end, style), branded but consistent with existing design. Render through a Remotion composition in the dedicated worker.
6) Audio enhancement: FFmpeg loudness normalization and optional denoise controls; optional ElevenLabs adapter only for supported API operations. No media sent to a third party without explicit user action.
7) Exports: MP4 H.264/AAC presets for 9:16 1080x1920, 16:9 1920x1080, 1:1 1080x1080, plus job progress, failure reason, retry/cancel if supported, and output validation.
8) Persistence: use current Drizzle patterns and suitable private blob storage; inspect existing storage/access control before reuse.

IMPLEMENT IN THIS ORDER:
A. Audit and write a concise note of findings. Check whether this branch already contains changes before adding anything.
B. Implement a small working vertical slice with typed domain models, validation, feature status, authenticated project APIs, and a workspace entry in the existing app. Don't disrupt existing route/tab logic.
C. Implement tests for timeline ranges, overlapping/invalid timestamps, export presets, provider missing-key states, and access control as feasible in the current test setup.
D. Add transcription/caption adapter and SRT/VTT output.
E. Add worker contract + FFmpeg processing and exports; if the worker cannot be run locally, tests must use a fake adapter and the UI must show the real integration as unavailable.
F. Add overlays/Remotion and B-roll provider adapters, then audio enhancements.
G. Update .env.example and docs with setup steps, local testing, worker deployment requirements, provider cost/privacy notes, and known limitations.

ENV PLACEHOLDERS (adapt if existing names already exist; avoid duplicates):
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
VIDEO_BROLL_PROVIDER=
VIDEO_BROLL_API_KEY=
VIDEO_WORKER_URL=
VIDEO_WORKER_TOKEN=
VIDEO_STUDIO_MAX_UPLOAD_MB=500
VIDEO_STUDIO_MAX_DURATION_SECONDS=3600

VALIDATION REQUIRED:
- Run npm ci (if appropriate), npm run typecheck, npm run lint, npm run build, and any relevant tests.
- Add/adjust tests; inspect final git diff and ensure no unrelated changes or secrets.
- Report exact commands and pass/fail outputs. If a command cannot run, state why; do not mark it passed.
- Test unauthenticated access, user A trying to access user B's project, missing provider keys, malformed timestamps, Arabic/mixed-language captions, worker unavailable/timeout, upload limits, and each export preset.
- Do not deploy or merge. Create/update a DRAFT pull request targeting main only after the branch changes are committed and the checks have been run. Summarize changed files, tests, setup requirements, and any incomplete provider/worker integration in the PR.

# AI Video Studio — Implementation Plan

## Repository audit (2026-10-24)

- Repository: fandam228-commits/pro-academy; default branch: main.
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, PostgreSQL + Drizzle ORM, Vercel Blob.
- Existing app is an authenticated single-page application routed through src/app/page.tsx; API routes live under src/app/api/.
- Existing scripts: npm run typecheck, npm run lint, npm run build.
- Existing environment template: .env.example.
- Active work already exists in separate branches/PRs. This feature is isolated on feature/ai-video-studio, based on main.
- This branch must not be merged or deployed until local checks and a real end-to-end test pass.

## Product scope

Create a teacher-focused AI video editing workspace for Mr. Habib El Rahman. Upload a source video, review an edit plan, approve cuts and overlays, then export social-ready video. The original asset must remain unchanged.

## Feature requirements

1. Silence and repetition cuts
   - Use FFmpeg silencedetect to propose silence ranges.
   - Repetition removal must be conservative: use transcript segments to flag likely repeated phrases, not automatically delete by default.
   - Display proposed cuts on a timeline; user can accept/reject each cut.
   - Add configurable minimum silence duration, padding before/after, and a preview step.
2. Arabic synchronized captions
   - Use a server-side transcription adapter (Whisper-compatible provider) returning text and timestamps.
   - Generate editable Arabic RTL captions and downloadable SRT/VTT.
   - Preserve punctuation, handle mixed Arabic/English, and let users correct transcript text before rendering.
3. Smart B-roll
   - Generate scene suggestions from transcript segments; show a prompt, reason, duration, and insertion point.
   - Integrate providers behind a server-side adapter; never assume a provider/API is configured.
   - User must approve generated media and placement before render. Fall back to manual upload if no provider key is configured.
4. Educational pop-ups
   - Editable overlay objects with start/end time, English term, Arabic explanation, optional example, and style.
   - Render overlays through Remotion or an isolated render worker; keep brand styling configurable.
5. Audio enhancement
   - FFmpeg filter chain for loudness normalization and optional denoise; make intensity adjustable.
   - Optional ElevenLabs provider adapter for supported audio enhancement/voice tasks; don't send media without explicit user action.
6. Export presets
   - 9:16 vertical (1080x1920), 16:9 landscape (1920x1080), and 1:1 square (1080x1080).
   - H.264/AAC MP4, configurable quality, progress state, cancel/retry where supported, and output validation.
7. Persistence and security
   - Persist project metadata and processing state with the existing PostgreSQL/Drizzle patterns; store large assets in existing configured blob storage or a compatible private object store.
   - Enforce existing authenticated session and role permissions on every API route; inspect the actual auth/session implementation before coding.
   - Validate file type, duration, size, ownership, and all user-controlled paths. Do not trust client-supplied blob URLs.
   - Keep provider keys server-only. Never prefix secrets with NEXT_PUBLIC_; never commit real secrets.
   - Use short-lived signed URLs/private storage where available. Apply retention and deletion behavior.
   - Do not use Vercel request handlers as long-running FFmpeg/Remotion workers. Put CPU-heavy processing in a dedicated worker/container/job runner and have Next.js create/status/cancel jobs.
   - Add job idempotency, bounded retries, per-user quotas, and safe logs that exclude transcript/media contents and secrets.

## Recommended architecture

- Next.js UI: authenticated route/tab integrated with existing app navigation and design system.
- API: src/app/api/video-studio/projects, transcribe, jobs, jobs/[id], assets (adapt to existing route conventions).
- Domain modules: src/lib/video-studio/types.ts, providers/transcription.ts, providers/audio.ts, providers/broll.ts, timeline.ts, validation.ts.
- Worker: separate service for FFmpeg and Remotion rendering; HTTP/job queue contract documented and authenticated. Do not bundle FFmpeg binaries into a Vercel function.
- Database: use Drizzle schema/migration conventions already present; inspect schema and migration tooling first.
- Storage: prefer existing Vercel Blob integration if its current access-control model is suitable; verify privacy and signed URL behavior before using it for source media.
- Provider adapters must report a clear “not configured” status rather than crashing the workspace.

## Suggested server-only environment variables

Add placeholders only to .env.example; real values belong in local .env or Vercel project settings, never Git.

OPENAI_API_KEY=
ELEVENLABS_API_KEY=
VIDEO_BROLL_PROVIDER=
VIDEO_BROLL_API_KEY=
VIDEO_WORKER_URL=
VIDEO_WORKER_TOKEN=
VIDEO_STUDIO_MAX_UPLOAD_MB=500
VIDEO_STUDIO_MAX_DURATION_SECONDS=3600

Use OPENAI_API_KEY only if the selected transcription adapter uses the OpenAI API. Select the actual B-roll vendor after checking current API availability, pricing, and licensing. VIDEO_WORKER_TOKEN must be checked server-to-server and must not be exposed to the browser.

## Implementation phases and acceptance criteria

### Phase 0 — audit (required before edits)
- Read auth/session/RBAC, schema, storage utilities, navigation, styling, and CI workflows.
- Identify existing upload size limits and blob access controls.
- Record any open PR/branch conflicts; do not alter them.

### Phase 1 — safe vertical slice
- Add typed project/timeline models, validation, provider status checks, and a gated workspace.
- Add project create/read and job status APIs protected by existing auth and ownership checks.
- Add unit tests for timeline validation, export presets, and provider-not-configured behavior.
- UI can display an unavailable integration as disabled with setup instructions.

### Phase 2 — transcription and captions
- Implement server-side transcription adapter, transcript editing, SRT/VTT generation, and timestamp validation.
- Test Arabic text and mixed Arabic/English segments.

### Phase 3 — media worker
- Implement FFmpeg silence analysis, proposed cuts, audio normalization, and export in the dedicated worker.
- Implement actual video rendering only after worker deployment/configuration is available.
- Never silently apply cuts; require review/approval.

### Phase 4 — educational overlays and B-roll
- Build editable timed overlays and Remotion render composition.
- Add provider-backed B-roll generation behind explicit user approval and manual fallback.

### Phase 5 — validation and release gate
- Run npm ci, npm run typecheck, npm run lint, npm run build, and tests.
- Test upload limits, unauthenticated access, cross-user project access, missing keys, worker timeout, malformed timestamps, Arabic captions, cancel/retry, and all export presets.
- Verify no secrets appear in client bundles, logs, or commits.
- Attach results to a draft PR. Do not merge, change production environment settings, or deploy without explicit approval.

## Known limitations before implementation

- Repository inspection is read-only and cannot run local commands. A Codex local environment must execute tests and inspect any files not retrieved during the initial audit.
- B-roll generation and long-running rendering depend on external providers and a worker service; code must clearly distinguish implemented integrations from placeholders.

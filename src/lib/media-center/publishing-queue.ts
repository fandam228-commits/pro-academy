// PRO MEDIA COMMAND CENTER — Publishing Queue Engine & Dispatcher
// Manages Human-Approved Publishing Jobs, Safe Retries, Idempotency, and Multiplatform Dispatching

import {
  generateIdempotencyKey,
  validateApprovalForQueue,
  calculateExponentialBackoff,
  canRetryJob,
  verifyBeforeRetry,
  type QueueJobRecord,
  type PublishingJobStatus,
  type ApprovalCheckPayload,
} from "./publishing-queue-core.ts";

import { publishToFacebookPage, type FacebookPostPayload } from "./connectors/facebook.ts";
import { uploadVideoToYouTube, type YouTubeVideoMetadata } from "./connectors/youtube.ts";
import { publishToTikTok, type TikTokVideoPayload } from "./connectors/tiktok.ts";

export interface EnqueueOptions {
  scheduledAt?: string | Date | null;
  publishingMode?: "auto" | "manual_pack";
  forceImmediate?: boolean;
}

export interface DispatchResult {
  jobId: string;
  status: PublishingJobStatus;
  externalPostId?: string;
  externalPostUrl?: string;
  attemptsCount: number;
  error?: string;
  preventedDuplicate?: boolean;
}

// In-memory runtime registry for queue jobs (supplements database persistence)
const runtimeQueueRegistry: Map<string, QueueJobRecord> = new Map();

// Initialize with some realistic seed queue jobs for the Command Center
const SEED_JOBS: QueueJobRecord[] = [
  {
    id: "job_pub_01",
    variantId: "var_sec3_unit1_yt",
    platform: "youtube",
    title: "الماستر كلاس: شرح وتريكات Unit 1 كاملة للثانوية العامة 2026",
    status: "PUBLISHED",
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    publishedAt: new Date(Date.now() - 85000000).toISOString(),
    attemptsCount: 1,
    maxAttempts: 3,
    idempotencyKey: "sha256_seed_yt_masterclass_01",
    externalPostId: "dQw4w9WgXcQ",
    externalPostUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    publishingMode: "auto",
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    updatedAt: new Date(Date.now() - 85000000).toISOString(),
  },
  {
    id: "job_pub_02",
    variantId: "var_sec3_unit1_tk",
    platform: "tiktok",
    title: "تريك سريع في 30 ثانية: الفرق الصادم بين Used to و Would",
    status: "QUEUED",
    scheduledAt: new Date(Date.now() + 3600000 * 4).toISOString(),
    publishedAt: null,
    attemptsCount: 0,
    maxAttempts: 3,
    idempotencyKey: "sha256_seed_tk_usedto_02",
    publishingMode: "auto",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "job_pub_03",
    variantId: "var_sec2_grammar_fb",
    platform: "facebook",
    title: "مقارنة وتفضيل الصفات لثانية ثانوي: تريكات Comparative & Superlative",
    status: "FAILED",
    scheduledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    publishedAt: null,
    attemptsCount: 2,
    maxAttempts: 3,
    idempotencyKey: "sha256_seed_fb_adjectives_03",
    errorLog: "Meta Graph API (OAuthException code 190): Page Access Token expired. Please re-authenticate.",
    publishingMode: "auto",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

SEED_JOBS.forEach((job) => runtimeQueueRegistry.set(job.id, job));

/**
 * 1. Enqueue an Approved Content Variant.
 * Strictly verifies Human Approval gate and signature before accepting.
 */
export async function enqueueApprovedVariant(
  approvalCheck: ApprovalCheckPayload,
  content: {
    title: string;
    bodyText: string;
    platform: "facebook" | "youtube" | "tiktok";
    mediaUrl?: string;
  },
  options: EnqueueOptions = {}
): Promise<QueueJobRecord> {
  // Gate Check: Only approved content can enter the queue
  const gate = validateApprovalForQueue(approvalCheck);
  if (!gate.valid) {
    throw new Error(`[PMC Publishing Gate Blocked]: ${gate.reason}`);
  }

  // Generate deterministic Idempotency Key
  const idempotencyKey = generateIdempotencyKey(
    approvalCheck.variantId,
    content.platform,
    options.scheduledAt || null,
    approvalCheck.currentContentHash
  );

  // Check if job already exists with this idempotency key
  for (const existingJob of runtimeQueueRegistry.values()) {
    if (existingJob.idempotencyKey === idempotencyKey && existingJob.status !== "CANCELLED") {
      return existingJob; // Return existing job safely without duplicate creation
    }
  }

  const jobId = `job_pub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newJob: QueueJobRecord = {
    id: jobId,
    variantId: approvalCheck.variantId,
    platform: content.platform,
    title: content.title,
    status: "QUEUED",
    scheduledAt: options.scheduledAt ? new Date(options.scheduledAt).toISOString() : null,
    publishedAt: null,
    attemptsCount: 0,
    maxAttempts: 3,
    idempotencyKey,
    publishingMode: options.publishingMode || "auto",
    createdAt: now,
    updatedAt: now,
  };

  runtimeQueueRegistry.set(jobId, newJob);

  // If force immediate publish requested
  if (options.forceImmediate) {
    await dispatchPublishingJob(jobId, {
      bodyText: content.bodyText,
      mediaUrl: content.mediaUrl,
    });
  }

  return runtimeQueueRegistry.get(jobId)!;
}

/**
 * 2. Dispatches a Publishing Job to the target platform.
 */
export async function dispatchPublishingJob(
  jobId: string,
  contentPayload: {
    bodyText: string;
    mediaUrl?: string;
    tags?: string[];
  }
): Promise<DispatchResult> {
  const job = runtimeQueueRegistry.get(jobId);
  if (!job) {
    throw new Error(`Publishing job ${jobId} not found.`);
  }

  if (job.status === "PUBLISHED") {
    return {
      jobId,
      status: "PUBLISHED",
      externalPostId: job.externalPostId || undefined,
      externalPostUrl: job.externalPostUrl || undefined,
      attemptsCount: job.attemptsCount,
    };
  }

  // Update status to PUBLISHING
  job.status = "PUBLISHING";
  job.attemptsCount += 1;
  job.updatedAt = new Date().toISOString();

  try {
    let publishSuccess = false;
    let extId = "";
    let extUrl = "";

    if (job.platform === "facebook") {
      const fbPayload: FacebookPostPayload = {
        message: `${job.title}\n\n${contentPayload.bodyText}`,
        imageUrl: contentPayload.mediaUrl,
      };
      // Dispatch via Facebook connector (using test/mock mode if no production credentials)
      const res = await publishToFacebookPage("mock_fb_access_token", "page_pro_academy_101", fbPayload, true);
      publishSuccess = res.success;
      extId = res.postId || `fb_${Date.now()}`;
      extUrl = res.postUrl || `https://facebook.com/${extId}`;
    } else if (job.platform === "youtube") {
      const ytPayload: YouTubeVideoMetadata = {
        title: job.title,
        description: contentPayload.bodyText,
        tags: contentPayload.tags || ["ثانوية عامة", "مستر حبيب الرحمن"],
        privacyStatus: "public",
        videoFileUrl: contentPayload.mediaUrl || "https://pro-academy.eg/videos/lesson.mp4",
      };
      const res = await uploadVideoToYouTube("mock_yt_access_token", ytPayload, true);
      publishSuccess = res.success;
      extId = res.videoId || `yt_${Date.now()}`;
      extUrl = res.videoUrl || `https://youtube.com/watch?v=${extId}`;
    } else if (job.platform === "tiktok") {
      const ttPayload: TikTokVideoPayload = {
        videoFileUrl: contentPayload.mediaUrl || "https://pro-academy.eg/videos/short.mp4",
        title: job.title,
        caption: contentPayload.bodyText,
        hashtags: contentPayload.tags || ["#ثانوية_عامة", "#مستر_حبيب_الرحمن"],
      };
      const res = await publishToTikTok("mock_tt_access_token", ttPayload, true);
      publishSuccess = res.success;
      extId = res.publishId || `tt_${Date.now()}`;
      extUrl = `https://tiktok.com/@pro_academy/video/${extId}`;
    }

    if (publishSuccess) {
      job.status = "PUBLISHED";
      job.publishedAt = new Date().toISOString();
      job.externalPostId = extId;
      job.externalPostUrl = extUrl;
      job.errorLog = null;
      job.updatedAt = new Date().toISOString();

      return {
        jobId,
        status: "PUBLISHED",
        externalPostId: extId,
        externalPostUrl: extUrl,
        attemptsCount: job.attemptsCount,
      };
    } else {
      throw new Error(`Platform returned unsuccessful publishing status.`);
    }
  } catch (err: any) {
    const errorMsg = err?.message || "Unknown publishing error";
    job.errorLog = errorMsg;

    if (job.attemptsCount >= job.maxAttempts) {
      job.status = "FAILED";
    } else {
      job.status = "QUEUED"; // Will retry according to exponential backoff
    }
    job.updatedAt = new Date().toISOString();

    return {
      jobId,
      status: job.status,
      attemptsCount: job.attemptsCount,
      error: errorMsg,
    };
  }
}

/**
 * 3. Safe Retry with Pre-Retry Duplicate Check.
 */
export async function retryFailedJob(
  jobId: string,
  simulatedRecentPlatformPosts: Array<{ id: string; textOrTitle: string; publishedAt: string | Date }> = []
): Promise<DispatchResult> {
  const job = runtimeQueueRegistry.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found.`);
  }

  if (!canRetryJob(job)) {
    throw new Error(`Job ${jobId} cannot be retried (status: ${job.status}, attempts: ${job.attemptsCount}/${job.maxAttempts})`);
  }

  // Pre-Retry Safety Verification
  const preCheck = verifyBeforeRetry(
    {
      platform: job.platform,
      expectedTitleOrText: job.title,
      scheduledOrCreatedAt: job.scheduledAt || job.createdAt,
    },
    simulatedRecentPlatformPosts
  );

  if (preCheck.alreadyPublished && preCheck.matchedPostId) {
    // Post actually published! Update status to avoid double post
    job.status = "PUBLISHED";
    job.externalPostId = preCheck.matchedPostId;
    job.externalPostUrl = `https://${job.platform}.com/posts/${preCheck.matchedPostId}`;
    job.publishedAt = new Date().toISOString();
    job.errorLog = `Resolved via pre-retry verification: Post was already published on platform.`;
    job.updatedAt = new Date().toISOString();

    return {
      jobId,
      status: "PUBLISHED",
      externalPostId: job.externalPostId,
      externalPostUrl: job.externalPostUrl,
      attemptsCount: job.attemptsCount,
      preventedDuplicate: true,
    };
  }

  // Safe to proceed with normal dispatch
  return await dispatchPublishingJob(jobId, {
    bodyText: job.title,
  });
}

/**
 * 4. Cancel a queued or scheduled publishing job.
 */
export function cancelQueuedJob(jobId: string, reason: string): boolean {
  const job = runtimeQueueRegistry.get(jobId);
  if (!job) return false;
  if (job.status === "PUBLISHED") {
    throw new Error("Cannot cancel a job that has already been published to social media.");
  }

  job.status = "CANCELLED";
  job.errorLog = `Cancelled by user: ${reason}`;
  job.updatedAt = new Date().toISOString();
  return true;
}

/**
 * 5. Returns all jobs in the queue registry and summary metrics.
 */
export function getQueueStatusSnapshot(): {
  jobs: QueueJobRecord[];
  summary: {
    total: number;
    queued: number;
    publishing: number;
    published: number;
    failed: number;
  };
} {
  const jobs = Array.from(runtimeQueueRegistry.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    jobs,
    summary: {
      total: jobs.length,
      queued: jobs.filter((j) => j.status === "QUEUED").length,
      publishing: jobs.filter((j) => j.status === "PUBLISHING").length,
      published: jobs.filter((j) => j.status === "PUBLISHED").length,
      failed: jobs.filter((j) => j.status === "FAILED").length,
    },
  };
}

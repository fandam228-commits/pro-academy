/**
 * PRO MEDIA COMMAND CENTER (PMC) — Database Schema
 * Professional Academy — Mr. Habib El Rahman
 * 
 * Strict isolation: All tables are prefixed with 'pmc_'
 * Zero modification or mutation to existing Professional Academy tables.
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// 1. SOCIAL ACCOUNTS TABLE
export const pmcSocialAccounts = pgTable(
  "pmc_social_accounts",
  {
    id: text("id").primaryKey(), // e.g. 'acc_facebook_pro_academy'
    platform: text("platform").notNull(), // 'facebook', 'youtube', 'tiktok'
    accountId: text("account_id").notNull(),
    accountName: text("account_name").notNull(),
    avatarUrl: text("avatar_url"),
    pageId: text("page_id"), // For Facebook Pages
    channelId: text("channel_id"), // For YouTube Channels
    encryptedAccessToken: text("encrypted_access_token"), // AES-256-GCM
    encryptedRefreshToken: text("encrypted_refresh_token"), // AES-256-GCM
    tokenExpiresAt: timestamp("token_expires_at"),
    scopes: jsonb("scopes").default([]),
    isConnected: boolean("is_connected").default(false).notNull(),
    lastTestedAt: timestamp("last_tested_at"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("pmc_social_platform_account_idx").on(table.platform, table.accountId),
    index("pmc_social_platform_idx").on(table.platform),
  ]
);

// 2. CONTENT PROJECTS (MASTER TOPIC / LESSON)
export const pmcContentProjects = pgTable(
  "pmc_content_projects",
  {
    id: text("id").primaryKey(), // e.g. 'proj_unit1_past_simple'
    title: text("title").notNull(),
    stage: text("stage").notNull().default("Secondary"), // 'Preparatory', 'Secondary', 'General'
    grade: text("grade").notNull().default("Third Secondary (Baccalaureate)"),
    curriculumUnitId: text("curriculum_unit_id"),
    sourceType: text("source_type").notNull().default("manual_prompt"), // 'curriculum_lesson', 'question_bank', 'pdf_document', 'manual_prompt'
    sourceReference: text("source_reference"),
    sourceText: text("source_text"),
    createdBy: text("created_by").notNull().default("usr_admin_habib"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_projects_stage_grade_idx").on(table.stage, table.grade),
    index("pmc_projects_created_at_idx").on(table.createdAt),
  ]
);

// 3. CONTENT VARIANTS (ADAPTED PER PLATFORM)
export const pmcContentVariants = pgTable(
  "pmc_content_variants",
  {
    id: text("id").primaryKey(), // e.g. 'var_fb_123'
    projectId: text("project_id").notNull(),
    platform: text("platform").notNull(), // 'facebook', 'youtube', 'tiktok'
    postType: text("post_type").notNull().default("post"), // 'post', 'reel', 'video', 'short'
    hook: text("hook"),
    script: text("script"),
    caption: text("caption"),
    description: text("description"),
    tags: jsonb("tags").default([]),
    hashtags: jsonb("hashtags").default([]),
    cta: text("cta"),
    thumbnailText: text("thumbnail_text"),
    mediaAssetId: text("media_asset_id"),
    status: text("status").notNull().default("DRAFT"), // 'DRAFT', 'GENERATING', 'READY_FOR_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'CANCELLED'
    version: integer("version").default(1).notNull(),
    contentHash: text("content_hash"), // SHA-256 hash of content payload to detect tampering
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_variants_project_idx").on(table.projectId),
    index("pmc_variants_platform_status_idx").on(table.platform, table.status),
  ]
);

// 4. MEDIA ASSETS (VIDEOS, THUMBNAILS, AUDIO)
export const pmcMediaAssets = pgTable(
  "pmc_media_assets",
  {
    id: text("id").primaryKey(), // e.g. 'asset_thumb_123'
    projectId: text("project_id"),
    variantId: text("variant_id"),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull().default("image"), // 'image', 'video', 'audio', 'thumbnail'
    dimensions: text("dimensions").default("9:16"), // '9:16', '16:9', '1:1'
    durationSeconds: integer("duration_seconds"),
    sizeBytes: integer("size_bytes"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_assets_project_idx").on(table.projectId),
    index("pmc_assets_type_idx").on(table.fileType),
  ]
);

// 5. APPROVAL REQUESTS (MANDATORY HUMAN-IN-THE-LOOP)
export const pmcApprovalRequests = pgTable(
  "pmc_approval_requests",
  {
    id: text("id").primaryKey(), // e.g. 'appr_req_123'
    variantId: text("variant_id").notNull(),
    platform: text("platform").notNull(),
    requestedBy: text("requested_by").notNull(),
    approvedBy: text("approved_by"), // Must be 'usr_admin_habib' or Super Admin
    status: text("status").notNull().default("PENDING"), // 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'
    rejectionReason: text("rejection_reason"),
    revisionNotes: text("revision_notes"),
    contentSnapshotHash: text("content_snapshot_hash").notNull(), // Exact cryptographic snapshot hash
    approvedAt: timestamp("approved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_approval_variant_idx").on(table.variantId),
    index("pmc_approval_status_idx").on(table.status),
  ]
);

// 6. PUBLISHING JOBS & QUEUE
export const pmcPublishingJobs = pgTable(
  "pmc_publishing_jobs",
  {
    id: text("id").primaryKey(), // e.g. 'job_pub_123'
    variantId: text("variant_id").notNull(),
    platform: text("platform").notNull(),
    status: text("status").notNull().default("QUEUED"), // 'QUEUED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'CANCELLED'
    scheduledAt: timestamp("scheduled_at"),
    publishedAt: timestamp("published_at"),
    attemptsCount: integer("attempts_count").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    idempotencyKey: text("idempotency_key").notNull().unique(), // Deterministic SHA-256
    externalPostId: text("external_post_id"),
    externalPostUrl: text("external_post_url"),
    errorLog: text("error_log"),
    publishingMode: text("publishing_mode").default("auto"), // 'auto', 'manual_pack'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_publishing_status_scheduled_idx").on(table.status, table.scheduledAt),
    uniqueIndex("pmc_publishing_idempotency_idx").on(table.idempotencyKey),
  ]
);

// 7. ANALYTICS SNAPSHOTS (REAL PLATFORM METRICS)
export const pmcAnalyticsSnapshots = pgTable(
  "pmc_analytics_snapshots",
  {
    id: text("id").primaryKey(),
    platform: text("platform").notNull(), // 'facebook', 'youtube', 'tiktok'
    externalPostId: text("external_post_id").notNull(),
    variantId: text("variant_id"),
    views: integer("views").default(0).notNull(),
    impressions: integer("impressions").default(0).notNull(),
    reach: integer("reach").default(0).notNull(),
    reactions: integer("reactions").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    sharesCount: integer("shares_count").default(0).notNull(),
    watchTimeMinutes: decimal("watch_time_minutes", { precision: 10, scale: 2 }).default("0.00"),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_analytics_platform_post_idx").on(table.platform, table.externalPostId),
    index("pmc_analytics_recorded_at_idx").on(table.recordedAt),
  ]
);

// 8. COMMUNITY INTERACTIONS (COMMENTS & INQUIRIES)
export const pmcCommunityInteractions = pgTable(
  "pmc_community_interactions",
  {
    id: text("id").primaryKey(),
    platform: text("platform").notNull(),
    externalPostId: text("external_post_id"),
    commentId: text("comment_id").notNull(),
    authorName: text("author_name"),
    authorAvatar: text("author_avatar"),
    commentBody: text("comment_body").notNull(),
    classification: text("classification").default("general"), // 'subscription_inquiry', 'grammar_question', 'praise', 'exam_query', 'spam'
    aiSuggestedReply: text("ai_suggested_reply"),
    approvedReply: text("approved_reply"),
    status: text("status").default("pending_review").notNull(), // 'pending_review', 'replied', 'ignored'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    repliedAt: timestamp("replied_at"),
  },
  (table) => [
    uniqueIndex("pmc_community_platform_comment_idx").on(table.platform, table.commentId),
    index("pmc_community_status_idx").on(table.status),
  ]
);

// 9. MARKETING CAMPAIGNS FOR ACADEMY ENROLLMENT
export const pmcMarketingCampaigns = pgTable(
  "pmc_marketing_campaigns",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    goal: text("goal").notNull(), // 'thanawya_amma_prep', 'free_exam_viral', 'revision_promo', 'general_enrollment'
    targetStage: text("target_stage").default("Secondary"),
    targetGrade: text("target_grade").default("Third Secondary (Baccalaureate)"),
    budgetEgp: decimal("budget_egp", { precision: 10, scale: 2 }).default("0.00"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    status: text("status").default("active").notNull(), // 'active', 'completed', 'paused'
    cta: text("cta"),
    resultsSummary: jsonb("results_summary").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_campaigns_status_idx").on(table.status),
  ]
);

// 10. COMPLIANCE & SECURITY AUDIT LOGS
export const pmcAuditLogs = pgTable(
  "pmc_audit_logs",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").notNull(),
    actorName: text("actor_name").notNull(),
    action: text("action").notNull(), // 'APPROVE', 'REJECT', 'PUBLISH_INITIATE', 'CONNECT_ACCOUNT', 'REVOKE_TOKEN'
    entityType: text("entity_type").notNull(), // 'variant', 'approval_request', 'publishing_job', 'social_account'
    entityId: text("entity_id"),
    ipAddress: text("ip_address"),
    details: jsonb("details").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_audit_action_idx").on(table.action),
    index("pmc_audit_actor_idx").on(table.actorId),
    index("pmc_audit_created_at_idx").on(table.createdAt),
  ]
);

// 11. IN-APP COMMAND CENTER NOTIFICATIONS
export const pmcNotifications = pgTable(
  "pmc_notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull(), // 'approval_needed', 'publish_success', 'publish_failed', 'token_expiry', 'security_alert'
    actionUrl: text("action_url"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("pmc_notif_user_read_idx").on(table.userId, table.isRead),
  ]
);

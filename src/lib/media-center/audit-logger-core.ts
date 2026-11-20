// PRO MEDIA COMMAND CENTER — Audit Logging Core & Secret Redaction
// Comprehensive traceability and compliance for all administrative and publishing actions

export type AuditAction =
  | "APPROVE"
  | "REJECT"
  | "REQUEST_REVISION"
  | "PUBLISH_INITIATE"
  | "PUBLISH_SUCCESS"
  | "PUBLISH_FAILED"
  | "CONNECT_ACCOUNT"
  | "DISCONNECT_ACCOUNT"
  | "TOKEN_REFRESH"
  | "RESCHEDULE"
  | "REPLY_DISPATCH"
  | "CREATE_CAMPAIGN";

export type AuditEntityType =
  | "variant"
  | "approval_request"
  | "publishing_job"
  | "social_account"
  | "comment_reply"
  | "calendar_item"
  | "campaign";

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  ipAddress?: string | null;
  details: Record<string, any>;
  createdAt: string;
}

const SENSITIVE_KEYS = [
  "token",
  "secret",
  "password",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "appsecret",
  "clientsecret",
  "apikey",
  "privatekey",
];

/**
 * 1. Deep Redaction of Sensitive Secrets:
 * Recursively scrubs any tokens, client secrets, passwords, or keys from log payloads.
 */
export function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") {
    // If string looks like a JWT or long bearer token
    if (data.startsWith("Bearer ") || data.startsWith("EAA") || data.startsWith("ya29.")) {
      return "[REDACTED_TOKEN]";
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }
  if (typeof data === "object") {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z]/g, "");
      const isSensitive = SENSITIVE_KEYS.some((sk) => lowerKey.includes(sk));
      if (isSensitive) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = redactSensitiveData(val);
      }
    }
    return sanitized;
  }
  return data;
}

/**
 * 2. Formats a structured audit log entry with automatic sanitization.
 */
export function createAuditLogEntry(payload: {
  actorId: string;
  actorName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  ipAddress?: string | null;
  details?: Record<string, any>;
}): AuditLogRecord {
  const sanitizedDetails = redactSensitiveData(payload.details || {});

  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId: payload.actorId,
    actorName: payload.actorName,
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId || null,
    ipAddress: payload.ipAddress || "127.0.0.1",
    details: sanitizedDetails,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 3. Filters audit log entries by action, actor, entity, or search keyword.
 */
export function filterAuditLogs(
  logs: AuditLogRecord[],
  filters: {
    action?: string;
    actorId?: string;
    entityType?: string;
    search?: string;
  }
): AuditLogRecord[] {
  return logs.filter((log) => {
    if (filters.action && filters.action !== "all" && log.action !== filters.action) {
      return false;
    }
    if (filters.actorId && filters.actorId !== "all" && log.actorId !== filters.actorId) {
      return false;
    }
    if (filters.entityType && filters.entityType !== "all" && log.entityType !== filters.entityType) {
      return false;
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const match =
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        (log.entityId && log.entityId.toLowerCase().includes(q)) ||
        JSON.stringify(log.details).toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

/**
 * 4. Realistic Audit History Seed for Professional Academy
 */
export function getSeedAuditLogs(): AuditLogRecord[] {
  return [
    {
      id: "audit_init_01",
      actorId: "usr_admin_habib",
      actorName: "Mr. Habib El Rahman",
      action: "APPROVE",
      entityType: "variant",
      entityId: "var_sec3_unit1_yt",
      ipAddress: "197.38.112.44",
      details: {
        platform: "youtube",
        title: "الماستر كلاس: شرح وتريكات Unit 1 كاملة للثانوية العامة 2026",
        contentHash: "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        status: "APPROVED",
      },
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "audit_init_02",
      actorId: "usr_admin_habib",
      actorName: "Mr. Habib El Rahman",
      action: "PUBLISH_INITIATE",
      entityType: "publishing_job",
      entityId: "job_pub_01",
      ipAddress: "197.38.112.44",
      details: {
        platform: "youtube",
        idempotencyKey: "sha256_seed_yt_masterclass_01",
        mode: "auto",
      },
      createdAt: new Date(Date.now() - 85000000).toISOString(),
    },
    {
      id: "audit_init_03",
      actorId: "usr_admin_habib",
      actorName: "Mr. Habib El Rahman",
      action: "CONNECT_ACCOUNT",
      entityType: "social_account",
      entityId: "acc_fb_pro_academy",
      ipAddress: "197.38.112.44",
      details: {
        platform: "facebook",
        pageName: "Professional Academy — Mr. Habib El Rahman",
        scopesGranted: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
        accessToken: "[REDACTED]",
      },
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "audit_init_04",
      actorId: "usr_editor_ahmed",
      actorName: "Ahmed (Content Editor)",
      action: "RESCHEDULE",
      entityType: "calendar_item",
      entityId: "cal_init_04",
      ipAddress: "197.38.115.12",
      details: {
        previousDate: "2026-11-23",
        newDate: "2026-11-25",
        reason: "Coordinating with Thanawya Amma school exam timetable",
      },
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: "audit_init_05",
      actorId: "usr_admin_habib",
      actorName: "Mr. Habib El Rahman",
      action: "REPLY_DISPATCH",
      entityType: "comment_reply",
      entityId: "comm_03",
      ipAddress: "197.38.112.44",
      details: {
        platform: "tiktok",
        studentName: "زياد خالد",
        replySnippet: "تسلم يا زياد، ربنا يوفقك ويكتبلك أعلى مجموع في الثانوية العامة...",
      },
      createdAt: new Date(Date.now() - 82000000).toISOString(),
    },
  ];
}

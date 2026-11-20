// PRO MEDIA COMMAND CENTER — Audit Logger Service
// Runtime registry and database persistence for audit logs

import {
  createAuditLogEntry,
  filterAuditLogs,
  getSeedAuditLogs,
  type AuditAction,
  type AuditEntityType,
  type AuditLogRecord,
} from "./audit-logger-core.ts";

// In-memory runtime storage
const runtimeAuditStore: AuditLogRecord[] = getSeedAuditLogs();

export interface RecordAuditOptions {
  actorId: string;
  actorName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  ipAddress?: string | null;
  details?: Record<string, any>;
}

/**
 * 1. Records an audit log event.
 */
export async function recordAuditLog(options: RecordAuditOptions): Promise<AuditLogRecord> {
  const entry = createAuditLogEntry(options);
  runtimeAuditStore.unshift(entry);
  return entry;
}

/**
 * 2. Fetches audit logs with filtering and analytics.
 */
export async function getAuditLogHistory(filters: {
  action?: string;
  actorId?: string;
  entityType?: string;
  search?: string;
  limit?: number;
}): Promise<{
  logs: AuditLogRecord[];
  summary: {
    total: number;
    approvalsCount: number;
    publishingActionsCount: number;
    accountConnectionsCount: number;
    rescheduledCount: number;
  };
}> {
  const filtered = filterAuditLogs(runtimeAuditStore, filters);
  const limit = filters.limit || 50;

  return {
    logs: filtered.slice(0, limit),
    summary: {
      total: runtimeAuditStore.length,
      approvalsCount: runtimeAuditStore.filter((l) => l.action === "APPROVE").length,
      publishingActionsCount: runtimeAuditStore.filter(
        (l) => l.action === "PUBLISH_INITIATE" || l.action === "PUBLISH_SUCCESS"
      ).length,
      accountConnectionsCount: runtimeAuditStore.filter(
        (l) => l.action === "CONNECT_ACCOUNT" || l.action === "DISCONNECT_ACCOUNT"
      ).length,
      rescheduledCount: runtimeAuditStore.filter((l) => l.action === "RESCHEDULE").length,
    },
  };
}

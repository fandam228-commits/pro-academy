import webpush from "web-push";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { pushSubscriptions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

const KEYS_PATH = path.join(process.cwd(), "storage", "vapid.json");

interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

let cachedKeys: VapidKeys | null = null;

/** Loads VAPID keys from env → disk → generates & persists them on first run. */
export function getVapidKeys(): VapidKeys {
  if (cachedKeys) return cachedKeys;

  // 1) Environment variables take priority (production friendly)
  const envPub = process.env.VAPID_PUBLIC_KEY;
  const envPriv = process.env.VAPID_PRIVATE_KEY;
  if (envPub && envPriv) {
    cachedKeys = { publicKey: envPub, privateKey: envPriv };
    return cachedKeys;
  }

  // 2) Persisted keys on disk
  try {
    if (fs.existsSync(KEYS_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(KEYS_PATH, "utf-8"));
      if (parsed.publicKey && parsed.privateKey) {
        cachedKeys = parsed;
        return cachedKeys as VapidKeys;
      }
    }
  } catch {}

  // 3) Generate a fresh pair and persist
  const generated = webpush.generateVAPIDKeys();
  cachedKeys = { publicKey: generated.publicKey, privateKey: generated.privateKey };
  try {
    fs.mkdirSync(path.dirname(KEYS_PATH), { recursive: true });
    fs.writeFileSync(KEYS_PATH, JSON.stringify(cachedKeys), "utf-8");
  } catch {}
  return cachedKeys;
}

function configureWebPush() {
  const keys = getVapidKeys();
  webpush.setVapidDetails("mailto:support@proacademy.com", keys.publicKey, keys.privateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/** Sends a web push to every device registered for a user. Cleans up dead endpoints. */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  try {
    configureWebPush();
    const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    let sent = 0;

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: any) {
        // 404/410 = expired subscription → remove it
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
        }
      }
    }
    return sent;
  } catch {
    return 0;
  }
}

/** Stores an in-app notification AND fires a device push in one call. */
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: string = "info",
  url?: string
) {
  try {
    await db.insert(notifications).values({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      type,
    });
  } catch {}
  await sendPushToUser(userId, { title, body: message, url });
}

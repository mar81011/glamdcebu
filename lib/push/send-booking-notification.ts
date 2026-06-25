import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export interface BookingNotificationPayload {
  customerName: string;
  date: string;
  time: string;
  visitType: string;
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@glamdcebu.com";

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function notifyAdminsOfBooking(
  payload: BookingNotificationPayload,
): Promise<void> {
  if (!configureWebPush()) return;

  const admin = createAdminClient();
  if (!admin) return;

  const { data: ownerProfiles } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "owner");

  const ownerIds = ownerProfiles?.map((p) => p.id) ?? [];
  if (!ownerIds.length) return;

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", ownerIds);

  if (!subscriptions?.length) return;

  const visitLabel =
    payload.visitType === "home_service" ? "Home service" : "Walk-in";
  const body = `${payload.customerName} · ${payload.date} at ${payload.time} · ${visitLabel}`;

  const notification = JSON.stringify({
    title: "New booking — GLAM'D Cebu",
    body,
    url: "/admin",
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          notification,
        );
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }),
  );
}


import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPush(subscription: any, payload: any) {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

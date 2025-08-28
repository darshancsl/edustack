import { http } from "../lib/http";

export async function devPurchase(courseSlug: string) {
  const { data } = await http.post<{ msg: string; orderId: string; courseSlug: string }>("/api/checkout/dev/purchase", { courseSlug });
  return data;
}

// For Stripe later: create intent and use Stripe Elements on client
export async function createStripeIntent(courseSlug: string) {
  const { data } = await http.post<{ clientSecret: string; orderId: string }>("/api/checkout/stripe/create-intent", { courseSlug });
  return data;
}

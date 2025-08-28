import { http } from "../lib/http";

export async function getSummary(days = 30) {
  const { data } = await http.get(`/api/analytics/summary`, { params: { days } });
  return data as { visits: number; logins: number; signups: number; purchases: number; revenue: number; dau: number };
}
export async function getTimeseries(metric: "visits"|"logins"|"purchases"|"revenue", days = 30) {
  const { data } = await http.get(`/api/analytics/timeseries`, { params: { metric, days } });
  return data as { items: { day: string; value: number }[] };
}
export async function getTopCourses(days = 30, limit = 5) {
  const { data } = await http.get(`/api/analytics/top-courses`, { params: { days, limit } });
  return data as { items: { courseSlug: string; revenue: number; sales: number }[] };
}
export async function getRecentOrders(limit = 10) {
  const { data } = await http.get(`/api/analytics/recent-orders`, { params: { limit } });
  return data as { items: { _id: string; courseSlug: string; amount: number; currency: string; userId: string; createdAt: string }[] };
}

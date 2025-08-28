import { http } from "../lib/http";
import type { Course } from "./courses";

export type MyEnrollment = {
  course: Pick<Course, "slug"|"title"|"subtitle"|"heroImage"|"accessPeriod"|"price"|"salePrice">;
  progressPct: number;
  lastLessonId?: string;
  purchasedAt: string;
  expiresAt?: string;
  expired: boolean;
};

export async function listMyEnrollments() {
  const { data } = await http.get<{ items: MyEnrollment[] }>("/api/enrollments/me");
  return data.items;
}

export async function hasEnrollment(slug: string) {
  const { data } = await http.get<{ owned: boolean }>(`/api/enrollments/${slug}/owned`);
  return data.owned;
}

export async function updateProgress(slug: string, progressPct: number, lastLessonId?: string) {
  const { data } = await http.patch<{ msg: string; progressPct: number; lastLessonId?: string }>(`/api/enrollments/${slug}/progress`, { progressPct, lastLessonId });
  return data;
}

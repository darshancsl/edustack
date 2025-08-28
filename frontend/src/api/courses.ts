import { http } from '../lib/http';

export type Lesson = { id: string; title: string; duration?: string };
export type Section = { id: string; title: string; items: Lesson[] };
export type Course = {
  slug: string;
  title: string;
  subtitle?: string;
  heroImage?: string;
  price: number;
  salePrice?: number;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  language?: string;
  lastUpdated?: string;
  description: string;
  whatYouWillLearn: string[];
  category?: "category-1" | "category-2" | "category-3";
  accessPeriod?: "lifetime" | "30d" | "90d" | "180d" | "365d";
  toc: Section[];
};
export type ListResponse = { page: number; limit: number; total: number; items: Course[] };

export async function listCourses(params?: {
  q?: string;
  level?: string;
  page?: number;
  limit?: number;
  category?: 'category-1' | 'category-2' | 'category-3';
  sortBy?: 'updatedAt' | 'category' | 'price';
  order?: 'asc' | 'desc';
}) {
  const { data } = await http.get<ListResponse>('/api/courses', { params });
  return data;
}

export async function getCourse(slug: string) {
  const { data } = await http.get<Course>(`/api/courses/${slug}`);
  return data;
}
export async function createCourse(payload: Partial<Course>) {
  const { data } = await http.post<{ msg: string; slug: string }>('/api/courses', payload);
  return data;
}
export async function updateCourse(slug: string, payload: Partial<Course>) {
  const { data } = await http.put<{ msg: string; slug: string }>(`/api/courses/${slug}`, payload);
  return data;
}

export async function deleteCourse(slug: string) {
  const { data } = await http.delete<{ msg: string }>(`/api/courses/${slug}`);
  return data;
}
export async function duplicateCourse(slug: string) {
  const { data } = await http.post<{ msg: string; slug: string }>(
    `/api/courses/${slug}/duplicate`,
    {},
  );
  return data;
}

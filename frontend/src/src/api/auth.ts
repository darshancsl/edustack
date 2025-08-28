import { http } from '../../lib/http';

export type LoginPayload = { email: string; password: string };
export type AuthUser = { id: string; name: string; email: string; role: 'user' | 'admin' };
export type LoginResponse = { user: AuthUser; token: string };

export async function loginApi(data: LoginPayload): Promise<LoginResponse> {
  const res = await http.post<LoginResponse>('/api/auth/login', data);
  return res.data;
}

export async function forgotPassword(email: string) {
  const { data } = await http.post('/api/auth/forgot-password', { email });
  return data;
}

export async function resetPasswordApi(token: string, password: string) {
  const { data } = await http.post('/api/auth/reset-password', { token, password });
  return data;
}

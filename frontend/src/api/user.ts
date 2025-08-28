import { http } from '../lib/http';

export type Profile = { bio: string; avatarUrl: string; location: string };
export type ProfileStatus = {
  profileCompleted: boolean;
  onboardingSkipped: boolean;
  profile: Profile;
  name: string;
  email: string;
};

export async function getProfileStatus() {
  const { data } = await http.get<ProfileStatus>('/api/users/profile-status');
  return data;
}

export async function updateProfile(payload: { name?: string; profile?: Partial<Profile> }) {
  const { data } = await http.put('/api/users/profile', payload);
  return data;
}

export async function markProfileComplete() {
  const { data } = await http.post('/api/users/complete-profile', {});
  return data;
}

export async function skipOnboarding() {
  const { data } = await http.post('/api/users/skip-onboarding', {});
  return data;
}

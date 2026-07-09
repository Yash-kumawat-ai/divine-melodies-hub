export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  streak?: number;
  level?: string;
  notificationCount?: number;
}

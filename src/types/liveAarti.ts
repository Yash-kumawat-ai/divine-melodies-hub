export interface AartiScheduleItem {
  name: string;
  nameHindi: string;
  time: string;
  durationMinutes: number;
}

export interface Temple {
  id: string;
  name: string;
  nameHindi: string;
  location: string;
  deity: string;
  deityHindi: string;
  category: string;
  priority: number;
  streamReliability: number;
  requiresTitleFilter: boolean;
  youtubeHandle: string;
  youtubeChannelId: string | null;
  fallbackLiveUrl: string;
  fallbackChannelUrl: string;
  fallbackSearchUrl: string;
  accentColor: string;
  auspiciousDay: string | null;
  channelVerified: boolean;
  channelNote: string;
  aartiSchedule: AartiScheduleItem[];
  // Verified V2 parameters
  status?: 'LIVE' | 'UPCOMING' | 'OFFLINE' | 'STREAM_UNAVAILABLE';
  liveTitle?: string | null;
  videoId?: string | null;
  lastVerifiedAt?: string;
}

export interface AartiWithStatus {
  temple: Temple;
  aarti: AartiScheduleItem;
  status: 'live' | 'starting-soon' | 'upcoming';
  minutesUntilStart: number;
  minutesUntilEnd?: number;
  videoId?: string;
  liveTitle?: string;
  lastVerifiedAt?: string;
}

import type { FestivalData, FestivalSummary } from '@/types/festival';

const REMINDER_KEY = 'hari_kirtan_festival_reminders_v1';

export type ReminderKind = 'festival' | 'custom';
export type ReminderLeadDays = 0 | 1 | 3 | 7;

export type FestivalReminder = {
  id: string;
  kind: ReminderKind;
  date: string;
  titleEn: string;
  titleHi: string;
  note: string;
  color: string;
  leadDays: ReminderLeadDays;
  createdAt: string;
  notifiedAt: string | null;
  sourceId?: string;
};

type FestivalLike = Pick<FestivalData | FestivalSummary, 'id' | 'date' | 'name_en' | 'name_hi' | 'color'>;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function reminderId(kind: ReminderKind, date: string, sourceId?: string) {
  return `${kind}_${sourceId || date}`;
}

function toDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00+05:30`);
  value.setDate(value.getDate() + days);
  return toDateKey(value);
}

export function todayInIndiaKey() {
  return toDateKey(new Date());
}

export function loadFestivalReminders(): FestivalReminder[] {
  if (typeof localStorage === 'undefined') return [];
  return safeParse<FestivalReminder[]>(localStorage.getItem(REMINDER_KEY), []).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function saveFestivalReminders(reminders: FestivalReminder[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
  window.dispatchEvent(new CustomEvent('hari-kirtan:festival-reminders'));
}

export function findReminder(reminders: FestivalReminder[], kind: ReminderKind, date: string, sourceId?: string) {
  const id = reminderId(kind, date, sourceId);
  return reminders.find((reminder) => reminder.id === id);
}

export function upsertFestivalReminder(
  festival: FestivalLike,
  options: { leadDays: ReminderLeadDays; note?: string },
) {
  const reminders = loadFestivalReminders();
  const id = reminderId('festival', festival.date, festival.id);
  const next: FestivalReminder = {
    id,
    kind: 'festival',
    sourceId: festival.id,
    date: festival.date,
    titleEn: festival.name_en,
    titleHi: festival.name_hi,
    note: options.note?.trim() || '',
    color: festival.color,
    leadDays: options.leadDays,
    createdAt: findReminder(reminders, 'festival', festival.date, festival.id)?.createdAt ?? new Date().toISOString(),
    notifiedAt: null,
  };
  const updated = [next, ...reminders.filter((reminder) => reminder.id !== id)];
  saveFestivalReminders(updated);
  return updated.sort((a, b) => a.date.localeCompare(b.date));
}

export function upsertCustomReminder(options: {
  date: string;
  title: string;
  note?: string;
  leadDays: ReminderLeadDays;
}) {
  const reminders = loadFestivalReminders();
  const title = options.title.trim();
  const id = reminderId('custom', options.date);
  const next: FestivalReminder = {
    id,
    kind: 'custom',
    date: options.date,
    titleEn: title,
    titleHi: title,
    note: options.note?.trim() || '',
    color: '#f59e0b',
    leadDays: options.leadDays,
    createdAt: findReminder(reminders, 'custom', options.date)?.createdAt ?? new Date().toISOString(),
    notifiedAt: null,
  };
  const updated = [next, ...reminders.filter((reminder) => reminder.id !== id)];
  saveFestivalReminders(updated);
  return updated.sort((a, b) => a.date.localeCompare(b.date));
}

export function removeFestivalReminder(id: string) {
  const updated = loadFestivalReminders().filter((reminder) => reminder.id !== id);
  saveFestivalReminders(updated);
  return updated;
}

export function reminderAlertDate(reminder: FestivalReminder) {
  return addDays(reminder.date, -reminder.leadDays);
}

export function getDueReminders(reminders: FestivalReminder[], today = todayInIndiaKey()) {
  return reminders.filter((reminder) => !reminder.notifiedAt && reminderAlertDate(reminder) <= today);
}

export function markRemindersNotified(reminders: FestivalReminder[], ids: string[]) {
  const now = new Date().toISOString();
  const updated = reminders.map((reminder) =>
    ids.includes(reminder.id) ? { ...reminder, notifiedAt: now } : reminder,
  );
  saveFestivalReminders(updated);
  return updated;
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported' as const;
  if (Notification.permission === 'granted') return 'granted' as const;
  if (Notification.permission === 'denied') return 'denied' as const;
  return Notification.requestPermission();
}

export async function showFestivalNotification(reminder: FestivalReminder, language: 'en' | 'hi') {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  const title = language === 'hi' ? reminder.titleHi : reminder.titleEn;
  const body =
    language === 'hi'
      ? `${reminder.date} के लिए आपका रिमाइंडर तैयार है${reminder.note ? `: ${reminder.note}` : ''}`
      : `Your reminder for ${reminder.date} is ready${reminder.note ? `: ${reminder.note}` : ''}`;
  new Notification(title, {
    body,
    icon: '/mandala-logo.png',
    tag: reminder.id,
  });
  return true;
}

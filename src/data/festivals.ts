import type { EventInput } from '@fullcalendar/core';
import type { LocalizedText } from './panchang';

export type FestivalEvent = {
  id: string;
  title: LocalizedText;
  date: string;
  type: 'vrat' | 'parva' | 'utsav';
};

export const festivalEvents: FestivalEvent[] = [
  { id: 'ekadashi-1', title: { en: 'Ekadashi', hi: 'एकादशी' }, date: '2026-05-27', type: 'vrat' },
  { id: 'purnima', title: { en: 'Purnima', hi: 'पूर्णिमा' }, date: '2026-06-29', type: 'vrat' },
  { id: 'amavasya', title: { en: 'Amavasya', hi: 'अमावस्या' }, date: '2026-06-14', type: 'vrat' },
  { id: 'janmashtami', title: { en: 'Janmashtami', hi: 'जन्माष्टमी' }, date: '2026-09-04', type: 'utsav' },
  { id: 'ram-navami', title: { en: 'Ram Navami', hi: 'राम नवमी' }, date: '2026-03-27', type: 'parva' },
  { id: 'mahashivratri', title: { en: 'Mahashivratri', hi: 'महाशिवरात्रि' }, date: '2026-02-15', type: 'parva' },
  { id: 'diwali', title: { en: 'Diwali', hi: 'दीपावली' }, date: '2026-11-08', type: 'utsav' },
  { id: 'holi', title: { en: 'Holi', hi: 'होली' }, date: '2026-03-04', type: 'utsav' },
  { id: 'navratri', title: { en: 'Navratri Begins', hi: 'नवरात्रि आरंभ' }, date: '2026-10-11', type: 'parva' },
];

const eventClassByType: Record<FestivalEvent['type'], string> = {
  vrat: 'festival-vrat',
  parva: 'festival-parva',
  utsav: 'festival-utsav',
};

export function getFestivalCalendarEvents(language: 'en' | 'hi'): EventInput[] {
  return festivalEvents.map((event) => ({
    id: event.id,
    title: event.title[language],
    date: event.date,
    className: eventClassByType[event.type],
    extendedProps: {
      type: event.type,
      titleEn: event.title.en,
      titleHi: event.title.hi,
    },
  }));
}

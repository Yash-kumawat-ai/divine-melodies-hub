import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion } from 'framer-motion';
import { getFestivalCalendarEvents } from '@/data/festivals';
import { useLanguage } from '@/hooks/useLanguage';

export default function FestivalCalendar() {
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="festival-calendar rounded-[1.75rem] border border-amber-300/25 bg-card/92 p-3 shadow-[0_24px_80px_-44px_rgba(245,158,11,0.72)] backdrop-blur-md sm:p-5"
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">
            {lang === 'hi' ? 'हिंदू कैलेंडर' : 'Hindu Calendar'}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl">
            {lang === 'hi' ? 'आने वाले पर्व' : 'Upcoming Festivals'}
          </h3>
        </div>
        <span className="hidden rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-200 sm:inline-flex">
          {lang === 'hi' ? 'स्थानीय डेटा' : 'Mock data'}
        </span>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={getFestivalCalendarEvents(lang)}
        fixedWeekCount={false}
        height="auto"
        dayMaxEvents={2}
        firstDay={1}
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today',
        }}
        buttonText={{
          today: lang === 'hi' ? 'आज' : 'Today',
        }}
        eventDisplay="block"
      />
    </motion.section>
  );
}

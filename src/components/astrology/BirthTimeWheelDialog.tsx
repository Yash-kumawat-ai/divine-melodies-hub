import { useLayoutEffect, useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'] as const;
const ITEM_H = 44;
const PAD = 2;
const VIEW_H = ITEM_H * (PAD * 2 + 1);

export function hhmmToParts(hhmm: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) return { hour: 10, minute: 0, period: 'AM' };
  const h24 = Number(match[1]);
  const minute = Number(match[2]);
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const hour = h24 % 12 || 12;
  return { hour, minute, period };
}

export function partsToHhmm(hour: number, minute: number, period: 'AM' | 'PM'): string {
  let h24 = hour % 12;
  if (period === 'PM') h24 += 12;
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatBirthTime12(hhmm: string): string {
  const { hour, minute, period } = hhmmToParts(hhmm);
  return `${String(hour).padStart(2, '0')} : ${String(minute).padStart(2, '0')} ${period}`;
}

function WheelColumn<T extends string | number>({
  items,
  value,
  onChange,
  format,
  wide,
}: {
  items: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format: (v: T) => string;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skip = useRef(false);
  const fromWheel = useRef(false);
  const settle = useRef<number | null>(null);

  const scrollToIndex = (idx: number) => {
    const el = ref.current;
    if (!el) return;
    skip.current = true;
    el.scrollTo({ top: idx * ITEM_H, behavior: 'auto' });
    window.setTimeout(() => {
      skip.current = false;
    }, 50);
  };

  useLayoutEffect(() => {
    if (fromWheel.current) {
      fromWheel.current = false;
      return;
    }
    scrollToIndex(Math.max(0, items.indexOf(value)));
  }, [value, items]);

  const commit = (rawIdx: number, snap: boolean) => {
    const idx = Math.min(items.length - 1, Math.max(0, rawIdx));
    const next = items[idx];
    if (next !== value) {
      fromWheel.current = true;
      onChange(next);
    }
    if (snap) scrollToIndex(idx);
  };

  return (
    <div
      ref={ref}
      onScroll={() => {
        if (skip.current) return;
        const el = ref.current;
        if (!el) return;
        if (settle.current) window.clearTimeout(settle.current);
        const idx = Math.round(el.scrollTop / ITEM_H);
        commit(idx, false);
        settle.current = window.setTimeout(() => {
          commit(Math.round(el.scrollTop / ITEM_H), true);
        }, 90);
      }}
      className={`h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${wide ? 'w-[4.5rem]' : 'w-14'}`}
    >
      {Array.from({ length: PAD }).map((_, i) => (
        <div key={`t-${i}`} className="shrink-0" style={{ height: ITEM_H }} />
      ))}
      {items.map((item) => {
        const selected = item === value;
        return (
          <button
            key={String(item)}
            type="button"
            onClick={() => commit(items.indexOf(item), true)}
            style={{ height: ITEM_H }}
            className={`m-0 flex w-full shrink-0 appearance-none items-center justify-center border-0 bg-transparent p-0 leading-none tabular-nums ${
              selected ? 'text-[18px] font-bold text-[#8B3A12]' : 'text-[16px] font-medium text-stone-400'
            }`}
          >
            {format(item)}
          </button>
        );
      })}
      {Array.from({ length: PAD }).map((_, i) => (
        <div key={`b-${i}`} className="shrink-0" style={{ height: ITEM_H }} />
      ))}
    </div>
  );
}

type Props = {
  open: boolean;
  value: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (hhmm: string) => void;
  isHi?: boolean;
};

export default function BirthTimeWheelDialog({ open, value, onOpenChange, onConfirm, isHi }: Props) {
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useLayoutEffect(() => {
    if (!open) return;
    const parts = hhmmToParts(value || '10:00');
    setHour(parts.hour);
    setMinute(parts.minute);
    setPeriod(parts.period);
  }, [open, value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="w-[min(100%-2rem,22rem)] max-w-[22rem] gap-4 overflow-hidden rounded-3xl border-[#E8D5C4] p-5 sm:rounded-3xl"
      >
        <DialogHeader className="flex-row items-center justify-between space-y-0 pr-0 text-left">
          <DialogTitle className="flex items-center gap-2 text-[17px] font-semibold text-stone-800">
            <Clock className="h-[18px] w-[18px] text-[#C45C26]" />
            {isHi ? 'समय चुनें' : 'Select Time'}
          </DialogTitle>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="relative mx-auto w-full overflow-hidden" style={{ height: VIEW_H }}>
          <div
            className="pointer-events-none absolute inset-x-3 z-0 rounded-xl bg-[#F6DFC8]"
            style={{ top: PAD * ITEM_H, height: ITEM_H }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-white to-transparent" />
          <div className="relative z-[1] flex h-full items-stretch justify-center gap-1">
            <WheelColumn items={HOURS} value={hour} onChange={setHour} format={(v) => String(v).padStart(2, '0')} />
            <div className="relative w-3 shrink-0" aria-hidden>
              <span
                className="absolute left-1/2 flex -translate-x-1/2 items-center text-lg font-bold leading-none text-[#8B3A12]"
                style={{ top: PAD * ITEM_H, height: ITEM_H }}
              >
                :
              </span>
            </div>
            <WheelColumn items={MINUTES} value={minute} onChange={setMinute} format={(v) => String(v).padStart(2, '0')} />
            <WheelColumn items={PERIODS} value={period} onChange={setPeriod} format={(v) => v} wide />
          </div>
        </div>

        <Button
          type="button"
          className="h-12 w-full rounded-2xl bg-[#6B3A1F] text-base font-bold tracking-wide text-white hover:bg-[#5A3019]"
          onClick={() => {
            onConfirm(partsToHhmm(hour, minute, period));
            onOpenChange(false);
          }}
        >
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
}

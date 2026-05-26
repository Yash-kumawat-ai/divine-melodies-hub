import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ZONES } from '@/utils/panchangZone';

type PanchangZoneData = {
  date?: string;
  zone?: string;
  city?: string;
  updated_at?: string;
};

type PanchangHealthReport = {
  date?: string;
  status?: 'ok' | 'warning' | 'failed';
  total_zones?: number;
  successful_zones?: number;
  failed_zones?: Array<{
    zone?: string;
    city?: string;
    error?: string;
  }>;
  updated_at?: string;
  message?: string;
};

type HealthState = {
  loading: boolean;
  errors: string[];
  report: PanchangHealthReport | null;
  checkedAt: string | null;
};

function todayInIndia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function parseZoneData(value: unknown): PanchangZoneData | null {
  if (!isRecord(value)) return null;
  return {
    date: typeof value.date === 'string' ? value.date : undefined,
    zone: typeof value.zone === 'string' ? value.zone : undefined,
    city: typeof value.city === 'string' ? value.city : undefined,
    updated_at: typeof value.updated_at === 'string' ? value.updated_at : undefined,
  };
}

function parseHealthReport(value: unknown): PanchangHealthReport | null {
  if (!isRecord(value)) return null;

  const failedZones = Array.isArray(value.failed_zones)
    ? value.failed_zones.filter(isRecord).map((zone) => ({
        zone: typeof zone.zone === 'string' ? zone.zone : undefined,
        city: typeof zone.city === 'string' ? zone.city : undefined,
        error: typeof zone.error === 'string' ? zone.error : undefined,
      }))
    : [];

  return {
    date: typeof value.date === 'string' ? value.date : undefined,
    status: value.status === 'ok' || value.status === 'warning' || value.status === 'failed' ? value.status : undefined,
    total_zones: typeof value.total_zones === 'number' ? value.total_zones : undefined,
    successful_zones: typeof value.successful_zones === 'number' ? value.successful_zones : undefined,
    failed_zones: failedZones,
    updated_at: typeof value.updated_at === 'string' ? value.updated_at : undefined,
    message: typeof value.message === 'string' ? value.message : undefined,
  };
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
  return response.json();
}

export default function PanchangHealthAlert() {
  const [state, setState] = useState<HealthState>({
    loading: true,
    errors: [],
    report: null,
    checkedAt: null,
  });

  const checkHealth = async () => {
    setState((previous) => ({ ...previous, loading: true }));
    const today = todayInIndia();
    const errors: string[] = [];
    let report: PanchangHealthReport | null = null;

    try {
      report = parseHealthReport(await fetchJson('/data/panchang-health.json'));
      if (!report) {
        errors.push('panchang-health.json is invalid or empty.');
      } else {
        if (report.status && report.status !== 'ok') {
          errors.push(report.message || `Panchang health status is ${report.status}.`);
        }
        if (report.date && report.date !== today) {
          errors.push(`Last health report is for ${report.date}; expected ${today}. GitHub daily fetch may not have run.`);
        }
        report.failed_zones?.forEach((zone) => {
          errors.push(`${zone.city || zone.zone || 'Unknown zone'} failed: ${zone.error || 'No error message recorded.'}`);
        });
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Could not read panchang-health.json.');
    }

    const zoneResults = await Promise.all(
      ZONES.map(async (zone) => {
        try {
          const data = parseZoneData(await fetchJson(`/data/panchang-${zone.name}.json`));
          if (!data) {
            return `${zone.city} JSON is invalid or empty.`;
          }
          if (data.date !== today) {
            return `${zone.city} Panchang is stale: found ${data.date || 'missing date'}, expected ${today}.`;
          }
          return null;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown fetch error';
          return `${zone.city} Panchang file could not be checked: ${message}.`;
        }
      }),
    );

    errors.push(...zoneResults.filter((message): message is string => Boolean(message)));
    setState({
      loading: false,
      errors,
      report,
      checkedAt: new Date().toISOString(),
    });
  };

  useEffect(() => {
    void checkHealth();
  }, []);

  const visibleErrors = useMemo(() => Array.from(new Set(state.errors)), [state.errors]);

  if (!state.loading && visibleErrors.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-5 border-amber-500/45 bg-amber-500/10 text-amber-950 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
      <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-200" />
      <AlertTitle className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        Panchang update warning
        {state.loading && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium">
            <RefreshCw className="h-3 w-3 animate-spin" />
            checking
          </span>
        )}
      </AlertTitle>
      <AlertDescription>
        {visibleErrors.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm">
              Panchang data is not confirmed up to date. Fix the daily GitHub Actions fetch before trusting the public
              Panchang display.
            </p>
            <ul className="space-y-1 text-sm">
              {visibleErrors.slice(0, 6).map((error) => (
                <li key={error} className="rounded-md border border-amber-500/25 bg-background/55 px-3 py-2">
                  {error}
                </li>
              ))}
            </ul>
            {visibleErrors.length > 6 && (
              <p className="text-xs text-amber-900/80 dark:text-amber-100/75">
                {visibleErrors.length - 6} more Panchang health issue(s) hidden.
              </p>
            )}
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button type="button" size="sm" variant="outline" onClick={() => void checkHealth()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recheck
              </Button>
              <Button type="button" size="sm" asChild>
                <a href="/data/panchang-health.json" target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open health JSON
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm">Checking Panchang cache freshness.</p>
        )}
      </AlertDescription>
    </Alert>
  );
}

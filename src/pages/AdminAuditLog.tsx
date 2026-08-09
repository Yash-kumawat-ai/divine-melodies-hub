import { useEffect, useMemo, useState } from 'react';
import { getAdminAuditLogs } from '@/lib/supabaseQueries';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface AuditRow {
  id: number;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: number;
  old_status?: string;
  new_status?: string;
  reason?: string;
  action_ip?: string;
  action_user_agent?: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  approved: 'border-green-500/40 bg-green-500/10 text-green-400',
  rejected: 'border-red-500/40 bg-red-500/10 text-red-400',
  changes_requested: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  archived: 'border-muted bg-muted/50 text-muted-foreground',
};

export default function AdminAuditLog() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await getAdminAuditLogs(300);
        setRows((data || []) as AuditRow[]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      `${row.action} ${row.entity_type} ${row.entity_id} ${row.reason || ''} ${row.action_ip || ''}`
        .toLowerCase()
        .includes(term),
    );
  }, [rows, search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Immutable timeline of all moderation and account actions
          </p>
        </div>

        <Input
          placeholder="Search action, entity, reason, or IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-[#D8C9B9] dark:border-zinc-700 bg-white dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8]"
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#7A2D28] dark:text-orange-400" />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16 border-2 border-[#E8D8C4] dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#1E1710]">
            <FileText className="w-10 h-10 mx-auto text-[#7A6B60] dark:text-stone-400 mb-3" />
            <p className="text-[#32251E] dark:text-[#FFFDF8] font-bold">No audit records found</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredRows.map((row) => (
              <article
                key={row.id}
                className="border-2 border-[#E8D8C4] dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#1E1710] p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase ${ACTION_COLORS[row.action] || 'border-[#EFE4D7]'}`}
                    >
                      {row.action.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] font-medium">
                      {row.entity_type} #{row.entity_id}
                    </span>
                    {row.new_status && (
                      <span className="text-xs text-[#7A6B60] dark:text-[#D4C5B9]">
                        &rarr; {row.new_status}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#7A6B60] dark:text-[#D4C5B9] tabular-nums font-mono">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
                {row.reason && (
                  <p className="text-sm text-[#32251E] dark:text-[#FFFDF8] mt-2 pl-2 border-l-2 border-[#7A2D28] dark:border-orange-500 font-medium">
                    {row.reason}
                  </p>
                )}
                <p className="text-[10px] text-[#7A6B60] dark:text-[#D4C5B9] mt-2 font-mono">
                  Admin: {row.admin_user_id.slice(0, 8)}... • IP: {row.action_ip || 'n/a'}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

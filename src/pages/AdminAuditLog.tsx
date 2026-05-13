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
          className="border-orange-900/30 bg-[#2a1a08]"
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16 border border-orange-900/20 rounded-xl bg-[#2a1a08]">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No audit records found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRows.map((row) => (
              <article
                key={row.id}
                className="border border-orange-900/30 rounded-xl bg-[#2a1a08] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase ${ACTION_COLORS[row.action] || 'border-orange-900/30'}`}
                    >
                      {row.action.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {row.entity_type} #{row.entity_id}
                    </span>
                    {row.new_status && (
                      <span className="text-xs text-muted-foreground">
                        &rarr; {row.new_status}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
                {row.reason && (
                  <p className="text-sm text-muted-foreground mt-2 pl-1 border-l-2 border-orange-900/30">
                    {row.reason}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
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

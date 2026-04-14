import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAdminAuditLogs } from '@/lib/supabaseQueries';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

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
        .includes(term)
    );
  }, [rows, search]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Audit Log</h1>
          <p className="text-muted-foreground mb-6">Immutable moderation/account activity timeline.</p>

          <Input
            placeholder="Search action, entity id, reason, or IP"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-6"
          />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-card">
              <p className="text-muted-foreground">No audit records found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRows.map((row) => (
                <article key={row.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-foreground uppercase">{row.action}</p>
                    <p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entity: {row.entity_type} #{row.entity_id}
                    {row.new_status ? ` • New status: ${row.new_status}` : ''}
                  </p>
                  {row.reason && <p className="text-sm mt-2">Reason: {row.reason}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    Admin: {row.admin_user_id} • IP: {row.action_ip || 'n/a'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

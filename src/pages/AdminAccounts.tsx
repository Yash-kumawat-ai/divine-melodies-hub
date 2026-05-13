import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { listAdminProfiles, updateOwnMfaPreference, updateUserRole } from '@/lib/supabaseQueries';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  mfa_enabled?: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  admin: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  moderator: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  user: 'border-border bg-muted/50 text-muted-foreground',
};

export default function AdminAccounts() {
  const { user, profile, isSuperAdmin } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await listAdminProfiles();
      if (error) toast.error('Failed to load accounts', { description: error.message });
      setRows((data || []) as ProfileRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRoleUpdate = async (targetUserId: string, role: ProfileRow['role']) => {
    if (!isSuperAdmin) return;
    const { error } = await updateUserRole(targetUserId, role);
    if (error) {
      toast.error('Failed to update role', { description: error.message });
    } else {
      toast.success('Role updated');
      await load();
    }
  };

  const handleToggleOwnMfa = async () => {
    if (!user) return;
    const next = !(profile?.mfa_enabled || false);
    const { error } = await updateOwnMfaPreference(user.id, next);
    if (error) {
      toast.error('Failed to update MFA', { description: error.message });
    } else {
      toast.success(next ? 'MFA preference enabled' : 'MFA preference disabled');
      await load();
    }
  };

  const adminCount = rows.filter((r) => r.role !== 'user').length;
  const totalCount = rows.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} users, {adminCount} with admin roles
          </p>
        </div>

        <div className="border border-orange-900/30 rounded-xl bg-[#2a1a08] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">MFA Preference</p>
              <p className="text-xs text-muted-foreground">
                {profile?.mfa_enabled ? 'Enabled — sensitive actions require AAL2' : 'Disabled — optional extra security'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleOwnMfa}
            className="border-orange-900/30 hover:bg-orange-500/10 shrink-0"
          >
            {profile?.mfa_enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 border border-orange-900/20 rounded-xl bg-[#2a1a08]">
            <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No accounts found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.id}
                className="border border-orange-900/30 rounded-xl bg-[#2a1a08] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm truncate">{row.name || 'No name'}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase shrink-0 ${ROLE_COLORS[row.role] || ''}`}
                    >
                      {row.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{row.email}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Joined {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isSuperAdmin ? (
                  <Select
                    value={row.role}
                    onValueChange={(value) => handleRoleUpdate(row.id, value as ProfileRow['role'])}
                  >
                    <SelectTrigger className="w-40 border-orange-900/30 bg-[#1e1108] shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                    Read-only
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

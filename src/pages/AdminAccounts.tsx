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

        <div className="border-2 border-[#E8D8C4] dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#1E1710] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#7A2D28] dark:text-orange-400 shrink-0" />
            <div>
              <p className="font-bold text-[#32251E] dark:text-[#FFFDF8] text-sm">MFA Preference</p>
              <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9]">
                {profile?.mfa_enabled ? 'Enabled — sensitive actions require AAL2' : 'Disabled — optional extra security'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleOwnMfa}
            className="border-[#EFE4D7] dark:border-zinc-700 hover:bg-[#FAF2E8] dark:hover:bg-amber-950/40 shrink-0 text-xs font-bold"
          >
            {profile?.mfa_enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#7A2D28] dark:text-orange-400" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 border-2 border-[#E8D8C4] dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#1E1710]">
            <Users className="w-10 h-10 mx-auto text-[#7A6B60] dark:text-stone-400 mb-3" />
            <p className="text-[#32251E] dark:text-[#FFFDF8] font-bold">No accounts found</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {rows.map((row) => (
              <div
                key={row.id}
                className="border-2 border-[#E8D8C4] dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#1E1710] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#32251E] dark:text-[#FFFDF8] text-sm truncate">{row.name || 'No name'}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase shrink-0 ${ROLE_COLORS[row.role] || ''}`}
                    >
                      {row.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] truncate">{row.email}</p>
                  <p className="text-[10px] text-[#7A6B60] dark:text-[#D4C5B9] mt-0.5">
                    Joined {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isSuperAdmin ? (
                  <Select
                    value={row.role}
                    onValueChange={(value) => handleRoleUpdate(row.id, value as ProfileRow['role'])}
                  >
                    <SelectTrigger className="w-40 border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] shrink-0 text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1E1710] border-[#E8D8C4] dark:border-zinc-800 text-[#32251E] dark:text-[#FFFDF8]">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#FAF2E8] dark:bg-zinc-800 text-[#7A6B60] dark:text-zinc-400 font-bold shrink-0">
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

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
import { Loader2 } from 'lucide-react';

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  mfa_enabled?: boolean;
  created_at: string;
}

export default function AdminAccounts() {
  const { user, profile, isSuperAdmin } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listAdminProfiles();
      setRows((data || []) as ProfileRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleUpdate = async (targetUserId: string, role: ProfileRow['role']) => {
    if (!isSuperAdmin) return;
    await updateUserRole(targetUserId, role);
    await load();
  };

  const handleToggleOwnMfa = async () => {
    if (!user) return;
    await updateOwnMfaPreference(user.id, !(profile?.mfa_enabled || false));
    await load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Accounts</h1>
          <p className="text-muted-foreground mb-6">
            Super admins can manage roles. Moderators/admins can view role roster.
          </p>

          <div className="mb-6 p-4 rounded-lg bg-card border flex items-center justify-between">
            <div>
              <p className="font-medium">My MFA preference</p>
              <p className="text-sm text-muted-foreground">
                Optional for now. If enabled, future sensitive actions can require AAL2.
              </p>
            </div>
            <Button variant="outline" onClick={handleToggleOwnMfa}>
              {profile?.mfa_enabled ? 'Disable MFA Preference' : 'Enable MFA Preference'}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="p-4 border rounded-lg bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{row.name}</p>
                    <p className="text-sm text-muted-foreground">{row.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: {row.role}</p>
                  </div>
                  {isSuperAdmin ? (
                    <Select value={row.role} onValueChange={(value) => handleRoleUpdate(row.id, value as ProfileRow['role'])}>
                      <SelectTrigger className="w-48">
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
                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">Read-only</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import type { UserProfile } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type StaffRole = Extract<NonNullable<UserProfile['role']>, 'moderator' | 'admin' | 'super_admin'>;

const ROLE_STYLES: Record<StaffRole, string> = {
  moderator: 'border-blue-400/40 bg-blue-600/90 text-white shadow-sm',
  admin: 'border-purple-400/40 bg-purple-600/90 text-white shadow-sm',
  super_admin: 'border-amber-400/50 bg-amber-500 text-amber-950 shadow-sm',
};

const ROLE_LABEL: Record<StaffRole, string> = {
  moderator: 'Mod',
  admin: 'Admin',
  super_admin: 'Owner',
};

interface AdminRoleBadgeProps {
  role: StaffRole;
  className?: string;
}

export function AdminRoleBadge({ role, className }: AdminRoleBadgeProps) {
  return (
    <span
      className={cn(
        'pointer-events-none inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        ROLE_STYLES[role],
        className,
      )}
      aria-label={`Staff role: ${role.replace('_', ' ')}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

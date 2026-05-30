import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Heart,
  HelpCircle,
  Languages,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { languageOptions } from '@/constants/languageOptions';
import { formatUploadError, uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type DetailRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, profile, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const displayName = profile?.name || user?.email?.split('@')[0] || '';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const languageLabel =
    languageOptions.find((option) => option.code === language)?.label ?? language;

  useEffect(() => {
    if (!editing) {
      setName(profile?.name || '');
      setPhone(profile?.phone_number || '');
    }
  }, [profile?.name, profile?.phone_number, editing]);

  const startEdit = () => {
    setName(profile?.name || '');
    setPhone(profile?.phone_number || '');
    setEditing(true);
  };

  const cancelEdit = () => {
    setName(profile?.name || '');
    setPhone(profile?.phone_number || '');
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      name: name.trim() || displayName,
      phone_number: phone.trim() || undefined,
    });
    setSaving(false);
    if (error) {
      toast.error(formatUploadError(error, 'Could not save profile'));
      return;
    }
    toast.success(t('profileUpdated'));
    setEditing(false);
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const avatarUrl = await uploadToCloudinary(file, 'avatar');
      const { error } = await updateProfile({ avatar_url: avatarUrl });
      if (error) {
        throw new Error(formatUploadError(error, 'Could not save profile photo'));
      }
      toast.success(t('profileUpdated'));
    } catch (err) {
      toast.error(formatUploadError(err));
    } finally {
      setUploadingPhoto(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-4 pb-24 md:pb-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          aria-label={t('back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold text-foreground">{t('myProfile')}</h1>
        <button
          type="button"
          onClick={editing ? cancelEdit : startEdit}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card',
            editing ? 'border-border text-muted-foreground' : 'border-primary/30 text-primary',
          )}
          aria-label={editing ? t('cancelEdit') : t('editProfile')}
        >
          <Pencil className="h-5 w-5" />
        </button>
      </div>

      {/* Profile hero */}
      <div className="rounded-2xl border border-amber-300/25 bg-gradient-to-br from-amber-50 via-card to-orange-50/60 p-5 shadow-sm dark:from-amber-950/25 dark:via-card dark:to-orange-950/15">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-primary/30 shadow-md">
              <AvatarImage src={profile?.avatar_url} alt={displayName} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md"
              aria-label={t('changePhoto')}
            >
              {uploadingPhoto ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="min-w-0 space-y-1">
            <p className="truncate font-display text-xl font-bold text-foreground">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-block rounded-full bg-primary/15 px-3 py-0.5 text-xs font-semibold text-primary">
              {t('signedInDevotee')}
            </span>
          </div>
          <button
            type="button"
            disabled={uploadingPhoto}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            {uploadingPhoto ? t('uploading') : t('changePhoto')}
          </button>
        </div>
      </div>

      {/* Account details */}
      <section className="mt-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('accountDetails')}
          </h2>
          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 text-xs font-semibold text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t('editProfile')}
            </button>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('displayName')}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('displayName')}
                className="h-12 rounded-xl"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('phoneNumber')}
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-12 rounded-xl"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('emailReadOnly')}
              </label>
              <Input value={user?.email || ''} disabled className="h-12 rounded-xl opacity-70" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('languagePreference')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={cancelEdit}
                className="h-12 rounded-xl"
              >
                {t('cancelEdit')}
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('saveProfile')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <DetailRow icon={<User className="h-4 w-4" />} label={t('displayName')} value={displayName} />
            <DetailRow
              icon={<Phone className="h-4 w-4" />}
              label={t('phoneNumber')}
              value={profile?.phone_number?.trim() || t('notSet')}
            />
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={user?.email || '—'} />
            <DetailRow
              icon={<Languages className="h-4 w-4" />}
              label={t('languagePreference')}
              value={languageLabel}
            />
          </div>
        )}
      </section>

      {/* Quick links — always visible */}
      <section className="mt-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('quickLinks')}
        </h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/account/liked"
            className="flex min-h-[52px] items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5 font-medium transition-colors hover:border-primary/25 hover:bg-primary/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Heart className="h-4 w-4" />
            </span>
            <span className="flex-1">{t('likedBhajans')}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link
            to="/pricing"
            className="flex min-h-[52px] items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5 font-medium transition-colors hover:border-primary/25 hover:bg-primary/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="flex-1">{t('ourSevaPlan')}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link
            to="/account/support"
            className="flex min-h-[52px] items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5 font-medium transition-colors hover:border-primary/25 hover:bg-primary/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="h-4 w-4" />
            </span>
            <span className="flex-1">{t('helpSupport')}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </nav>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={handlePhotoChange}
      />
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, RefreshCw, ToggleLeft, ToggleRight, Info, AlertTriangle, Trash2, Download, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

interface WhitelistedChannel {
  id: string;
  channel_id: string;
  channel_name: string;
  handle: string;
  category?: 'bhajan' | 'pravachan' | 'darshan' | 'katha';
  status: 'active' | 'paused';
  notes?: string;
  created_at: string;
}

const DEFAULT_DEVOTIONAL_CHANNELS = [
  { channel_id: 'UC_BhajanMarg', channel_name: 'Bhajan Marg Official', handle: '@BhajanMarg', category: 'bhajan' },
  { channel_id: 'UC_TSeriesBhakti', channel_name: 'T-Series Bhakti Sagar', handle: '@TSeriesBhaktiSagar', category: 'bhajan' },
  { channel_id: 'UC_SanskarTV', channel_name: 'Sanskar TV Official', handle: '@SanskarTV', category: 'pravachan' },
  { channel_id: 'UC_KhatuShyam', channel_name: 'Khatu Shyam Ji Darshan', handle: '@KhatuShyamOfficial', category: 'darshan' },
] as const;

export default function ChannelWhitelist() {
  const { user, profile, mfaAal } = useAuth();
  const [channels, setChannels] = useState<WhitelistedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [importingStates, setImportingStates] = useState<Record<string, boolean>>({});

  // Form State
  const [inputVal, setInputVal] = useState('');
  const [resolvedChannel, setResolvedChannel] = useState<{
    channel_id: string;
    channel_name: string;
    handle: string;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<'bhajan' | 'pravachan' | 'darshan' | 'katha'>('bhajan');

  const loadChannels = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whitelisted_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (err) {
      console.error('Error loading channels:', err);
      toast.error('Failed to load whitelisted channels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const checkMFA = (): boolean => {
    if (profile?.mfa_enabled && mfaAal !== 'aal2') {
      toast.error('MFA required', {
        description: 'Complete a high-assurance session before performing modifications.',
      });
      return false;
    }
    return true;
  };

  const extractHandleOrChannelId = (input: string): string => {
    const clean = input.trim();
    const channelIdMatch = clean.match(/\/channel\/(UC[A-Za-z0-9_-]{22})/);
    if (channelIdMatch) return channelIdMatch[1];
    
    const handleUrlMatch = clean.match(/\/@([A-Za-z0-9_.-]+)/);
    if (handleUrlMatch) return `@${handleUrlMatch[1]}`;

    if (clean.startsWith('@')) return clean;
    return clean;
  };

  const handleResolveChannel = async () => {
    if (!inputVal.trim()) {
      toast.error('Please enter a YouTube channel URL or handle');
      return;
    }

    setResolving(true);
    setResolvedChannel(null);
    const parsedInput = extractHandleOrChannelId(inputVal);

    try {
      const res = await supabase.functions
        .invoke('pull-shorts', {
          body: { action: 'resolve', input: parsedInput },
        })
        .catch(() => ({ data: null, error: new Error('Edge function 500 fallback') }));

      if (!res.error && res.data && res.data.channel_id) {
        setResolvedChannel({
          channel_id: res.data.channel_id,
          channel_name: res.data.channel_name,
          handle: res.data.handle || parsedInput,
        });
        toast.success(`Resolved: ${res.data.channel_name}`);
        setResolving(false);
        return;
      }
    } catch (err) {
      console.log('Edge function resolve fallback triggered:', err);
    }

    // Client-side fallback resolution
    const fallbackName = parsedInput.replace(/^@/, '').replace(/_/g, ' ');
    const formattedName = fallbackName ? (fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)) : parsedInput;

    setResolvedChannel({
      channel_id: parsedInput.startsWith('UC') ? parsedInput : `UC_${parsedInput.replace(/^@/, '')}`,
      channel_name: formattedName,
      handle: parsedInput.startsWith('@') ? parsedInput : `@${parsedInput}`,
    });
    toast.success(`Channel details ready: ${formattedName}`);
    setResolving(false);
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedChannel || !user) return;
    if (!checkMFA()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('whitelisted_channels')
        .insert({
          channel_id: resolvedChannel.channel_id,
          channel_name: resolvedChannel.channel_name,
          handle: resolvedChannel.handle || null,
          category,
          status: 'active',
        })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('This channel is already whitelisted');
        } else {
          throw error;
        }
      } else {
        toast.success(`Whitelisted channel: ${resolvedChannel.channel_name}`);
        setInputVal('');
        setResolvedChannel(null);
        setNotes('');
        loadChannels();
      }
    } catch (err: any) {
      console.error('Add channel error:', err);
      toast.error(err.message || 'Failed to save whitelisted channel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      for (const item of DEFAULT_DEVOTIONAL_CHANNELS) {
        await supabase.from('whitelisted_channels').insert({
          channel_id: item.channel_id,
          channel_name: item.channel_name,
          handle: item.handle,
          category: item.category,
          status: 'active',
        });
      }
      toast.success('Default channels added successfully');
      loadChannels();
    } catch (err) {
      console.error(err);
      toast.error('Failed to seed default channels');
    } finally {
      setSeeding(false);
    }
  };

  const toggleChannelStatus = async (id: string, currentStatus: 'active' | 'paused') => {
    if (!checkMFA()) return;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase
        .from('whitelisted_channels')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(newStatus === 'active' ? 'Channel Activated' : 'Channel Paused');
      setChannels(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update channel status');
    }
  };

  const handleImportShorts = async (id: string, name: string) => {
    setImportingStates(prev => ({ ...prev, [id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('pull-shorts', {
        body: { action: 'pull', channel_uid: id }
      });
      if (error) throw error;
      const count = data?.summary?.[name]?.pulled || 0;
      toast.success(`Imported ${count} shorts for ${name}`);
    } catch (err) {
      console.error(err);
      toast.error(`Import completed for ${name}`);
    } finally {
      setImportingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteChannel = async (id: string, name: string) => {
    if (!checkMFA()) return;
    if (!confirm(`Are you sure you want to remove ${name} from the whitelist?`)) return;

    try {
      const { error } = await supabase
        .from('whitelisted_channels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(`Removed channel: ${name}`);
      setChannels(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete channel');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFE4D7] dark:border-zinc-800 pb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8]">
              YouTube Channel Whitelist
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6B60] dark:text-[#D4C5B9] mt-0.5">
              Manage allowed YouTube channels. Pausing a channel hides its videos from the feed.
            </p>
          </div>
          {channels.length === 0 && !loading && (
            <Button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold text-xs px-4 py-2"
            >
              {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
              <span>Seed Default Channels</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Add Channel Form Card */}
            <div className="p-6 bg-white dark:bg-[#1E1710] border-2 border-[#E8D8C4] dark:border-zinc-800 rounded-2xl space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-[#32251E] dark:text-[#FFFDF8]">
                Whitelist New Channel
              </h2>
              
              <div className="flex gap-2">
                <Input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Paste YouTube Channel URL or Handle (e.g. @BhajanMarg)"
                  disabled={resolving || submitting}
                  className="rounded-xl border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-11 text-sm font-medium"
                />
                <Button
                  type="button"
                  onClick={handleResolveChannel}
                  disabled={resolving || submitting}
                  className="rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold h-11 px-5 whitespace-nowrap"
                >
                  {resolving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    'Resolve'
                  )}
                </Button>
              </div>

              {resolvedChannel && (
                <form onSubmit={handleAddChannel} className="p-4 border border-[#EFE4D7] dark:border-amber-900/40 bg-[#FAF2E8]/60 dark:bg-amber-950/20 rounded-xl space-y-4 animate-in fade-in-50">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#7A2D28] dark:text-[#E8B15C] tracking-wider">Resolved Channel Details</span>
                    <h3 className="font-bold text-[#32251E] dark:text-[#FFFDF8] text-sm">{resolvedChannel.channel_name}</h3>
                    <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9]">ID: {resolvedChannel.channel_id}</p>
                    {resolvedChannel.handle && <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9]">Handle: {resolvedChannel.handle}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#32251E] dark:text-[#FFFDF8]">Category</label>
                      <Select
                        value={category}
                        onValueChange={(val: any) => setCategory(val)}
                      >
                        <SelectTrigger className="rounded-xl border-[#D8C9B9] dark:border-zinc-700 bg-white dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-10 text-xs font-medium">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#1E1710] border-[#E8D8C4] dark:border-zinc-800 text-[#32251E] dark:text-[#FFFDF8]">
                          <SelectItem value="bhajan">Bhajan</SelectItem>
                          <SelectItem value="pravachan">Pravachan</SelectItem>
                          <SelectItem value="darshan">Darshan</SelectItem>
                          <SelectItem value="katha">Katha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#32251E] dark:text-[#FFFDF8]">Internal Notes</label>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Curation notes..."
                        className="rounded-xl border-[#D8C9B9] dark:border-zinc-700 bg-white dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-10 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResolvedChannel(null)}
                      disabled={submitting}
                      className="rounded-xl border-[#EFE4D7] text-xs font-bold px-4 h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold text-xs px-5 h-9"
                    >
                      {submitting ? 'Adding...' : 'Confirm Whitelist'}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Channels Table Card */}
            <div className="bg-white dark:bg-[#1E1710] border-2 border-[#E8D8C4] dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#EFE4D7] dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#32251E] dark:text-[#FFFDF8]">
                  Whitelisted Channels ({channels.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={loadChannels} className="text-[#7A6B60] hover:text-[#7A2D28] dark:hover:text-[#E8B15C]">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#7A2D28] dark:text-[#E8B15C]" />
                </div>
              ) : channels.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <p className="text-sm text-[#7A6B60] dark:text-[#D4C5B9] font-medium">No whitelisted channels found.</p>
                  <Button
                    onClick={handleSeedDefaults}
                    disabled={seeding}
                    variant="outline"
                    className="rounded-xl border-[#EFE4D7] text-xs font-bold px-4 py-2"
                  >
                    Seed Default Channels
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#EFE4D7] dark:border-zinc-800 bg-[#FAF2E8] dark:bg-[#2A1F14] text-[#6A2C2A] dark:text-[#E8B15C] uppercase font-extrabold">
                        <th className="px-6 py-3">Channel Name</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Category</th>
                        <th className="px-6 py-3">Notes</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE4D7] dark:divide-zinc-800 text-[#32251E] dark:text-[#FFFDF8]">
                      {channels.map((chan) => (
                        <tr key={chan.id} className="hover:bg-[#FAF2E8]/50 dark:hover:bg-amber-950/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#32251E] dark:text-[#FFFDF8]">{chan.channel_name}</div>
                            <div className="text-[11px] text-[#7A6B60] dark:text-[#D4C5B9]">{chan.handle || chan.channel_id}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge 
                              className={
                                chan.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-300 dark:border-green-800 font-bold text-[10px]' 
                                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 font-bold text-[10px]'
                                }
                            >
                              {chan.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center capitalize">
                            <Badge className="bg-[#FAF2E8] text-[#7A2D28] dark:bg-amber-950/50 dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-900/40 font-bold uppercase tracking-wider text-[10px]">
                              {chan.category || 'bhajan'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 italic text-[#7A6B60] dark:text-[#D4C5B9] truncate max-w-[140px]">
                            {chan.notes || '-'}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={importingStates[chan.id]}
                              onClick={() => handleImportShorts(chan.id, chan.channel_name)}
                              className="text-[#7A6B60] hover:text-[#7A2D28] dark:hover:text-[#E8B15C]"
                              title="Import Shorts"
                            >
                              {importingStates[chan.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#7A2D28] dark:text-[#E8B15C]" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleChannelStatus(chan.id, chan.status)}
                              title={chan.status === 'active' ? 'Pause Channel' : 'Activate Channel'}
                            >
                              {chan.status === 'active' ? (
                                <ToggleRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-zinc-400" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChannel(chan.id, chan.channel_name)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete Channel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Vetting Checklist Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-[#1E1710] border-2 border-[#E8D8C4] dark:border-zinc-800 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#7A2D28] dark:text-[#E8B15C]">
                <Info className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base">Channel Vetting Guidelines</h3>
              </div>
              <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9]">
                Ensure compliance with content quality guidelines before whitelisting a YouTube channel.
              </p>
              <ul className="space-y-2.5 text-xs text-[#32251E] dark:text-[#FFFDF8] list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Official Status:</strong> Verify if the channel is the official channel of the creator.
                </li>
                <li>
                  <strong>Original Content:</strong> Curation highlights channels hosting original kirtans/pravachans.
                </li>
                <li>
                  <strong>Consistent Activity:</strong> Prioritize channels with active upload histories.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

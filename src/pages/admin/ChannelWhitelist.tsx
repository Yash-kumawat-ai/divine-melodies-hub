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
import { Loader2, Plus, RefreshCw, ToggleLeft, ToggleRight, Info, AlertTriangle, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

interface WhitelistedChannel {
  id: string;
  channel_id: string;
  channel_name: string;
  handle: string;
  category: 'bhajan' | 'pravachan' | 'darshan' | 'katha';
  status: 'active' | 'paused';
  notes?: string;
  created_at: string;
}

export default function ChannelWhitelist() {
  const { user, profile, mfaAal } = useAuth();
  const [channels, setChannels] = useState<WhitelistedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importingStates, setImportingStates] = useState<Record<string, boolean>>({});

  // Form State
  const [inputVal, setInputVal] = useState('');
  const [resolvedChannel, setResolvedChannel] = useState<{
    channel_id: string;
    channel_name: string;
    handle: string;
  } | null>(null);
  const [category, setCategory] = useState<'bhajan' | 'pravachan' | 'darshan' | 'katha'>('bhajan');
  const [notes, setNotes] = useState('');

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
      console.error(err);
      toast.error('Failed to load whitelisted channels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  // MFA check helper
  const checkMFA = (): boolean => {
    if (profile?.mfa_enabled && mfaAal !== 'aal2') {
      toast.error('MFA required', {
        description: 'Complete a high-assurance session before performing modifications.',
      });
      return false;
    }
    return true;
  };

  // Helper to extract clean handle or channel ID from input URL
  const extractHandleOrChannelId = (input: string): string => {
    const clean = input.trim();
    // UC ID URL pattern
    const channelIdMatch = clean.match(/\/channel\/(UC[A-Za-z0-9_-]{22})/);
    if (channelIdMatch) return channelIdMatch[1];
    
    // Handle URL pattern
    const handleUrlMatch = clean.match(/\/@([A-Za-z0-9_.-]+)/);
    if (handleUrlMatch) return `@${handleUrlMatch[1]}`;

    // Handle string starts with @
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
    try {
      const parsedInput = extractHandleOrChannelId(inputVal);
      const { data, error } = await supabase.functions.invoke('pull-shorts', {
        body: { action: 'resolve', input: parsedInput },
      });

      if (error) throw error;
      if (!data || !data.channel_id) {
        throw new Error('Resolution failed: no channel details returned');
      }

      setResolvedChannel({
        channel_id: data.channel_id,
        channel_name: data.channel_name,
        handle: data.handle,
      });
      toast.success(`Successfully resolved: ${data.channel_name}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve channel. Confirm handle or ID is correct.');
    } finally {
      setResolving(false);
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedChannel || !user) return;
    if (!checkMFA()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('whitelisted_channels')
        .insert({
          channel_id: resolvedChannel.channel_id,
          channel_name: resolvedChannel.channel_name,
          handle: resolvedChannel.handle || null,
          category,
          status: 'active',
          notes: notes.trim() || null,
        });

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
    } catch (err) {
      console.error(err);
      toast.error('Failed to save whitelisted channel');
    } finally {
      setSubmitting(false);
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
      toast.success(
        newStatus === 'active' 
          ? 'Channel active: new shorts will be pulled' 
          : 'Channel paused: shorts hidden from public feed'
      );
      // Reload channels to reflect the state change
      setChannels(prev => 
        prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
      );
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
      toast.success(`Success! Imported ${data.totalPulled || 0} shorts for ${name}.`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to import shorts for ${name}`);
    } finally {
      setImportingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteChannel = async (id: string, name: string) => {
    if (!checkMFA()) return;
    if (!confirm(`Are you sure you want to remove ${name} from the whitelist? This will immediately delete all imported shorts from this channel.`)) return;

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
      toast.error('Failed to delete whitelisted channel');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-black text-orange-400">YouTube Channel Whitelist</h1>
          <p className="text-sm text-stone-400 mt-1">
            Manage the list of allowed YouTube channels. Pausing a channel immediately hides its shorts from the public feed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Whitelist and Vetting Form column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Channel Form */}
            <div className="p-6 border border-orange-900/20 bg-[#2a1a08]/30 rounded-3xl space-y-4">
              <h2 className="text-lg font-bold text-stone-200">Whitelist New Channel</h2>
              
              <div className="flex gap-2">
                <Input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Paste channel URL or handle (e.g. @BhajanMarg)"
                  disabled={resolving || submitting}
                  className="rounded-xl border-orange-900/30 bg-[#2a1a08]/50 text-stone-100"
                />
                <Button
                  onClick={handleResolveChannel}
                  disabled={resolving || submitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl whitespace-nowrap"
                >
                  {resolving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    'Resolve ID'
                  )}
                </Button>
              </div>

              {resolvedChannel && (
                <form onSubmit={handleAddChannel} className="p-4 border border-orange-500/20 bg-[#1b0e06]/60 rounded-2xl space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Resolved Metadata</span>
                    <h3 className="font-bold text-stone-100">{resolvedChannel.channel_name}</h3>
                    <p className="text-xs text-stone-400">ID: {resolvedChannel.channel_id}</p>
                    {resolvedChannel.handle && <p className="text-xs text-stone-400">Handle: {resolvedChannel.handle}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-300">Category</label>
                      <Select 
                        value={category} 
                        onValueChange={(val: any) => setCategory(val)}
                      >
                        <SelectTrigger className="rounded-xl border-orange-900/30 bg-[#2a1a08] text-stone-100">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e130c] border-orange-900/40 text-stone-50">
                          <SelectItem value="bhajan">Bhajan</SelectItem>
                          <SelectItem value="pravachan">Pravachan</SelectItem>
                          <SelectItem value="darshan">Darshan</SelectItem>
                          <SelectItem value="katha">Katha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-300">Internal Notes</label>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Internal curation notes..."
                        className="rounded-xl border-orange-900/30 bg-[#2a1a08] text-stone-100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResolvedChannel(null)}
                      disabled={submitting}
                      className="rounded-xl border-orange-900/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                    >
                      {submitting ? 'Adding...' : 'Confirm Whitelist'}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Channels Table */}
            <div className="border border-orange-900/20 bg-[#2a1a08]/30 rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-orange-900/20 flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-200">Whitelisted Channels ({channels.length})</h2>
                <Button variant="ghost" size="sm" onClick={loadChannels} className="text-stone-400 hover:text-orange-400">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                </div>
              ) : channels.length === 0 ? (
                <p className="text-center py-10 text-stone-500 text-sm">No whitelisted channels yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-orange-900/20 bg-[#1e130c]/30 text-stone-400 uppercase font-semibold">
                        <th className="px-6 py-3">Channel Name</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3">Notes</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-900/10 text-stone-300">
                      {channels.map((chan) => (
                        <tr key={chan.id} className="hover:bg-[#2a1a08]/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-stone-200">{chan.channel_name}</div>
                            <div className="text-[10px] text-stone-500">{chan.handle || chan.channel_id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 capitalize font-medium">
                              {chan.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge 
                              className={
                                chan.status === 'active' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                              }
                            >
                              {chan.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 italic text-stone-400 truncate max-w-[120px]">
                            {chan.notes || '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleChannelStatus(chan.id, chan.status)}
                              className={chan.status === 'active' ? 'text-stone-400 hover:text-orange-400' : 'text-orange-400 hover:text-stone-400'}
                              title={chan.status === 'active' ? 'Pause Channel' : 'Activate Channel'}
                            >
                              {chan.status === 'active' ? (
                                <ToggleRight className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-stone-500" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={importingStates[chan.id]}
                              onClick={() => handleImportShorts(chan.id, chan.channel_name)}
                              className="text-stone-400 hover:text-orange-400"
                              title="Import Shorts"
                            >
                              {importingStates[chan.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChannel(chan.id, chan.channel_name)}
                              className="text-stone-400 hover:text-red-400"
                              title="Delete Channel"
                            >
                              <Trash2 className="w-4 h-4 text-red-500/80 hover:text-red-500" />
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

          {/* Vetting Checklist sidebar column */}
          <div className="space-y-6">
            {/* Static Vetting Checklist */}
            <div className="p-6 border border-orange-900/20 bg-[#2a1a08]/30 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-orange-400">
                <Info className="w-5 h-5" />
                <h3 className="font-serif font-black text-base">Channel Vetting Checklist</h3>
              </div>
              <p className="text-xs text-stone-400">
                Ensure compliance with YouTube terms of service and content quality guidelines before whitelisting a channel.
              </p>
              <ul className="space-y-3 text-xs text-stone-300 list-disc pl-4">
                <li>
                  <strong>Official Status:</strong> Verify if the channel is the official channel of the creator or group.
                </li>
                <li>
                  <strong>Original Content:</strong> Curation should highlight channels hosting original kirtans/pravachans rather than recycled compilation videos.
                </li>
                <li>
                  <strong>Copyright Clearance:</strong> Ensure the channel has full rights over the audio/visual elements used in its kirtans.
                </li>
                <li>
                  <strong>Consistent Activity:</strong> Prioritize channels with active upload histories (e.g. uploaded within the last month).
                </li>
              </ul>
            </div>

            {/* System Info Box */}
            <div className="p-6 border border-amber-500/10 bg-amber-950/20 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-semibold text-xs uppercase tracking-wider">Curation Rationale</h4>
              </div>
              <p className="text-[11px] text-amber-200/70 leading-relaxed">
                Hari Kirtan enforces a strict whitelist model to ensure all vertical video assets are legally embedded directly from authorized creators. All imported shorts are immediately available on the public feed once synchronization is complete.
              </p>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

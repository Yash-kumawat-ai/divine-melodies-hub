import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface BhajanTrack {
  id: number;
  title: string;
  titleHindi?: string;
  singerName: string;
  audio_url?: string;
  audio_duration?: number;
  deityId?: number;
}

interface AudioPlayerProps {
  track: BhajanTrack | null;
  queue?: BhajanTrack[];
  onNext?: () => void;
  onPrevious?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  queue = [],
  onNext,
  onPrevious,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentQuality, setCurrentQuality] = useState<'128' | '192' | '320'>('128');

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error('Play error:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.src = track.audio_url || '';
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Auto-play error:', err));
      }
    }
  }, [track]);

  if (!track) {
    return (
      <div className="bg-gradient-to-r from-saffron-900 to-orange-900 border-t border-saffron-700 p-4 text-center text-muted-foreground">
        Select a bhajan to begin listening
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-saffron-900 to-orange-900 border-t border-saffron-700 p-4 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />

      {/* Track Info */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {track.title}
            </p>
            <p className="text-xs text-orange-200">
              {track.singerName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-200 hover:text-white"
              onClick={() => console.log('Download would be implemented')}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-200 hover:text-white"
              onClick={() => console.log('Share would be implemented')}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 mb-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-orange-200">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Quality Selector */}
          <div className="flex gap-1 text-xs">
            {['128', '192', '320'].map((q) => (
              <button
                key={q}
                onClick={() => setCurrentQuality(q as '128' | '192' | '320')}
                className={`px-2 py-1 rounded transition-colors ${
                  currentQuality === q
                    ? 'bg-white text-saffron-900'
                    : 'bg-saffron-800 text-orange-200 hover:bg-saffron-700'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Play Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="text-orange-200 hover:text-white"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={togglePlay}
              className="bg-white text-saffron-900 hover:bg-orange-100 rounded-full p-2"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="text-orange-200 hover:text-white"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-32">
            <Volume2 className="w-4 h-4 text-orange-200" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
            <span className="text-xs text-orange-200 w-8">{volume}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;

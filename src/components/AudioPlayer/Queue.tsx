import React from 'react';
import { X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QueueItem {
  id: number;
  title: string;
  singerName: string;
}

interface QueueProps {
  items: QueueItem[];
  currentIndex: number;
  onRemoveItem: (index: number) => void;
  onSelectItem: (index: number) => void;
  onClearQueue: () => void;
}

export const Queue: React.FC<QueueProps> = ({
  items,
  currentIndex,
  onRemoveItem,
  onSelectItem,
  onClearQueue,
}) => {
  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur">
        <div>
          <h2 className="font-semibold text-foreground">Up Next</h2>
          <p className="text-xs text-muted-foreground">{items.length} bhajans</p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearQueue}
            className="text-destructive hover:text-destructive/80"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Queue List */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
          <p>Queue is empty. Add bhajans to get started!</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => onSelectItem(index)}
                className={`p-3 rounded-lg cursor-pointer transition-colors group flex items-center justify-between ${
                  index === currentIndex
                    ? 'bg-saffron-100 dark:bg-saffron-900/30'
                    : 'hover:bg-secondary'
                }`}
              >
                <div className="flex-1 min-w-0">
                  {index === currentIndex && (
                    <div className="flex items-center gap-2 mb-1">
                      <Play className="w-3 h-3 text-saffron-600 dark:text-saffron-400 fill-current" />
                      <span className="text-xs font-semibold text-saffron-600 dark:text-saffron-400">
                        Now Playing
                      </span>
                    </div>
                  )}
                  <p className="font-medium text-sm truncate text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.singerName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(index);
                  }}
                  className="text-muted-foreground hover:text-destructive ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default Queue;

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
  active: string[];
  onToggle: (value: string) => void;
}

interface FilterPanelProps {
  sections: FilterSection[];
  onClearAll: () => void;
}

export default function FilterPanel({ sections, onClearAll }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const activeFilterCount = sections.reduce((sum, s) => sum + s.active.length, 0);

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filter count and clear button */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium text-primary">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
          </span>
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        </div>
      )}

      {/* Filter sections */}
      <div className="space-y-2 border border-border rounded-lg overflow-hidden">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`border-b border-border last:border-b-0 ${
              index === 0 ? '' : 'border-t-0'
            }`}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              aria-expanded={expandedSections.has(section.id)}
            >
              <span className="font-semibold text-sm">{section.title}</span>
              <motion.div
                animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedSections.has(section.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-3 bg-muted/30 border-t border-border space-y-2"
                >
                  {section.options.map(option => {
                    const isActive = section.active.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => section.onToggle(option.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {option.color && (
                          <div
                            className={`w-3 h-3 rounded-full ${option.color}`}
                          />
                        )}
                        <span className="flex-1 text-left">{option.label}</span>
                        {isActive && (
                          <span className="text-xs font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

import { Plus, Loader2 } from 'lucide-react';
import { Deity, useDeities } from '@/hooks/useDeities';
import { useLanguage } from '@/hooks/useLanguage';

interface DeitySelectProps {
  onDeitySelect: (deity: Deity) => void;
  onAddNewDeity: () => void;
}

export default function DeitySelector({ onDeitySelect, onAddNewDeity }: DeitySelectProps) {
  const { deities: allDeities, loading } = useDeities();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-center mb-8">{t('selectGodForBhajan')}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {allDeities.map((deity) => (
          <button
            key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id}`}
            onClick={() => {
              onDeitySelect(deity);
            }}
            className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg"
          >
            {/* Deity Image */}
            <div className="w-full h-44 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
              {deity.emoji}
            </div>

            {/* Deity Info */}
            <div className="p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h4 className="font-bold text-lg">{deity.name}</h4>
                {deity.isCustom && (
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {deity.description || 'Devotional deity'}
              </p>
            </div>
          </button>
        ))}

        {/* Add New Deity Card */}
        <button
          onClick={onAddNewDeity}
          className="bg-card rounded-lg border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center p-4 text-center min-h-64 hover:bg-primary/5"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Plus className="w-7 h-7 text-primary" />
          </div>
          <h4 className="font-bold text-base mb-2">{t('addAnotherGod')}</h4>
          <p className="text-sm text-muted-foreground">
            {t('addDeityHint')}
          </p>
        </button>
      </div>
    </div>
  );
}

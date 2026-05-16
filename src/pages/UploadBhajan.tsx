import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DeitySelector from '@/components/Upload/DeitySelector';
import AddDeity from '@/components/Upload/AddDeity';
import LyricsUpload from '@/components/Upload/FileUpload';
import BhajanForm from '@/components/Upload/BhajanForm';
import LoginForm from '@/components/Auth/LoginForm';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Deity } from '@/hooks/useDeities';

type Step = 'deity' | 'addDeity' | 'lyrics' | 'details';

interface SelectedDeity {
  id?: number;
  name: string;
  emoji: string;
  description?: string;
  imageUrl?: string;
}

export default function UploadBhajan() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('deity');
  const [selectedDeity, setSelectedDeity] = useState<SelectedDeity | null>(null);
  const [lyricsUrl, setLyricsUrl] = useState('');
  const [lyricsType, setLyricsType] = useState<'image' | 'text'>('image');
  const [lyricsContent, setLyricsContent] = useState('');
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-warm py-12 px-4 rounded-lg max-w-md mx-auto mb-8 text-center"
          >
            <h1 className="text-3xl font-bold mb-2">{t('addBhajan')}</h1>
            <p className="text-muted-foreground">
              {t('shareCommunity')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="container mx-auto max-w-md px-4"
          >
            <LoginForm />
          </motion.div>
        </div>
      </div>
    );
  }

  const handleDeitySelect = (deity: Deity) => {
    setSelectedDeity({
      id: deity.id,
      name: deity.name,
      emoji: deity.emoji,
      description: deity.description,
      imageUrl: deity.imageUrl,
    });
    setStep('lyrics');
  };

  const handleAddNewDeity = () => {
    setStep('addDeity');
  };

  const handleDeityAdded = (deity: any) => {
    setSelectedDeity(deity);
    setStep('lyrics');
  };

  const handleLyricsSelect = (url: string, type: 'image' | 'text', content: string) => {
    setLyricsUrl(url);
    setLyricsType(type);
    setLyricsContent(content);
    setStep('details');
  };

  const handleUploadSuccess = () => {
    navigate('/');
  };

  const getStepNumber = () => {
    if (step === 'deity') return 1;
    if (step === 'addDeity') return 1;
    if (step === 'lyrics') return 2;
    if (step === 'details') return 3;
    return 1;
  };

  return (
    <div>
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold mb-2">{t('addBhajan')}</h1>
            <p className="text-muted-foreground">
              {t('shareCommunity')}
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[t('god'), t('lyrics'), t('details')].map((label, idx) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      getStepNumber() >= idx + 1
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm font-medium ml-3">{label}</p>
                  {idx < 2 && (
                    <div className="w-12 h-0.5 bg-muted ml-4 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {step === 'deity' && (
              <div className="space-y-6">
                <DeitySelector onDeitySelect={handleDeitySelect} onAddNewDeity={handleAddNewDeity} />
              </div>
            )}

            {step === 'addDeity' && (
              <div className="space-y-6">
                <AddDeity
                  onDeityAdded={handleDeityAdded}
                  onBack={() => setStep('deity')}
                />
              </div>
            )}

            {step === 'lyrics' && selectedDeity && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-2">{selectedDeity.emoji}</div>
                  <h2 className="text-2xl font-bold mb-2">{selectedDeity.name}</h2>
                  <p className="text-muted-foreground">Add lyrics for this bhajan</p>
                </div>

                <LyricsUpload onLyricsSelect={handleLyricsSelect} />

                <div className="text-center">
                  <button
                    onClick={() => setStep('deity')}
                    className="text-primary hover:underline text-sm"
                  >
                    ← {t('changeGod')}
                  </button>
                </div>
              </div>
            )}

            {step === 'details' && selectedDeity && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-8">Bhajan Information</h2>
                <BhajanForm
                  lyrics={lyricsContent}
                  imageUrl={lyricsUrl}
                  deityId={selectedDeity.id}
                  deityName={selectedDeity.name}
                  onSuccess={handleUploadSuccess}
                  onBack={() => setStep('lyrics')}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

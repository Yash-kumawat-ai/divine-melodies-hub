import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import FileUpload from '@/components/Upload/FileUpload';
import TextExtractor from '@/components/Upload/TextExtractor';
import BhajanForm from '@/components/Upload/BhajanForm';
import LoginForm from '@/components/Auth/LoginForm';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function UploadBhajan() {
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'upload' | 'extract' | 'form'>('upload');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-warm py-12 px-4 rounded-lg max-w-md mx-auto mb-8 text-center"
          >
            <h1 className="text-3xl font-bold mb-2">Upload Bhajan</h1>
            <p className="text-muted-foreground">
              Save and share bhajans with our community
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
        <Footer />
      </div>
    );
  }

  const handleFileSelect = (url: string, preview: string) => {
    setUploadedImageUrl(url);
    setUploadedImagePreview(preview);
    setCurrentStep('extract');
  };

  const handleExtractText = (text: string) => {
    setExtractedText(text);
    setCurrentStep('form');
  };

  const handleUploadSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {['Upload', 'Lyrics', 'Details'].map((step, idx) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      (currentStep === 'upload' && idx <= 0) ||
                      (currentStep === 'extract' && idx <= 1) ||
                      (currentStep === 'form' && idx <= 2)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm font-medium ml-3">{step}</p>
                  {idx < 2 && (
                    <div className="w-12 h-0.5 bg-muted ml-4 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'upload' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Upload Bhajan Photo
                </h2>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onLoading={setIsImageLoading}
                />
              </div>
            )}

            {currentStep === 'extract' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Enter Bhajan Lyrics
                </h2>
                <TextExtractor
                  imageUrl={uploadedImagePreview}
                  onExtract={handleExtractText}
                  onBack={() => {
                    setCurrentStep('upload');
                    setUploadedImageUrl('');
                    setUploadedImagePreview('');
                  }}
                />
              </div>
            )}

            {currentStep === 'form' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Bhajan Information
                </h2>
                <BhajanForm
                  lyrics={extractedText}
                  imageUrl={uploadedImageUrl}
                  onSuccess={handleUploadSuccess}
                  onBack={() => setCurrentStep('extract')}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

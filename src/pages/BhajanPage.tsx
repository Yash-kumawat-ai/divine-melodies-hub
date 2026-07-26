import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bhajans as staticBhajans, type Bhajan } from '@/data/bhajans';
import BhajanDetailModal from '@/components/BhajanDetailModal';
import NotFound from '@/pages/NotFound';

export default function BhajanPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const bhajan = useMemo(() => {
    if (!slug) return null;
    return (
      staticBhajans.find((b) => b.slug === slug || String(b.id) === slug) || null
    );
  }, [slug]);

  if (!bhajan) {
    return <NotFound />;
  }

  return (
    <BhajanDetailModal
      bhajan={bhajan}
      isOpen={true}
      onClose={() => navigate(-1)}
      allBhajans={staticBhajans}
      onSelectBhajan={(selected) => {
        navigate(`/bhajan/${selected.slug || selected.id}`, { replace: true });
      }}
    />
  );
}

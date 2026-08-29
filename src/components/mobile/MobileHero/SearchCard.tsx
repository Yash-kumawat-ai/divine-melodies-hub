import SearchBar from '@/components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { prefetchSearchPage } from '@/lib/prefetchSearch';
import { useEffect } from 'react';

export function SearchCard() {
  const navigate = useNavigate();

  useEffect(() => {
    prefetchSearchPage();
  }, []);

  return (
    <div 
      onMouseEnter={() => prefetchSearchPage()}
      onTouchStart={() => prefetchSearchPage()}
      className="w-full"
    >
      <SearchBar 
        readOnly 
        onClick={() => navigate('/search')} 
        onMicClick={() => navigate('/search?voice=1')}
      />
    </div>
  );
}

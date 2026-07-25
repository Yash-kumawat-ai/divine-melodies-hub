import SearchBar from '@/components/SearchBar';
import { useNavigate } from 'react-router-dom';

export function SearchCard() {
  const navigate = useNavigate();
  return <SearchBar readOnly onClick={() => navigate('/search')} />;
}

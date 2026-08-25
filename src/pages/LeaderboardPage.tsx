import { useNavigate, useSearchParams } from "react-router-dom";
import JapaLeaderboardView from "@/components/meditation/JapaLeaderboardView";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPath = searchParams.get("returnPath");

  const handleBack = () => {
    if (returnPath) navigate(returnPath);
    else navigate("/meditation/mantra-japa");
  };

  return (
    <div className="min-h-screen">
      <JapaLeaderboardView onBack={handleBack} />
    </div>
  );
}

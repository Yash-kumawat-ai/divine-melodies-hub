import { useSearchParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import KirtanAIChatCore from "@/components/kirtan/KirtanAIChatCore";
import { resolveNaradActionPath } from "@/lib/narad/naradIntents";

export function RedirectKirtanToNarad() {
  const { search } = useLocation();
  return <Navigate to={`/narad-ai${search}`} replace />;
}

export default function KirtanAIPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") || "";

  return (
    <KirtanAIChatCore
      variant="page"
      initialQuery={initialQuery}
      onNaradAction={(action) => {
        if (action.kind === "bhajan_search") return;
        const path = resolveNaradActionPath(action);
        if (path) navigate(path);
      }}
    />
  );
}

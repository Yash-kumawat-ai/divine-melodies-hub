import AIAssistantModal from "./AIAssistantModal";
import { bhajans } from "@/data/bhajans";
import { useAIModal } from "@/hooks/useAIModal";
import { useDeities } from "@/hooks/useDeities";

export default function AIAssistantModalHost() {
  const { isOpen, closeAI } = useAIModal();
  const { deities } = useDeities();

  return (
    <AIAssistantModal
      allBhajans={bhajans}
      allDeities={(deities || []).map((d) => ({
        id: d.id ?? 0,
        name: d.name,
        nameHindi: d.nameHindi ?? d.name,
      }))}
      isOpen={isOpen}
      onClose={closeAI}
      onBhajanSelect={() => {}}
    />
  );
}

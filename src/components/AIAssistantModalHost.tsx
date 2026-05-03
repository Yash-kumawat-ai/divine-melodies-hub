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
      allDeities={deities || []}
      isOpen={isOpen}
      onClose={closeAI}
      onBhajanSelect={() => {}}
    />
  );
}

import type { GeneratedCode } from "@/types/chat";
import CodeOutput from "@/components/chat/CodeOutput";

interface GeneratedCodePanelProps {
  code: GeneratedCode;
}

const GeneratedCodePanel = ({ code }: GeneratedCodePanelProps) => {
  return (
    <div className="mt-4 w-full max-w-full overflow-hidden">
      <CodeOutput visible generatedCode={code} />
    </div>
  );
};

export default GeneratedCodePanel;

import { Brain, ChevronDown, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODEL_BY_ID, MODEL_LABELS, MODEL_OPTIONS, type AIModel } from "@/lib/ai-models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModelSelectorProps {
  selected: AIModel;
  onSelect: (model: AIModel) => void;
  compact?: boolean;
}

const ModelIcon = ({ model, className }: { model: AIModel; className?: string }) => {
  const icon = MODEL_BY_ID[model].icon;
  const Icon = icon === "sparkles" ? Sparkles : icon === "brain" ? Brain : Zap;

  return <Icon className={className} size={14} strokeWidth={2} />;
};

export function ModelSelector({ selected, onSelect, compact = false }: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg bg-background/20 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-background/30 dark:text-white",
            compact && "border-none bg-transparent px-0 py-0 text-[13px] text-slate-200 hover:bg-transparent hover:text-white dark:text-slate-200",
          )}
        >
          <span
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary",
              compact && "h-5 w-5 bg-white/10 text-slate-100",
            )}
          >
            <ModelIcon model={selected} className="h-3.5 w-3.5" />
          </span>
          {MODEL_LABELS[selected]}
          <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={10}
        className="min-w-[220px] rounded-xl bg-background/90 p-2 backdrop-blur-xl"
      >
        {MODEL_OPTIONS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:text-white focus:text-white ${model.id === selected ? "bg-accent text-white" : ""}`}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white">
              <ModelIcon model={model.id} className="h-3.5 w-3.5" />
            </span>
            {MODEL_LABELS[model.id]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

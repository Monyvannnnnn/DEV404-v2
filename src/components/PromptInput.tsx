import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center rounded-xl border border-border bg-card glow-border transition-all focus-within:border-primary/60 focus-within:glow-primary">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe a UI component... e.g. 'a responsive pricing table with 3 tiers'"
          className="flex-1 bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none font-sans"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="mr-2 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}

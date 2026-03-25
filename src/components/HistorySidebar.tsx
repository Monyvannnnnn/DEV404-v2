import { Clock, Code2, Plus } from "lucide-react";

export interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: Date;
}

interface HistorySidebarProps {
  history: HistoryItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function HistorySidebar({ history, activeId, onSelect, onNew }: HistorySidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold gradient-text">Dev404</h1>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">v1.0</span>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Generation
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <p className="text-xs text-muted-foreground px-2 py-1 font-medium uppercase tracking-wider">History</p>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-4 text-center">No generations yet</p>
        ) : (
          <div className="space-y-0.5 mt-1">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors truncate ${
                  activeId === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <div className="truncate">{item.prompt}</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

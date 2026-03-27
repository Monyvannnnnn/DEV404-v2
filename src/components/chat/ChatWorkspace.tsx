import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import MessageComposer from "@/components/chat/MessageComposer";
import ChatMessageItem from "@/components/chat/ChatMessageItem";
import type { AIModel } from "@/lib/ai-models";
import type { ChatMessage, ChatThread } from "@/types/chat";

interface ChatWorkspaceProps {
  activeChat: ChatThread | null;
  input: string;
  aiModel: AIModel;
  onInputChange: (value: string) => void;
  onModelChange: (model: AIModel) => void;
  onSend: () => void;
  onCancelEdit: () => void;
  onCopyMessage: (content: string) => void;
  onEditMessage: (message: ChatMessage) => void;
  isGenerating: boolean;
  isEditing: boolean;
}

const ChatWorkspace = ({
  activeChat,
  input,
  aiModel,
  onInputChange,
  onModelChange,
  onSend,
  onCancelEdit,
  onCopyMessage,
  onEditMessage,
  isGenerating,
  isEditing,
}: ChatWorkspaceProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length, activeChat?.messages.at(-1)?.content]);

  return (
    <div className="flex h-full flex-col">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="mx-auto flex min-h-full flex-col py-8 sm:py-12">
          {activeChat?.messages.length ? (
            <div className="flex flex-col gap-8 pb-12">
              {activeChat.messages.map((message) => (
                <ChatMessageItem 
                  key={message.id} 
                  message={message} 
                  onCopy={onCopyMessage} 
                  onEdit={onEditMessage} 
                />
              ))}
              <div ref={endRef} />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-4">
              <div className="w-full max-w-[600px] rounded-xl bg-background/20 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.18)] ring-1 ring-primary/20 backdrop-blur-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles size={32} />
                </div>
                <h2 className="mt-8 text-3xl font-bold tracking-tight text-foreground">
                  What can I help you build?
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground/80">
                  Ask for a dashboard, a landing page, or a complex UI concept. 
                  I'll generate the code and explain the implementation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <MessageComposer
        value={input}
        aiModel={aiModel}
        onChange={onInputChange}
        onModelChange={onModelChange}
        onSend={onSend}
        onCancelEdit={onCancelEdit}
        isGenerating={isGenerating}
        isEditing={isEditing}
      />
    </div>
  );
};

export default ChatWorkspace;

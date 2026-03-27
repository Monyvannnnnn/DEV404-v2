import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/chat/BrandLogo";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWorkspace from "@/components/chat/ChatWorkspace";
import StarBackground from "@/components/chat/StarBackground";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { UseChatAppState } from "@/hooks/use-chat-app";

interface ChatAppShellProps {
  chat: UseChatAppState;
}

const ChatAppShell = ({ chat }: ChatAppShellProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const {
    chats,
    activeChat,
    input,
    setInput,
    aiModel,
    setAiModel,
    search,
    setSearch,
    isGenerating,
    editingMessageId,
    addNewChat,
    selectChat,
    deleteChat,
    renameChat,
    clearHistory,
    copyMessage,
    downloadChat,
    sendMessage,
    startEditing,
    cancelEditing,
  } = chat;

  return (
    <div className="relative flex h-screen w-full overflow-hidden font-sans">
      <StarBackground />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.1),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(190_80%_60%/0.06),transparent_28%)]" />

      <motion.aside
        initial={false}
        animate={{
          width: desktopSidebarOpen ? 260 : 0,
          opacity: desktopSidebarOpen ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-30 hidden h-full shrink-0 overflow-hidden bg-background/20 backdrop-blur-xl lg:block"
      >
        <motion.div
          initial={false}
          animate={{
            x: desktopSidebarOpen ? 0 : -260,
            opacity: desktopSidebarOpen ? 1 : 0.6,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="flex h-full w-[260px] flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-5">
            <BrandLogo showIcon={false} onClick={() => navigate("/")} />
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDesktopSidebarOpen(false)}
              className="rounded-lg p-2 text-muted-foreground/60 hover:text-foreground"
            >
              <PanelLeftClose size={18} />
            </motion.button>
          </div>
          
          <div className="flex-1 overflow-hidden px-3 py-4">
            <ChatSidebar
              chats={chats}
              activeChatId={activeChat?.chatId ?? null}
              search={search}
              onSearchChange={setSearch}
              onNewChat={addNewChat}
              onSelectChat={selectChat}
              onDeleteChat={deleteChat}
              onRenameChat={renameChat}
              onDownloadChat={downloadChat}
              onClearHistory={clearHistory}
            />
          </div>

          <div className="p-5 pt-0">
            <div className="flex items-center justify-between rounded-lg bg-background/20 p-2">
              <span className="pl-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </motion.div>
      </motion.aside>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between bg-transparent px-4 lg:hidden">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg bg-white/5 p-2 text-muted-foreground"
            >
              <Menu size={20} />
            </motion.button>
            <BrandLogo showIcon={false} onClick={() => navigate("/")} />
          </div>
          <ThemeToggle />
        </header>

        <AnimatePresence>
          {!desktopSidebarOpen && (
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              whileHover={{ scale: 1.05, x: 5 }}
              onClick={() => setDesktopSidebarOpen(true)}
              className="fixed left-6 top-6 z-40 hidden rounded-lg bg-background/30 p-3 text-primary shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:block"
              title="Open sidebar"
            >
              <PanelLeftOpen size={20} strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden">
          <div className="mx-auto h-full w-full max-w-[800px]">
            <ChatWorkspace
              activeChat={activeChat}
              input={input}
              aiModel={aiModel}
              onInputChange={setInput}
              onModelChange={setAiModel}
              onSend={sendMessage}
              onCancelEdit={cancelEditing}
              onCopyMessage={copyMessage}
              onEditMessage={startEditing}
              isGenerating={isGenerating}
              isEditing={Boolean(editingMessageId)}
            />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-background/90 p-5 shadow-2xl lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <BrandLogo showIcon={false} onClick={() => navigate("/")} />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground/60"
                >
                  <PanelLeftClose size={20} />
                </button>
              </div>
              <ChatSidebar
                chats={chats}
                activeChatId={activeChat?.chatId ?? null}
                search={search}
                onSearchChange={setSearch}
                onNewChat={() => {
                  addNewChat();
                  setMobileSidebarOpen(false);
                }}
                onSelectChat={(chatId) => {
                  selectChat(chatId);
                  setMobileSidebarOpen(false);
                }}
                onDeleteChat={deleteChat}
                onRenameChat={renameChat}
                onDownloadChat={downloadChat}
                onClearHistory={clearHistory}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAppShell;

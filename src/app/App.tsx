import { OfficeScene } from '@/components/scene/OfficeScene';
import { LazyChatPanel } from '@/components/ui/LazyChatPanel';
import { OfficeHud } from '@/components/ui/OfficeHud';
import { OfficeNavigation } from '@/components/ui/OfficeNavigation';
import { ZoomControls } from '@/components/ui/ZoomControls';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useChatStore } from '@/stores/chat.store';
import './App.css';

export function App() {
  useBootstrap();
  const isChatOpen = useChatStore((state) => state.isPanelOpen);

  return (
    <div className={`app${isChatOpen ? ' app--chat-open' : ''}`}>
      <main className="app__viewport">
        <OfficeScene />
        <div className="app__vignette" aria-hidden />
        <OfficeHud />
        <OfficeNavigation />
        <ZoomControls />
      </main>
      <LazyChatPanel />
    </div>
  );
}
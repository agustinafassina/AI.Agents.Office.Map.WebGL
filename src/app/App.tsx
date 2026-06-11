import { OfficeScene } from '@/components/scene/OfficeScene';
import { LazyChatPanel } from '@/components/ui/LazyChatPanel';
import { OfficeHud } from '@/components/ui/OfficeHud';
import { PeerConversationBanner } from '@/components/ui/PeerConversationBanner';
import { OfficeNavigation } from '@/components/ui/OfficeNavigation';
import { ZoomControls } from '@/components/ui/ZoomControls';
import { FollowAgentButton } from '@/components/ui/FollowAgentButton';
import { useBootstrap, useChatPanelPreload } from '@/hooks/useBootstrap';
import { useChatStore } from '@/stores/chat.store';
import './App.css';

export function App() {
  useBootstrap();
  useChatPanelPreload();
  const isChatOpen = useChatStore((state) => state.isPanelOpen);

  return (
    <div className={`app${isChatOpen ? ' app--chat-open' : ''}`}>
      <main className="app__viewport">
        <OfficeScene />
        <div className="app__vignette" aria-hidden />
        <PeerConversationBanner />
        <OfficeHud />
        <OfficeNavigation />
        <FollowAgentButton />
        <ZoomControls />
      </main>
      <LazyChatPanel />
    </div>
  );
}
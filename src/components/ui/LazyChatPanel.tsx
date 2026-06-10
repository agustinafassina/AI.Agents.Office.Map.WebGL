import { useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { preloadChatAssets } from '@/utils/preloadChatPanel';
import { ChatPanel } from './ChatPanel';

export function LazyChatPanel() {
  const isOpen = useChatStore((state) => state.isPanelOpen);

  useEffect(() => {
    preloadChatAssets();
  }, []);

  return (
    <div
      className={`chat-panel-host${isOpen ? ' chat-panel-host--open' : ''}`}
      aria-hidden={!isOpen}
    >
      <ChatPanel />
    </div>
  );
}

export { preloadChatMarkdown, preloadChatAssets } from '@/utils/preloadChatPanel';

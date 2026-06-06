import { lazy, Suspense } from 'react';
import { useChatStore } from '@/stores/chat.store';

const ChatPanel = lazy(() =>
  import('@/components/ui/ChatPanel').then((module) => ({ default: module.ChatPanel })),
);

export function LazyChatPanel() {
  const isOpen = useChatStore((state) => state.isPanelOpen);

  if (!isOpen) return null;

  return (
    <Suspense fallback={null}>
      <ChatPanel />
    </Suspense>
  );
}

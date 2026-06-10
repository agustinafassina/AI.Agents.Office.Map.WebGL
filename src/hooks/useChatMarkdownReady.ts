import { useEffect, useState } from 'react';
import { registerChatMessageBody } from '@/components/ui/LazyChatMessageBody';
import {
  isChatMarkdownReady,
  preloadChatMarkdown,
  subscribeChatMarkdownReady,
} from '@/utils/preloadChatPanel';

export function useChatMarkdownReady(): boolean {
  const [ready, setReady] = useState(isChatMarkdownReady);

  useEffect(() => {
    if (isChatMarkdownReady()) {
      void preloadChatMarkdown().then((module) => {
        registerChatMessageBody(module.ChatMessageBody);
      });
      return;
    }

    const unsubscribe = subscribeChatMarkdownReady(() => setReady(true));
    void preloadChatMarkdown().then((module) => {
      registerChatMessageBody(module.ChatMessageBody);
    });

    return unsubscribe;
  }, []);

  return ready;
}

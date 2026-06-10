type ChatMessageBodyModule = typeof import('@/components/ui/ChatMessageBody');

const STORAGE_KEY = 'office-map-chat-conversations';

let chatMarkdownPreload: Promise<ChatMessageBodyModule> | null = null;
let markdownReady = false;
const markdownListeners = new Set<() => void>();

function hasStoredAssistantMessages(): boolean {
  if (typeof localStorage === 'undefined') return false;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return raw.includes('"assistant"');
  } catch {
    return false;
  }
}

function markMarkdownReady(): void {
  if (markdownReady) return;
  markdownReady = true;
  markdownListeners.forEach((listener) => listener());
}

export function isChatMarkdownReady(): boolean {
  return markdownReady;
}

export function subscribeChatMarkdownReady(listener: () => void): () => void {
  markdownListeners.add(listener);
  return () => {
    markdownListeners.delete(listener);
  };
}

export function preloadChatMarkdown(): Promise<ChatMessageBodyModule> {
  if (!chatMarkdownPreload) {
    chatMarkdownPreload = import('@/components/ui/ChatMessageBody').then((module) => {
      markMarkdownReady();
      return module;
    });
  }
  return chatMarkdownPreload;
}

export function preloadChatAssets(options?: { markdown?: boolean }): void {
  if (options?.markdown ?? hasStoredAssistantMessages()) {
    void preloadChatMarkdown();
  }
}

export function scheduleChatMarkdownPreload(delayMs = 0): () => void {
  const run = () => {
    preloadChatAssets({ markdown: hasStoredAssistantMessages() });
  };

  if (typeof window === 'undefined') {
    return () => undefined;
  }

  if (delayMs > 0) {
    const timer = window.setTimeout(run, delayMs);
    return () => window.clearTimeout(timer);
  }

  if (hasStoredAssistantMessages()) {
    run();
    return () => undefined;
  }

  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timer = setTimeout(run, 1800);
  return () => clearTimeout(timer);
}

import { useTranslation } from '@/i18n';
import { useChatMarkdownReady } from '@/hooks/useChatMarkdownReady';
import type { ChatMessageBody as ChatMessageBodyType } from './ChatMessageBody';

let loadedMessageBody: typeof ChatMessageBodyType | null = null;

interface LazyChatMessageBodyProps {
  content: string;
  streaming?: boolean;
}

function PlainAssistantBody({ content }: { content: string }) {
  return <p className="chat-panel__message-text chat-panel__message-text--plain">{content}</p>;
}

export function LazyChatMessageBody({ content, streaming = false }: LazyChatMessageBodyProps) {
  const { t } = useTranslation();
  const markdownReady = useChatMarkdownReady();
  const MessageBody = markdownReady ? loadedMessageBody : null;

  if (!content && streaming) {
    return (
      <p className="chat-message-body chat-message-body--typing" aria-live="polite">
        {t('chat.thinking')}
        <span className="chat-message-body__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
    );
  }

  if (!content) return null;

  if (!MessageBody) {
    return <PlainAssistantBody content={content} />;
  }

  return <MessageBody content={content} streaming={streaming} />;
}

export function registerChatMessageBody(
  component: typeof ChatMessageBodyType,
): void {
  loadedMessageBody = component;
}

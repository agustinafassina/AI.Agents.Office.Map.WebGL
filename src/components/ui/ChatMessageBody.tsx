import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '@/i18n';
import './ChatMessageBody.css';

interface ChatMessageBodyProps {
  content: string;
  streaming?: boolean;
}

export function ChatMessageBody({ content, streaming = false }: ChatMessageBodyProps) {
  const { t } = useTranslation();

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

  return (
    <div className="chat-message-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      {streaming && (
        <span className="chat-message-body__cursor" aria-hidden="true" />
      )}
    </div>
  );
}
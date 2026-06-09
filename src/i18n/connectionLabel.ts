import { useTranslation } from '@/i18n';
import type { ConnectionStatus } from '@/types/chat';

const CONNECTION_KEYS = {
  idle: 'connection.idle',
  connecting: 'connection.connecting',
  connected: 'connection.connected',
  error: 'connection.error',
} as const satisfies Record<ConnectionStatus, `connection.${ConnectionStatus}`>;

export function useConnectionLabel(status: ConnectionStatus): string {
  const { t } = useTranslation();
  return t(CONNECTION_KEYS[status]);
}

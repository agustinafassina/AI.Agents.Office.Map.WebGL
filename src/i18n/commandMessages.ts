import type { AppLocale } from './types';
import { translate } from './translate';
import type { TranslationKey } from './types';
import { COMMAND_HINT_KEYS } from './navZones';
import type { AgentChatCommand } from '@/utils/chatAgentCommands';

const COMMAND_ACK_KEYS: Record<AgentChatCommand, TranslationKey> = {
  coffee: 'commands.ackCoffee',
  relax: 'commands.ackRelax',
  desk: 'commands.ackDesk',
};

export function getCommandAck(locale: AppLocale, command: AgentChatCommand): string {
  return translate(locale, COMMAND_ACK_KEYS[command]);
}

export function getCommandFailed(locale: AppLocale): string {
  return translate(locale, 'chat.commandFailed');
}

export function getSendFailed(locale: AppLocale): string {
  return translate(locale, 'chat.sendFailed');
}

export function getCommandHints(locale: AppLocale): string[] {
  return COMMAND_HINT_KEYS.map((key) => translate(locale, key));
}

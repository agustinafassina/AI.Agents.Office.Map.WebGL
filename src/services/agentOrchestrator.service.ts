import { env } from '@/config/env';
import { getMockPeerReply } from '@/config/mock.models';
import { liteLLMService } from '@/services/litellm';
import { useAgentInteractionLogStore } from '@/stores/agentInteractionLog.store';
import { useAgentsStore } from '@/stores/agents.store';
import { useConversationVisualsStore } from '@/stores/conversationVisuals.store';
import { useLocaleStore } from '@/stores/locale.store';
import type { AgentDefinition } from '@/types/agent';
import type { ChatMessage } from '@/types/chat';
import type { PeerTranscriptTurn } from '@/types/agentInteraction';
import { truncateForBubble } from '@/utils/peerChatText';
import { readLocale } from '@/utils/localeStorage';

const MAX_PEER_TURNS = 4;
const TURN_PAUSE_MS = 500;
const PEER_EXTEND_SEC = 5;
const PEER_TAIL_SEC = 3;
const BUBBLE_UPDATE_MS = 120;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildHistoryForSpeaker(
  transcript: PeerTranscriptTurn[],
  speakerId: string,
): ChatMessage[] {
  return transcript.map((turn, index) => ({
    id: `peer-${index}`,
    role: turn.agentId === speakerId ? 'assistant' : 'user',
    content: turn.content,
    timestamp: turn.timestamp,
  }));
}

function buildPeerSystemPrompt(
  speaker: AgentDefinition,
  peer: AgentDefinition,
  locale: 'en' | 'es',
): string {
  const base = speaker.systemPrompt?.trim() ?? '';
  const peerLine =
    locale === 'es'
      ? `Estás en una charla informal en la oficina con ${peer.name} (${peer.role}). Respondé en 1 o 2 oraciones, en personaje, sin markdown ni listas.`
      : `You are in a casual office chat with ${peer.name} (${peer.role}). Reply in 1–2 sentences, in character, with no markdown or bullet lists.`;

  return base ? `${base}\n\n${peerLine}` : peerLine;
}

function buildOpenerUserPrompt(peer: AgentDefinition, locale: 'en' | 'es'): string {
  if (locale === 'es') {
    return `Ves a ${peer.name} (${peer.role}) cerca en la oficina. Iniciá una charla laboral breve y natural.`;
  }
  return `You notice ${peer.name} (${peer.role}) nearby in the office. Start a brief, natural work conversation.`;
}

function buildContinueUserPrompt(locale: 'en' | 'es'): string {
  return locale === 'es'
    ? 'Seguí la conversación de forma breve y natural.'
    : 'Continue the conversation briefly and naturally.';
}

function isPeerConversationActive(peerConvId: string): boolean {
  return useConversationVisualsStore
    .getState()
    .peerConversations.some((chat) => chat.id === peerConvId);
}

async function streamText(
  full: string,
  onDelta: (chunk: string) => void,
): Promise<void> {
  const tokens = full.match(/\S+\s*|\s+/g) ?? [full];
  for (const token of tokens) {
    if (token.length === 0) continue;
    onDelta(token);
    await delay(28 + Math.random() * 24);
  }
}

class AgentOrchestratorService {
  private queue: Array<() => Promise<void>> = [];
  private running = false;

  enqueuePeerChat(peerConvId: string, agentAId: string, agentBId: string): void {
    this.queue.push(() => this.runPeerChat(peerConvId, agentAId, agentBId));
    void this.drain();
  }

  private async drain(): Promise<void> {
    if (this.running) return;
    this.running = true;
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) await job();
    }
    this.running = false;
  }

  private async runPeerChat(
    peerConvId: string,
    agentAId: string,
    agentBId: string,
  ): Promise<void> {
    const definitions = useAgentsStore.getState().definitions;
    const agentA = definitions.find((agent) => agent.id === agentAId);
    const agentB = definitions.find((agent) => agent.id === agentBId);
    if (!agentA || !agentB) return;

    const locale = useLocaleStore.getState().locale ?? readLocale();
    const sessionId = `peer-${peerConvId}`;
    const log = useAgentInteractionLogStore.getState();
    const visuals = useConversationVisualsStore.getState();

    log.startSession(sessionId, 'peer', [
      { id: agentA.id, name: agentA.name },
      { id: agentB.id, name: agentB.name },
    ]);

    const transcript: PeerTranscriptTurn[] = [];
    const speakers = [agentA, agentB, agentA, agentB].slice(0, MAX_PEER_TURNS);

    for (let turnIndex = 0; turnIndex < speakers.length; turnIndex++) {
      const speaker = speakers[turnIndex];
      const peer = speaker.id === agentA.id ? agentB : agentA;
      const isOpener = turnIndex === 0;
      const history = buildHistoryForSpeaker(transcript, speaker.id);
      const userContent = isOpener
        ? buildOpenerUserPrompt(peer, locale)
        : buildContinueUserPrompt(locale);
      const systemPrompt = buildPeerSystemPrompt(speaker, peer, locale);

      const visualActive = isPeerConversationActive(peerConvId);
      if (visualActive) {
        visuals.setPeerGenerating(peerConvId, speaker.id);
        visuals.extendPeerConversation(peerConvId, PEER_EXTEND_SEC);
      }

      let streamed = '';
      let lastBubbleUpdate = 0;
      const onDelta = (chunk: string) => {
        streamed += chunk;
        if (!isPeerConversationActive(peerConvId)) return;
        const now = performance.now();
        if (now - lastBubbleUpdate < BUBBLE_UPDATE_MS) return;
        lastBubbleUpdate = now;
        visuals.setPeerSpeech(peerConvId, speaker.id, truncateForBubble(streamed), true);
      };

      let content = '';
      try {
        if (env.useMockLitellm) {
          await delay(180 + Math.random() * 220);
          content = getMockPeerReply(speaker.name, peer.name, isOpener, locale);
          await streamText(content, onDelta);
        } else {
          const result = await liteLLMService.sendMessageStream({
            model: speaker.modelId,
            agentName: speaker.name,
            systemPrompt,
            history,
            userContent,
            onDelta,
          });
          content = result.content || streamed;
        }
      } catch {
        content = getMockPeerReply(speaker.name, peer.name, isOpener, locale);
        if (isPeerConversationActive(peerConvId)) {
          await streamText(content, onDelta);
        }
      }

      const finalContent = truncateForBubble(content || streamed, 240);
      if (!finalContent) break;

      transcript.push({
        agentId: speaker.id,
        agentName: speaker.name,
        content: finalContent,
        timestamp: Date.now(),
      });

      log.appendTurn(sessionId, {
        fromId: speaker.id,
        fromName: speaker.name,
        toId: peer.id,
        toName: peer.name,
        content: finalContent,
      });

      if (isPeerConversationActive(peerConvId)) {
        visuals.setPeerSpeech(peerConvId, speaker.id, finalContent, false);
        visuals.setPeerGenerating(peerConvId, null);
        visuals.extendPeerConversation(peerConvId, PEER_EXTEND_SEC);
      }

      if (turnIndex < speakers.length - 1) {
        await delay(TURN_PAUSE_MS);
      }
    }

    log.endSession(sessionId);
    if (isPeerConversationActive(peerConvId)) {
      visuals.finalizePeerConversation(peerConvId, PEER_TAIL_SEC);
    }
  }
}

export const agentOrchestrator = new AgentOrchestratorService();

import { create } from 'zustand';
import type {
  AgentInteractionSession,
  AgentInteractionTurn,
} from '@/types/agentInteraction';

const MAX_SESSIONS = 80;

function iso(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

function formatSessionsAsTxt(sessions: AgentInteractionSession[]): string {
  const lines: string[] = [
    'AI Agents Office — agent interaction log',
    `Exported: ${iso(Date.now())}`,
    '',
  ];

  for (const session of sessions) {
    lines.push(
      `[${iso(session.startedAt)}] SESSION ${session.id} | type=${session.type} | agents=${session.agentNames.join(', ')}`,
    );
    for (const turn of session.turns) {
      lines.push(
        `[${iso(turn.timestamp)}] ${turn.fromName} (${turn.fromId}) → ${turn.toName}: ${turn.content}`,
      );
    }
    if (session.endedAt) {
      lines.push(`[${iso(session.endedAt)}] SESSION ${session.id} ended`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

interface AgentInteractionLogStore {
  sessions: AgentInteractionSession[];
  turnCount: number;
  startSession: (
    id: string,
    type: AgentInteractionSession['type'],
    agents: Array<{ id: string; name: string }>,
  ) => void;
  appendTurn: (
    sessionId: string,
    turn: Omit<AgentInteractionTurn, 'timestamp'> & { timestamp?: number },
  ) => void;
  endSession: (sessionId: string) => void;
  clearLog: () => void;
  exportTxt: () => string;
  downloadTxt: () => void;
}

export const useAgentInteractionLogStore = create<AgentInteractionLogStore>((set, get) => ({
  sessions: [],
  turnCount: 0,

  startSession: (id, type, agents) => {
    const session: AgentInteractionSession = {
      id,
      type,
      startedAt: Date.now(),
      endedAt: null,
      agentIds: agents.map((agent) => agent.id),
      agentNames: agents.map((agent) => agent.name),
      turns: [],
    };

    set((state) => ({
      sessions: [...state.sessions, session].slice(-MAX_SESSIONS),
    }));
  },

  appendTurn: (sessionId, turn) => {
    const entry: AgentInteractionTurn = {
      ...turn,
      timestamp: turn.timestamp ?? Date.now(),
    };

    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, turns: [...session.turns, entry] }
          : session,
      ),
      turnCount: state.turnCount + 1,
    }));
  },

  endSession: (sessionId) => {
    const endedAt = Date.now();
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, endedAt } : session,
      ),
    }));
  },

  clearLog: () => set({ sessions: [], turnCount: 0 }),

  exportTxt: () => formatSessionsAsTxt(get().sessions),

  downloadTxt: () => {
    const content = get().exportTxt();
    if (!content.trim()) return;

    const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `office-agent-log-${stamp}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  },
}));

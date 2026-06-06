import { COFFEE_LOUNGE_CENTER_Z } from '@/components/scene/furniture/coffeeLoungeConstants';
import type { ChatAnchor } from '@/types/scene';
import { CHAT_ARRIVAL_RADIUS, isNearChatAnchor } from '@/config/agentZones.config';

export const COFFEE_BAR_MAX_SERVING = 2;

const COFFEE_BAR_FRONT_Z = COFFEE_LOUNGE_CENTER_Z + 0.22;
const COFFEE_BAR_COUNTER: [number, number, number] = [0.1, 0, COFFEE_LOUNGE_CENTER_Z + 0.12];

const SERVE_SLOTS: [number, number, number][] = [
  [-0.18, 0, COFFEE_BAR_FRONT_Z],
  [0.32, 0, COFFEE_BAR_FRONT_Z],
];

const QUEUE_LINE_X = 0.06;
const QUEUE_START_Z = COFFEE_BAR_FRONT_Z + 0.52;
const QUEUE_SPACING_Z = 0.44;

function rotationTowardBar(position: [number, number, number]): number {
  return Math.atan2(
    COFFEE_BAR_COUNTER[0] - position[0],
    COFFEE_BAR_COUNTER[2] - position[2],
  );
}

export function getCoffeeBarQueuePosition(queueIndex: number): [number, number, number] {
  if (queueIndex < SERVE_SLOTS.length) {
    return SERVE_SLOTS[queueIndex];
  }
  const lineIndex = queueIndex - SERVE_SLOTS.length;
  return [QUEUE_LINE_X, 0, QUEUE_START_Z + lineIndex * QUEUE_SPACING_Z];
}

export function getCoffeeBarQueueAnchor(queueIndex: number): ChatAnchor {
  const position = getCoffeeBarQueuePosition(queueIndex);
  return {
    position,
    rotation: rotationTowardBar(position),
    posture: 'stand',
  };
}

export function isAtCoffeeBarQueueSlot(
  position: [number, number, number],
  queueIndex: number,
): boolean {
  return isNearChatAnchor(position, getCoffeeBarQueueAnchor(queueIndex));
}

export { CHAT_ARRIVAL_RADIUS as COFFEE_QUEUE_ARRIVAL_RADIUS };

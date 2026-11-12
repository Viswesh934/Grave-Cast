/**
 * useSeance - Tabs of the same site see each other and pass whispers
 * @module hooks/useSeance
 */

import { useCallback, useRef, useState } from 'react';
import {
  SEANCE_CHANNEL,
  SEANCE_HEARTBEAT_MS,
  SEANCE_MESSAGE_LIMIT,
  SEANCE_NAME_LIMIT,
  SEANCE_TEXT_LIMIT,
  SEANCE_TIMEOUT_MS,
  createSpiritId,
  nameSpirit,
  readSeanceWire,
  seanceCapability,
  type SeanceWire,
} from '../grimoire/rites/seance';
import { useRite, type RiteReturn } from './useRite';

/**
 * Options for {@link useSeance}.
 */
export interface SeanceOptions {
  /** The channel to meet on. Tabs only see others on the same channel. @default SEANCE_CHANNEL */
  channel?: string;
  /** What other tabs call this one. @default a name picked from this tab's id */
  name?: string;
}

/** One tab in the circle. */
export interface SeanceSpirit {
  id: string;
  name: string;
  /** Whether it is this tab. */
  self: boolean;
}

/** One whisper passed around the circle. */
export interface SeanceWhisper {
  id: string;
  from: string;
  name: string;
  text: string;
  /** When it was sent, in ms since 1970. */
  at: number;
  /** Whether this tab sent it. */
  self: boolean;
}

/** The open channel, while the séance is held. */
export interface SeanceHandle {
  post: (message: SeanceWire) => void;
  close: () => void;
}

/**
 * Return value of {@link useSeance}.
 */
export interface SeanceReturn extends RiteReturn<SeanceHandle> {
  /** This tab's id and name. */
  selfId: string;
  selfName: string;
  /** Every tab in the circle, this one first. Empty unless active. */
  spirits: SeanceSpirit[];
  /** Whispers, newest first. */
  whispers: SeanceWhisper[];
  /** The value every tab shares, or `null` when nobody has set one. */
  sharedValue: string | null;
  /** Sends a whisper to every tab. Returns `false` when it was empty, too long, or not active. */
  whisper: (text: string) => boolean;
  /** Changes the shared value in every tab. */
  setValue: (value: string) => void;
}

interface Shared {
  value: string | null;
  valueAt: number;
  from: string;
}

const NOBODY: Shared = { value: null, valueAt: 0, from: '' };

/** Whether `incoming` should replace `current`: the latest write wins, ties go to the larger id. */
const wins = (incoming: Shared, current: Shared): boolean =>
  incoming.valueAt > current.valueAt || (incoming.valueAt === current.valueAt && incoming.from > current.from);

/**
 * Holds a séance with a BroadcastChannel: every open tab of this site on the
 * same channel joins one circle. Tabs say hello, answer each other, check in
 * every {@link SEANCE_HEARTBEAT_MS}, and leave the circle when they close or
 * fall silent. Whispers and one shared value travel between them, and every
 * message from another tab is checked before it is used.
 *
 * Nothing leaves the device: the channel only reaches tabs of the same site
 * in the same browser.
 *
 * @example
 * ```tsx
 * const seance = useSeance();
 * <button onClick={seance.start}>Join</button>
 * <p>{seance.spirits.length} present</p>
 * ```
 */
export const useSeance = (options: SeanceOptions = {}): SeanceReturn => {
  const { channel = SEANCE_CHANNEL } = options;
  const [selfId] = useState(createSpiritId);
  const selfName = (options.name ?? nameSpirit(selfId)).slice(0, SEANCE_NAME_LIMIT);
  const [others, setOthers] = useState<Record<string, { name: string; seen: number }>>({});
  const [whispers, setWhispers] = useState<SeanceWhisper[]>([]);
  const [shared, setShared] = useState<Shared>(NOBODY);
  const sharedRef = useRef<Shared>(NOBODY);
  const nameRef = useRef(selfName);
  nameRef.current = selfName;

  const adopt = useCallback((incoming: Shared) => {
    if (!wins(incoming, sharedRef.current)) return;
    sharedRef.current = incoming;
    setShared(incoming);
  }, []);

  const addWhisper = useCallback((entry: SeanceWhisper) => {
    setWhispers((previous) => [entry, ...previous].slice(0, SEANCE_MESSAGE_LIMIT));
  }, []);

  const rite = useRite<SeanceHandle>(seanceCapability, {
    start: ({ signal }) => {
      const broadcast = new BroadcastChannel(channel);
      const post = (message: SeanceWire) => broadcast.postMessage(message);
      const here = (): SeanceWire => ({
        type: 'here',
        from: selfId,
        name: nameRef.current,
        value: sharedRef.current.value,
        valueAt: sharedRef.current.valueAt,
      });
      const see = (from: string, name: string) =>
        setOthers((previous) => ({ ...previous, [from]: { name, seen: Date.now() } }));

      broadcast.onmessage = (event: MessageEvent) => {
        const message = readSeanceWire(event.data);
        if (!message || message.from === selfId) return;
        switch (message.type) {
          case 'hello':
            see(message.from, message.name);
            post(here());
            break;
          case 'here':
            see(message.from, message.name);
            if (message.value !== null) adopt({ value: message.value, valueAt: message.valueAt, from: message.from });
            break;
          case 'whisper':
            see(message.from, message.name);
            addWhisper({ id: `${message.from}-${message.at}`, from: message.from, name: message.name, text: message.text, at: message.at, self: false });
            break;
          case 'value':
            adopt({ value: message.value, valueAt: message.valueAt, from: message.from });
            break;
          case 'bye':
            setOthers((previous) => {
              const { [message.from]: _gone, ...rest } = previous;
              return rest;
            });
            break;
        }
      };

      const heartbeat = setInterval(() => {
        post(here());
        const now = Date.now();
        setOthers((previous) => {
          const kept = Object.entries(previous).filter(([, spirit]) => now - spirit.seen <= SEANCE_TIMEOUT_MS);
          return kept.length === Object.keys(previous).length ? previous : Object.fromEntries(kept);
        });
      }, SEANCE_HEARTBEAT_MS);
      signal.addEventListener('abort', () => clearInterval(heartbeat));

      post({ type: 'hello', from: selfId, name: nameRef.current });
      return {
        post,
        close: () => {
          clearInterval(heartbeat);
          broadcast.onmessage = null;
          try {
            post({ type: 'bye', from: selfId });
          } catch {
            // Already closed.
          }
          broadcast.close();
        },
      };
    },
    stop: (handle) => {
      handle.close();
      setOthers({});
    },
  });

  const active = rite.status === 'active';
  const handle = rite.value;

  const whisper = useCallback(
    (text: string): boolean => {
      const trimmed = text.trim();
      if (!handle || trimmed === '' || trimmed.length > SEANCE_TEXT_LIMIT) return false;
      const at = Date.now();
      handle.post({ type: 'whisper', from: selfId, name: nameRef.current, text: trimmed, at });
      addWhisper({ id: `${selfId}-${at}`, from: selfId, name: nameRef.current, text: trimmed, at, self: true });
      return true;
    },
    [handle, selfId, addWhisper]
  );

  const setValue = useCallback(
    (value: string) => {
      if (!handle) return;
      // Never earlier than the value it replaces, so this write always wins here.
      const valueAt = Math.max(Date.now(), sharedRef.current.valueAt + 1);
      const next = { value, valueAt, from: selfId };
      sharedRef.current = next;
      setShared(next);
      handle.post({ type: 'value', from: selfId, value, valueAt });
    },
    [handle, selfId]
  );

  const spirits: SeanceSpirit[] = active
    ? [{ id: selfId, name: selfName, self: true }, ...Object.entries(others).map(([id, spirit]) => ({ id, name: spirit.name, self: false }))]
    : [];

  return { ...rite, selfId, selfName, spirits, whispers, sharedValue: shared.value, whisper, setValue };
};

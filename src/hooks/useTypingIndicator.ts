import { useEffect, useRef } from 'react';
import { PresenceService } from '@/services/presenceService';

/**
 * Signals the current user is typing in {chatId}. Call `notify()` on every
 * key stroke; the hook debounces server writes and automatically clears
 * the indicator a few seconds after the last key.
 */
export function useTypingIndicator(chatId: string | undefined, uid: string | undefined) {
  const lastWriteRef = useRef(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup when the screen unmounts or chat changes.
  useEffect(() => {
    return () => {
      if (chatId && uid) PresenceService.setTyping(chatId, uid, false).catch(() => {});
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [chatId, uid]);

  const notify = () => {
    if (!chatId || !uid) return;
    const now = Date.now();
    // Throttle writes to once every 2 seconds.
    if (now - lastWriteRef.current > 2_000) {
      PresenceService.setTyping(chatId, uid, true).catch(() => {});
      lastWriteRef.current = now;
    }
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => {
      PresenceService.setTyping(chatId, uid, false).catch(() => {});
      lastWriteRef.current = 0;
    }, 3_000);
  };

  return { notify };
}

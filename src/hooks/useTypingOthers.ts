import { useEffect, useState } from 'react';
import { PresenceService } from '@/services/presenceService';

/** Subscribe to which other participants are currently typing in {chatId}.
 * Returns an array of uids (never includes the viewer). Stale entries
 * older than ~4s are filtered out automatically by the service. */
export function useTypingOthers(
  chatId: string | undefined,
  viewerUid: string | undefined,
): string[] {
  const [typing, setTyping] = useState<string[]>([]);

  useEffect(() => {
    if (!chatId || !viewerUid) {
      setTyping([]);
      return;
    }
    setTyping([]);
    const unsub = PresenceService.listenToTyping(chatId, viewerUid, setTyping);
    return unsub;
  }, [chatId, viewerUid]);

  return typing;
}
